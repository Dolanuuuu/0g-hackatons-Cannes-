# 0G DocMind

**Decentralized AI Document Intelligence** — Upload documents to 0G Storage, chat with them using 0G Compute AI. Private, censorship-resistant, 95% cheaper than cloud.

Built for the [0G Hackathon Cannes 2025](https://vibe-event.fly.dev/).

## What it does

1. **Upload** PDF, TXT, MD files to 0G decentralized storage
2. **Chat** with your documents — ask questions, summarize, extract insights
3. **Generate** images from text prompts via decentralized GPU providers
4. **Transcribe** audio with speech-to-text AI

All powered by the 0G Network — no centralized servers, no data harvesting, your wallet is your account.

## Live Demo

> **[docmind.vercel.app](https://docmind.vercel.app)** *(update with your actual URL)*

## Features

| Feature | Route | 0G Service |
|---------|-------|------------|
| Document Upload | `/storage` | 0G Storage |
| Chat with Documents | `/storage/chat` | 0G Storage + Compute |
| AI Chat | `/inference/chat` | 0G Compute |
| Image Generation | `/inference/image-gen` | 0G Compute |
| Speech to Text | `/inference/speech-to-text` | 0G Compute |
| Wallet Management | `/wallet` | 0G Chain |

## Architecture

```
Browser (Next.js + MetaMask)
    |
    ├── 0G Storage ── Upload/download documents (Indexer API)
    ├── 0G Compute ── AI inference via broker SDK (OpenAI-compatible)
    └── 0G Chain ──── Ledger smart contracts for payments
```

**Zero backend.** Everything runs client-side. The wallet signs transactions directly with 0G smart contracts.

## Tech Stack

- **Framework:** Next.js 15, React 19, TypeScript (strict)
- **Styling:** Tailwind CSS + shadcn/ui
- **Wallet:** RainbowKit + wagmi
- **Storage SDK:** `@0gfoundation/0g-ts-sdk`
- **Compute SDK:** `@0glabs/0g-serving-broker`
- **PDF Parsing:** pdfjs-dist (browser-side)
- **Local DB:** Dexie (IndexedDB) for file metadata + chat history

## Getting Started

### Prerequisites

- Node.js 18+
- MetaMask or any Web3 wallet
- 0G testnet tokens ([faucet](https://faucet.0g.ai) — 0.1 0G/day)

### Install & Run

```bash
git clone https://github.com/Dolanuuuu/0g-hackatons-Cannes-.git
cd 0g-hackatons-Cannes-
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Deploy to Vercel

Push to GitHub, import on [vercel.com](https://vercel.com), deploy. No env vars required for basic usage.

## 0G Network Config

| | Testnet (Galileo) | Mainnet |
|---|---|---|
| Chain ID | 16602 | 16661 |
| RPC | `https://evmrpc-testnet.0g.ai` | `https://evmrpc.0g.ai` |
| Explorer | [chainscan-galileo.0g.ai](https://chainscan-galileo.0g.ai) | [chainscan.0g.ai](https://chainscan.0g.ai) |
| Storage Explorer | [storagescan-galileo.0g.ai](https://storagescan-galileo.0g.ai) | — |
| Faucet | [faucet.0g.ai](https://faucet.0g.ai) | — |

## Project Structure

```
src/
├── app/
│   ├── inference/          # AI chat, image gen, speech-to-text
│   ├── storage/            # File upload + document chat
│   ├── wallet/             # Account & fund management
│   └── page.tsx            # Homepage
├── shared/
│   ├── hooks/              # use0GBroker, useStorage, etc.
│   ├── lib/                # storage.ts, database, document parser
│   └── config/             # wagmi chain config
└── components/ui/          # Reusable UI components (shadcn)
```

## How it uses 0G

- **0G Storage** — Documents uploaded via `ZgBlob`, Merkle tree verified, stored on decentralized nodes
- **0G Compute** — AI inference through the broker SDK, OpenAI-compatible streaming API
- **0G Chain** — Smart contract ledger for depositing funds and paying providers
- **Testnet Galileo** — All transactions on chain ID 16602

## License

MIT
