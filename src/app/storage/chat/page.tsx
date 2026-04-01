"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { ArrowLeft, FileText, Send, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { use0GBroker } from "@/shared/hooks/use0GBroker";
import { useProviderManagement } from "@/app/inference/hooks/useProviderManagement";
import { dbManager, type StoredFile } from "@/shared/lib/database";
import { ProviderSelector } from "@/app/inference/chat/components/ProviderSelector";
import type { Provider } from "@/shared/types/broker";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export default function DocumentChatPage() {
  const searchParams = useSearchParams();
  const fileId = searchParams.get("fileId");
  const { isConnected, address } = useAccount();
  const { broker, isInitializing } = use0GBroker();

  const {
    providers,
    selectedProvider,
    serviceMetadata,
    providerBalance,
    providerBalanceNeuron,
    providerPendingRefund,
    setSelectedProvider,
    refreshProviderBalance,
  } = useProviderManagement(broker);

  const [file, setFile] = useState<StoredFile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load file from database
  useEffect(() => {
    if (!fileId || !address) return;
    const id = parseInt(fileId, 10);
    if (isNaN(id)) return;

    dbManager.getFiles(address, "testnet").then((files) => {
      // Also check mainnet
      dbManager.getFiles(address, "mainnet").then((mainnetFiles) => {
        const allFiles = [...files, ...mainnetFiles];
        const found = allFiles.find((f) => f.id === id);
        if (found) {
          setFile(found);
          // Initialize messages with document context
          setMessages([
            {
              role: "system",
              content: buildSystemPrompt(found),
            },
          ]);
        }
      });
    });
  }, [fileId, address]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const buildSystemPrompt = (f: StoredFile): string => {
    const truncated = f.text_content?.slice(0, 40000) ?? "";
    return `You are an intelligent document assistant. The user has uploaded a document to decentralized storage on the 0G Network. Analyze and answer questions about this document.

DOCUMENT METADATA:
- File: ${f.file_name}
- Size: ${(f.file_size / 1024).toFixed(1)} KB
- Stored on: 0G ${f.network} (root hash: ${f.root_hash})

DOCUMENT CONTENT:
---
${truncated}
---

Instructions:
- Answer questions based on the document content above.
- If the user asks something not covered in the document, say so clearly.
- Be concise and reference specific parts of the document when possible.
- You can summarize, extract key points, compare sections, or answer factual questions about the content.`;
  };

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, []);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !selectedProvider || !broker) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setIsStreaming(true);
    setError(null);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    let firstContentReceived = false;

    try {
      let metadata = serviceMetadata;
      if (!metadata) {
        metadata = await broker.inference.getServiceMetadata(
          selectedProvider.address
        );
        if (!metadata) throw new Error("Failed to get service metadata");
      }

      const apiMessages = [
        ...messages
          .filter((m) => m.role !== "system")
          .map((m) => ({ role: m.role, content: m.content })),
        { role: userMsg.role, content: userMsg.content },
      ];

      // Include system message for the API
      const systemMsg = messages.find((m) => m.role === "system");
      const fullMessages = systemMsg
        ? [{ role: "system" as const, content: systemMsg.content }, ...apiMessages]
        : apiMessages;

      const headers = await broker.inference.getRequestHeaders(
        selectedProvider.address,
        JSON.stringify(fullMessages)
      );

      const { endpoint, model } = metadata;
      const response = await fetch(`${endpoint}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({
          messages: fullMessages,
          model,
          stream: true,
        }),
        signal,
      });

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(body || `HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response reader");

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const decoder = new TextDecoder();
      let buffer = "";
      let completeContent = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                if (!firstContentReceived) {
                  setIsLoading(false);
                  firstContentReceived = true;
                }
                completeContent += content;
                setMessages((prev) =>
                  prev.map((msg, i) =>
                    i === prev.length - 1
                      ? { ...msg, content: completeContent }
                      : msg
                  )
                );
              }
            } catch {
              // skip invalid JSON
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      if (!firstContentReceived) setIsLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        setIsLoading(false);
        setIsStreaming(false);
        abortControllerRef.current = null;
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to send message");
      setMessages((prev) =>
        prev.filter((m) => m.role !== "assistant" || m.content !== "")
      );
      if (!firstContentReceived) setIsLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [input, selectedProvider, broker, serviceMetadata, messages]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (input.trim() && !isLoading) sendMessage();
      }
    },
    [input, isLoading, sendMessage]
  );

  const isProcessing = isLoading || isStreaming;

  // Memoize visible messages (exclude system)
  const visibleMessages = useMemo(
    () => messages.filter((m) => m.role !== "system"),
    [messages]
  );

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <FileText className="h-16 w-16 text-muted-foreground/50" />
        <h2 className="text-2xl font-semibold">Connect Wallet</h2>
        <p className="text-muted-foreground max-w-md">
          Connect your wallet to chat with your documents.
        </p>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading document...</p>
      </div>
    );
  }

  if (!file.text_content) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <FileText className="h-16 w-16 text-muted-foreground/50" />
        <h2 className="text-2xl font-semibold">No Text Content</h2>
        <p className="text-muted-foreground max-w-md">
          This file doesn&apos;t have extractable text content. Try uploading a
          PDF, TXT, or MD file.
        </p>
        <a href="/storage">
          <Button variant="outline">Back to Storage</Button>
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl flex flex-col h-[calc(100vh-130px)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-border">
        <a href="/storage">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </a>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold flex items-center gap-2 truncate">
            <FileText className="h-5 w-5 shrink-0 text-primary" />
            {file.file_name}
          </h1>
          <p className="text-xs text-muted-foreground">
            {(file.file_size / 1024).toFixed(1)} KB · {file.network} · Chat
            powered by 0G Compute
          </p>
        </div>
        <div className="shrink-0">
          <ProviderSelector
            providers={providers}
            selectedProvider={selectedProvider}
            onProviderSelect={setSelectedProvider}
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
            isInitializing={isInitializing}
            providerBalance={providerBalance}
            providerBalanceNeuron={providerBalanceNeuron}
            providerPendingRefund={providerPendingRefund}
            onAddFunds={() => {}}
          />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {visibleMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <FileText className="h-12 w-12 text-primary/30" />
            <div>
              <p className="font-medium text-foreground">
                Ask anything about this document
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Summarize it, extract key points, or ask specific questions.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {[
                "Summarize this document",
                "What are the key points?",
                "Extract the main topics",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-3 py-1.5 rounded-full border border-border text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {visibleMessages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground"
              }`}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {msg.content || (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking...
                  </span>
                )}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Input */}
      <div className="pt-3 pb-2 border-t border-border">
        {!selectedProvider && (
          <p className="text-xs text-muted-foreground mb-2 text-center">
            Select an AI provider above to start chatting
          </p>
        )}
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              requestAnimationFrame(() => {
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 120) + "px";
              });
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              isProcessing
                ? "AI is responding..."
                : "Ask about the document..."
            }
            disabled={isProcessing || !selectedProvider}
            className="flex-1 px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none bg-background text-foreground disabled:bg-muted disabled:cursor-not-allowed transition-all"
            style={{ minHeight: "44px", maxHeight: "120px" }}
            rows={1}
          />
          <button
            onClick={isStreaming ? stopGeneration : sendMessage}
            disabled={!isStreaming && (!input.trim() || isProcessing || !selectedProvider)}
            className={`h-11 px-4 rounded-xl font-medium flex items-center gap-2 transition-all text-sm shadow-md cursor-pointer ${
              isStreaming
                ? "bg-destructive hover:bg-destructive/90 text-white"
                : "bg-gradient-brand hover:shadow-glow disabled:opacity-50 text-white"
            }`}
          >
            {isStreaming ? (
              <Square className="w-4 h-4 fill-current" />
            ) : isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
