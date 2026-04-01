"use client";

import { useAccount } from "wagmi";
import { HardDrive } from "lucide-react";
import { useStorage } from "@/shared/hooks/useStorage";
import { FileUpload } from "./components/FileUpload";
import { FileList } from "./components/FileList";

export default function StoragePage() {
  const { isConnected } = useAccount();
  const { files, isUploading, uploadError, isLoading, upload, removeFile } =
    useStorage("testnet");

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <HardDrive className="h-16 w-16 text-muted-foreground/50" />
        <h2 className="text-2xl font-semibold">0G Storage</h2>
        <p className="text-muted-foreground max-w-md">
          Connect your wallet to upload files to decentralized storage on the 0G
          Network.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <HardDrive className="h-6 w-6" />
          0G Storage
        </h1>
        <p className="text-muted-foreground mt-1">
          Upload files to decentralized storage. 95% cheaper than AWS, censorship-resistant.
        </p>
      </div>

      <FileUpload
        onUpload={upload}
        isUploading={isUploading}
        error={uploadError}
      />

      <FileList
        files={files}
        isLoading={isLoading}
        onDelete={removeFile}
      />
    </div>
  );
}
