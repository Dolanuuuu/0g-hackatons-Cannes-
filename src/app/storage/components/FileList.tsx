"use client";

import { FileText, Trash2, ExternalLink, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type StoredFile } from "@/shared/lib/database";

interface FileListProps {
  files: StoredFile[];
  isLoading: boolean;
  onDelete: (id: number) => void;
  onChatWith?: (file: StoredFile) => void;
}

export function FileList({ files, isLoading, onDelete, onChatWith }: FileListProps) {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getExplorerUrl = (rootHash: string, network: string) => {
    const base = network === 'mainnet'
      ? 'https://storagescan.0g.ai'
      : 'https://storagescan-galileo.0g.ai';
    return `${base}/file?hash=${rootHash}`;
  };

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  if (files.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No files uploaded yet</p>
          <p className="text-sm text-muted-foreground/70">Upload a file to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg">Your Files ({files.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-secondary/50"
          >
            <FileText className="h-8 w-8 shrink-0 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{file.file_name}</p>
              <p className="text-xs text-muted-foreground">
                {formatSize(file.file_size)} · {formatDate(file.uploaded_at)} · {file.network}
              </p>
              <p className="text-xs text-muted-foreground/70 font-mono truncate">
                {file.root_hash}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {onChatWith && file.text_content && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onChatWith(file)}
                  title="Chat with this document"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              )}
              <a
                href={getExplorerUrl(file.root_hash, file.network)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="icon" className="h-8 w-8" title="View on explorer">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => file.id && onDelete(file.id)}
                title="Remove from list"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
