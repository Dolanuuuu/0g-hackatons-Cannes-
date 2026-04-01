"use client";

import { useState, useCallback, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { dbManager, type StoredFile } from '../lib/database';
import { uploadFile as uploadToStorage, type NetworkType, type UploadResult } from '../lib/storage';

export function useStorage(network: NetworkType = 'testnet') {
  const { address } = useAccount();
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadFiles = useCallback(async () => {
    if (!address) {
      setFiles([]);
      setIsLoading(false);
      return;
    }
    try {
      const stored = await dbManager.getFiles(address, network);
      setFiles(stored);
    } catch (err) {
      console.error('Failed to load files:', err);
    } finally {
      setIsLoading(false);
    }
  }, [address, network]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const upload = useCallback(async (file: File): Promise<UploadResult | null> => {
    if (!address) {
      setUploadError('Please connect your wallet first.');
      return null;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Extract text content for PDF/TXT files
      let textContent: string | undefined;
      if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        textContent = await file.text();
      }

      const result = await uploadToStorage(file, network);

      await dbManager.saveFile({
        root_hash: result.rootHash,
        tx_hash: result.txHash,
        file_name: result.fileName,
        file_size: result.fileSize,
        wallet_address: address,
        network,
        uploaded_at: result.uploadedAt,
        text_content: textContent,
      });

      await loadFiles();
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setUploadError(msg);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [address, network, loadFiles]);

  const removeFile = useCallback(async (id: number) => {
    await dbManager.deleteFile(id);
    await loadFiles();
  }, [loadFiles]);

  return {
    files,
    isUploading,
    uploadError,
    isLoading,
    upload,
    removeFile,
    refresh: loadFiles,
  };
}
