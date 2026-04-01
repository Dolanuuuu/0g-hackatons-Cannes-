# Plan — 0G DocMind

## Project Overview
Decentralized AI document assistant: upload files to 0G Storage, chat with them via 0G Compute. Fork of compute-web-ui with Storage integration.

## Architecture
- **Frontend**: Next.js 15 + React 19 + TailwindCSS + shadcn/ui
- **Wallet**: RainbowKit + wagmi
- **AI**: 0G Compute Network (@0glabs/0g-serving-broker)
- **Storage**: 0G Storage (@0gfoundation/0g-ts-sdk)
- **Chain**: 0G Testnet Galileo (Chain ID 16602)

## Implementation Phases

### Phase 1: Setup & Fork
- [x] Fork compute-web-ui
- [x] Install dependencies
- [x] Verify it runs locally
- [x] Fix Google Fonts -> local fonts
- [x] Commit checkpoint

### Phase 2: 0G Storage Integration
- [ ] Install @0gfoundation/0g-ts-sdk
- [ ] Configure Vite polyfills for browser (fs, crypto)
- [ ] Create storage service (upload/download)
- [ ] Build file upload component (drag & drop)
- [ ] Save root hashes to IndexedDB (Dexie)
- [ ] Build file library UI (list of uploaded files)
- [ ] Test upload + download flow
- [ ] Commit checkpoint

### Phase 3: Document Chat
- [ ] Parse uploaded files (extract text from PDF/TXT/MD)
- [ ] Inject document context into AI prompt
- [ ] Add "Chat with this document" mode in UI
- [ ] Test end-to-end: upload -> parse -> chat
- [ ] Commit checkpoint

### Phase 4: Polish & Demo
- [ ] Custom branding (logo, colors, name)
- [ ] Improve onboarding for document flow
- [ ] Error handling & loading states
- [ ] Mobile responsive check
- [ ] Final commit & push

## Acceptance Criteria
- [ ] User can connect wallet
- [ ] User can upload a file to 0G Storage
- [ ] User can see their uploaded files
- [ ] User can chat with AI about their documents
- [ ] App runs without errors
- [ ] Demo-ready in under 3 minutes
