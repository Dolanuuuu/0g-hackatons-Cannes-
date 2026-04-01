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

---

## 0G Network Context

### Testnet (Galileo)
- Chain ID: 16602 (0x40EA)
- RPC: https://evmrpc-testnet.0g.ai (dev only, use 3rd party for prod)
- Explorer: https://chainscan-galileo.0g.ai
- Storage Explorer: https://storagescan-galileo.0g.ai
- Faucet: https://faucet.0g.ai (0.1 0G/day)
- Google Faucet: https://cloud.google.com/application/web3/faucet/0g/galileo
- Storage Indexer (Turbo): https://indexer-storage-testnet-turbo.0g.ai

### Mainnet (Aristotle)
- Chain ID: 16661 (0x4125)
- RPC: https://evmrpc.0g.ai
- Explorer: https://chainscan.0g.ai
- Storage Indexer (Turbo): https://indexer-storage-turbo.0g.ai

### Third-Party RPC Providers (recommended for production)
- QuickNode, ThirdWeb, Ankr, dRPC NodeCloud

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

---

## 0G Chain
- EVM-compatible blockchain optimized for AI
- 11,000 TPS per shard, sub-second finality
- Optimized CometBFT consensus
- Compile Solidity with `--evm-version cancun` for compatibility
- Deploy with Hardhat, Foundry, or Remix
- Verify on ChainScan: apiURL = https://chainscan-galileo.0g.ai/open/api

### Hardhat Config
```javascript
module.exports = {
  solidity: { version: "0.8.19", settings: { evmVersion: "cancun" } },
  networks: {
    testnet: { url: "https://evmrpc-testnet.0g.ai", chainId: 16602, accounts: [process.env.PRIVATE_KEY] },
    mainnet: { url: "https://evmrpc.0g.ai", chainId: 16661, accounts: [process.env.PRIVATE_KEY] }
  }
};
```

### MetaMask Add Network (Testnet)
```javascript
await window.ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [{ chainId: '0x40EA', chainName: '0G-Galileo-Testnet',
    nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
    rpcUrls: ['https://evmrpc-testnet.0g.ai'],
    blockExplorerUrls: ['https://chainscan-galileo.0g.ai'] }]
});
```

---

## 0G Storage

### Architecture
- Two-lane system: Data Publishing (metadata/proofs) + Data Storage (actual data with erasure coding)
- Log Layer (immutable, append-only) for large files, ML datasets
- Key-Value Layer (mutable) for databases, profiles, state
- Proof of Random Access (PoRA) consensus
- 200 MBPS retrieval, 95% cheaper than AWS
- Turbo (faster, higher fees) vs Standard (slower, lower fees) networks

### TypeScript SDK
```bash
npm install @0gfoundation/0g-ts-sdk ethers
```

```typescript
import { ZgFile, Indexer, MemData } from '@0gfoundation/0g-ts-sdk';
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('https://evmrpc-testnet.0g.ai');
const signer = new ethers.Wallet('PRIVATE_KEY', provider);
const indexer = new Indexer('https://indexer-storage-testnet-turbo.0g.ai');

// Upload file
const file = await ZgFile.fromFilePath('/path/to/file');
const [tree, treeErr] = await file.merkleTree();
const [tx, uploadErr] = await indexer.upload(file, RPC_URL, signer);
await file.close();
// SAVE tx.rootHash - needed for download!

// Upload in-memory data
const memData = new MemData(new TextEncoder().encode('Hello'));
const [tree2, err2] = await memData.merkleTree();
const [tx2, err3] = await indexer.upload(memData, RPC_URL, signer);

// Download (withProof=true for verification)
const err = await indexer.download(rootHash, '/path/to/output', true);
```

### Browser Support
```typescript
import { Blob as ZgBlob, Indexer } from '@0gfoundation/0g-ts-sdk';
import { BrowserProvider } from 'ethers';

const provider = new BrowserProvider(window.ethereum);
await provider.send('eth_requestAccounts', []);
const signer = await provider.getSigner();
const zgBlob = new ZgBlob(fileInput.files[0]);
const [tree, err] = await zgBlob.merkleTree();
const [tx, uploadErr] = await indexer.upload(zgBlob, RPC_URL, signer);
```
NOTE: Browser downloads don't work with indexer.download() (uses fs). Use StorageNode.downloadSegmentByTxSeq() instead. See starter kit web/src/storage.ts.

### KV Store (TypeScript)
```typescript
import { Batcher, KvClient } from '@0gfoundation/0g-ts-sdk';

// Write
const batcher = new Batcher(1, nodes, flowContract, RPC_URL);
batcher.streamDataBuilder.set(streamId, keyBytes, valueBytes);
const [tx, err] = await batcher.exec();

// Read
const kvClient = new KvClient('<kv_node_url>');
const value = await kvClient.getValue(streamId, ethers.encodeBase64(keyBytes));
```

### Starter Kits
- TypeScript: https://github.com/0gfoundation/0g-storage-ts-starter-kit
- Go: https://github.com/0gfoundation/0g-storage-go-starter-kit

### Vite Config (browser polyfills needed)
SDK imports Node.js modules (fs, crypto). Use vite-plugin-node-polyfills. See starter kit web/vite.config.ts.

---

## 0G Compute

### Overview
- Decentralized GPU marketplace - "Uber for AI computing"
- 90% cheaper than cloud, OpenAI SDK compatible
- Smart contract escrow, ZK-proof settlement
- Supports: Inference (live), Fine-tuning (live), Training (coming soon)
- Rate limit: 30 req/min, 5 concurrent, 5-request burst

### Available Models (Testnet)
| Model | Type | Cost |
|-------|------|------|
| qwen-2.5-7b-instruct | Chatbot | 0.05/0.10 0G per 1M tokens |
| qwen-image-edit-2511 | Image-Edit | 0.005 0G/image |

### Available Models (Mainnet)
| Model | Type | Input/Output Cost (0G per 1M tokens) |
|-------|------|------|
| GLM-5-FP8 | Chatbot | 1 / 3.2 |
| deepseek-chat-v3-0324 | Chatbot | 0.30 / 1.00 |
| gpt-oss-120b | Chatbot | 0.10 / 0.49 |
| qwen3-vl-30b-a3b-instruct | Chatbot | 0.49 / 0.49 |
| whisper-large-v3 | Speech-to-Text | 0.05 / 0.11 |
| z-image | Text-to-Image | 0.003 0G/image |

### SDK Setup
```bash
pnpm add @0glabs/0g-serving-broker
```

```typescript
import { ethers } from 'ethers';
import { createZGComputeNetworkBroker } from '@0glabs/0g-serving-broker';

const provider = new ethers.JsonRpcProvider('https://evmrpc-testnet.0g.ai');
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
const broker = await createZGComputeNetworkBroker(wallet);
```

### OpenAI-Compatible API
```python
from openai import OpenAI
client = OpenAI(api_key="app-sk-<SECRET>", base_url="<service_url>/v1/proxy")
response = client.chat.completions.create(
    model="<model_name>",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

### CLI Commands
```bash
pnpm add @0glabs/0g-serving-broker -g
0g-compute-cli setup-network
0g-compute-cli login
0g-compute-cli deposit --amount 100
0g-compute-cli inference list-providers
0g-compute-cli inference get-secret --provider <ADDRESS>
0g-compute-cli inference serve --provider <ADDRESS>
```

### Account Requirements
- Minimum ledger deposit: 3 0G
- Minimum provider sub-account: 1 0G per provider
- Web UI: https://compute-marketplace.0g.ai/inference

### Fine-tuning
```bash
0g-compute-cli fine-tuning upload-data --file dataset.jsonl
0g-compute-cli fine-tuning create-task --model Qwen2.5-0.5B-Instruct --dataset <ID> --provider <ADDR>
0g-compute-cli fine-tuning get-task --task-id <ID>
```
- Models: Qwen2.5-0.5B-Instruct (0.5 0G/1M tokens), Qwen3-32B (4 0G/1M tokens)
- Dataset: JSONL format, UTF-8, min 10 examples
- 48h deadline to download after "Delivered" status (30% fee if missed)
- Output: LoRA adapters (use with base model + PEFT library)

### Starter Kit
- https://github.com/0glabs/0g-compute-ts-starter-kit

---

## 0G DA (Data Availability)
- 50 Gbps throughput on testnet
- Max blob size: 32,505,852 bytes
- Used by rollups (Polygon, Optimism, Arbitrum, Fuel, Manta)
- Requires running DA Client + Encoder nodes (heavy infra)
- Less relevant for hackathon app-level projects

---

## INFT (ERC-7857) - Intelligent NFTs
- Tokenized AI agents with encrypted metadata
- Secure transfer: ownership + encrypted AI data transfer together
- Oracle verification: TEE or ZKP proof validation
- Clone function: duplicate AI agent as new NFT
- Authorized usage: grant access without ownership transfer
- Uses 0G Storage for encrypted metadata, 0G Compute for secure inference
- Reference: https://github.com/0gfoundation/0g-agent-nft/tree/eip-7857-draft

---

## SDKs & Resources
- TypeScript Storage SDK: `@0gfoundation/0g-ts-sdk`
- Compute Broker SDK: `@0glabs/0g-serving-broker`
- Docs: https://docs.0g.ai
- AI Context: https://docs.0g.ai/ai-context
- GitHub: https://github.com/0gfoundation
- Builder Hub: https://build.0g.ai
- Discord: https://discord.gg/0gLabs
