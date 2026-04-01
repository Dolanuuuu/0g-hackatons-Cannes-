# 0G DocMind - Project Plan

## Project Overview
**0G DocMind** is a decentralized AI document intelligence platform. Users upload documents (PDF, TXT, MD) to 0G Storage and chat with them using AI powered by 0G Compute. All data stays on decentralized infrastructure — private, censorship-resistant, 95% cheaper than cloud.

## Architecture
- **Frontend**: Next.js 15 (static export) + React 19 + Tailwind CSS
- **Wallet**: RainbowKit + wagmi
- **Storage**: 0G Decentralized Storage (@0gfoundation/0g-ts-sdk)
- **Compute**: 0G Compute Inference (@0glabs/0g-serving-broker)
- **Local DB**: Dexie (IndexedDB) for file metadata + chat history
- **PDF Parsing**: pdfjs-dist (browser-side)

## Tech Stack
- [x] Next.js 15 with static export
- [x] TypeScript strict mode
- [x] Tailwind CSS + shadcn/ui components
- [x] 0G TS SDK for storage
- [x] 0G Serving Broker for compute inference
- [x] pdfjs-dist for PDF text extraction
- [x] Dexie for IndexedDB persistence

## Implementation Phases

### Phase 1: Setup & Foundation [DONE]
- [x] Fork compute-web-ui as base project
- [x] Configure 0G network connection (Galileo testnet)
- [x] Wallet integration (RainbowKit + MetaMask)
- [x] Sidebar navigation with Storage route
- [x] Build passes with static export

### Phase 2: 0G Storage Integration [DONE]
- [x] Storage service (upload files via ZgBlob)
- [x] Database schema with files table
- [x] useStorage React hook
- [x] FileUpload component (drag & drop)
- [x] FileList component with explorer links
- [x] Webpack polyfills for 0G SDK browser compatibility

### Phase 3: Document Chat with AI [DONE]
- [x] PDF text extraction (pdfjs-dist, browser-side)
- [x] Support for TXT, MD, CSV, JSON, XML, HTML
- [x] Document chat page (/storage/chat)
- [x] System prompt injection with document content
- [x] "Chat with document" button in file list
- [x] Streaming AI responses via 0G Compute

### Phase 4: Polish & Demo [DONE]
- [x] Homepage rebranded as "0G DocMind"
- [x] Feature cards highlighting document workflow
- [x] Build verified, all routes working

## Security Considerations
- [x] Environment variables for secrets (.env.example provided)
- [x] No private keys in code
- [x] Input validation on file uploads
- [x] Text content truncated to 50K chars to prevent prompt injection overflow

## Acceptance Criteria
- [x] App builds without errors (static export)
- [x] Upload files to 0G Storage
- [x] Extract text from PDF/TXT/MD files
- [x] Chat with documents using 0G Compute AI
- [x] All routes working: /, /storage, /storage/chat, /inference, /wallet
- [x] Demo-ready
