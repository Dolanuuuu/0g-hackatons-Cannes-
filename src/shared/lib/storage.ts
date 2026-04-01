import { Indexer } from '@0gfoundation/0g-ts-sdk';
import { BrowserProvider, JsonRpcSigner } from 'ethers';

const INDEXER_URLS = {
  testnet: [
    'https://indexer-storage-testnet-turbo.0g.ai',
    'https://indexer-storage-testnet-standard.0g.ai',
  ],
  mainnet: [
    'https://indexer-storage-turbo.0g.ai',
    'https://indexer-storage-standard.0g.ai',
  ],
} as const;

const RPC_URLS = {
  testnet: 'https://evmrpc-testnet.0g.ai',
  mainnet: 'https://evmrpc.0g.ai',
} as const;

export type NetworkType = 'testnet' | 'mainnet';

export interface UploadResult {
  rootHash: string;
  txHash: string;
  fileName: string;
  fileSize: number;
  uploadedAt: number;
}

function getIndexerUrls(network: NetworkType): readonly string[] {
  return INDEXER_URLS[network];
}

function getRpcUrl(network: NetworkType): string {
  return RPC_URLS[network];
}

export async function getEthersSigner(): Promise<JsonRpcSigner> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No wallet detected. Please install MetaMask.');
  }
  const provider = new BrowserProvider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  return provider.getSigner();
}

export async function uploadFile(
  file: File,
  network: NetworkType = 'testnet'
): Promise<UploadResult> {
  const { Blob: ZgBlob } = await import('@0gfoundation/0g-ts-sdk');

  const signer = await getEthersSigner();
  const rpcUrl = getRpcUrl(network);
  const indexerUrls = getIndexerUrls(network);

  const zgBlob = new ZgBlob(file);
  const [tree, treeErr] = await zgBlob.merkleTree();
  if (treeErr !== null) {
    throw new Error(`Merkle tree error: ${treeErr}`);
  }

  const rootHash = tree?.rootHash() ?? '';

  let lastErr: unknown;
  for (const url of indexerUrls) {
    try {
      const indexer = new Indexer(url);
      const [tx, uploadErr] = await indexer.upload(zgBlob, rpcUrl, signer);
      if (uploadErr !== null) {
        lastErr = uploadErr;
        continue;
      }
      const txHash = 'txHash' in tx ? (tx.txHash as string) : '';
      return {
        rootHash,
        txHash,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: Date.now(),
      };
    } catch (err) {
      lastErr = err;
    }
  }

  throw new Error(`Upload failed on all indexers: ${lastErr}`);
}

export async function uploadText(
  text: string,
  fileName: string,
  network: NetworkType = 'testnet'
): Promise<UploadResult> {
  const { MemData } = await import('@0gfoundation/0g-ts-sdk');

  const signer = await getEthersSigner();
  const rpcUrl = getRpcUrl(network);
  const indexerUrls = getIndexerUrls(network);

  const data = new TextEncoder().encode(text);
  const memData = new MemData(data);

  const [tree, treeErr] = await memData.merkleTree();
  if (treeErr !== null) {
    throw new Error(`Merkle tree error: ${treeErr}`);
  }

  const rootHash = tree?.rootHash() ?? '';

  let lastErr: unknown;
  for (const url of indexerUrls) {
    try {
      const indexer = new Indexer(url);
      const [tx, uploadErr] = await indexer.upload(memData, rpcUrl, signer);
      if (uploadErr !== null) {
        lastErr = uploadErr;
        continue;
      }
      const txHash = 'txHash' in tx ? (tx.txHash as string) : '';
      return {
        rootHash,
        txHash,
        fileName,
        fileSize: data.byteLength,
        uploadedAt: Date.now(),
      };
    } catch (err) {
      lastErr = err;
    }
  }

  throw new Error(`Upload failed on all indexers: ${lastErr}`);
}
