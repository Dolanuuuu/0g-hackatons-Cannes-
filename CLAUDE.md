# Project Rules - 0G Hackathon Cannes

## Golden Rule
> Plan with the smartest, code with the fastest

## Workflow (MANDATORY)
1. **Plan first** - Never code without a plan. Create/update `plan.md` with architecture, checklist, and acceptance criteria
2. **Break it down** - One feature per conversation. Complete -> Test -> Next
3. **Commit early, commit often** - Checkpoint before big changes, commit after each working feature
4. **Test as you go** - After each feature: compile? runs? works? edge cases?

## Code Style
- TypeScript strict mode
- Functional components (React)
- Tailwind CSS for styling
- File names: kebab-case
- Components: PascalCase
- API routes: /api/v1/resource

## Don'ts
- Never use `any` type
- No console.log in production code
- Don't install new dependencies without asking
- Don't skip planning phase
- Don't build mega-features in one shot
- Don't over-engineer security for MVP (but always cover basics: rate limiting, input validation)

## Security Checklist (Every Feature)
- [ ] Input validation on user-facing endpoints
- [ ] No secrets in code (use .env)
- [ ] Rate limiting on public APIs
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitize outputs)

## 0G Network Context

### Testnet (Galileo)
- Chain ID: 16602 (0x40EA)
- RPC: https://evmrpc-testnet.0g.ai
- Explorer: https://chainscan-galileo.0g.ai
- Storage Explorer: https://storagescan-galileo.0g.ai
- Faucet: https://faucet.0g.ai
- Storage Indexer: https://indexer-storage-testnet-turbo.0g.ai

### Mainnet (Aristotle)
- Chain ID: 16661 (0x4125)
- RPC: https://evmrpc.0g.ai
- Explorer: https://chainscan.0g.ai
- Storage Indexer: https://indexer-storage-turbo.0g.ai

### Key Contracts (Testnet)
- Flow: 0x22E03a6A89B950F1c82ec5e74F8eCa321a105296
- Mine: 0x00A9E9604b0538e06b268Fb297Df333337f9593b
- Reward: 0xA97B57b4BdFEA2D0a25e535bd849ad4e6C440A69
- DAEntrance: 0xE75A073dA5bb7b0eC622170Fd268f35E675a957B
- Compute Ledger: 0xE70830508dAc0A97e6c087c75f402f9Be669E406
- Compute Inference: 0xa79F4c8311FF93C06b8CfB403690cc987c93F91E
- Compute FineTuning: 0xaC66eBd174435c04F1449BBa08157a707B6fa7b1

### Key Contracts (Mainnet)
- Flow: 0x62D4144dB0F0a6fBBaeb6296c785C71B3D57C526
- Mine: 0xCd01c5Cd953971CE4C2c9bFb95610236a7F414fe
- Reward: 0x457aC76B58ffcDc118AABD6DbC63ff9072880870
- Compute Ledger: 0x2dE54c845Cd948B72D2e32e39586fe89607074E3
- Compute Inference: 0x47340d900bdFec2BD393c626E12ea0656F938d84
- Compute FineTuning: 0x4e3474095518883744ddf135b7E0A23301c7F9c0

### Precompiles (Both Networks)
- DASigners: 0x0000000000000000000000000000000000001000
- WrappedOGBase: 0x0000000000000000000000000000000000001001

### SDKs
- TypeScript: `npm install @0gfoundation/0g-ts-sdk ethers`
- Go: `go get github.com/0gfoundation/0g-storage-client`
- Compute CLI: `pnpm add @0glabs/0g-serving-broker -g`

### Docs & Resources
- Docs: https://docs.0g.ai
- AI Context: https://docs.0g.ai/ai-context
- GitHub: https://github.com/0gfoundation
- Builder Hub: https://build.0g.ai
