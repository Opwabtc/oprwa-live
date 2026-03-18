# AGENT STATE

## Repo
https://github.com/Opwabtc/oprwa-live
Local: C:/Users/peluc/OPWABTC/.claude/worktrees/loop-oprwa-rwa-platform/oprwa/

## Status
- Code: PUSHED to GitHub
- Build: NOT VERIFIED (may have TS errors)
- Vercel deploy: NOT DONE
- Contract deploy: NOT DONE (needs OPNET_MNEMONIC in GitHub Secrets)

## Completed
- packages/ui (GlassCard, Button, Badge, Modal, Nav, tokens.css)
- packages/core (pricing.ts, kyc.ts, wallet.ts)
- packages/contracts (IContractAdapter.ts, RWAVaultAdapter.ts mock, abi/)
- apps/api (Hono 4, routes: assets/price/portfolio, in-memory state)
- apps/web (React 18 + Vite + Lenis + GSAP + 6 pages + ParticleCanvas)
- contracts/src/op1155/RWAVault.ts (AssemblyScript, complete)
- docs/README.md + WHITEPAPER.md
- infra/vercel.json
- .github/workflows/ci.yml
- .gitignore (excludes .env, mnemonics, *.wasm, node_modules)

## Missing / To Verify
- [ ] apps/api/src/index.ts (Hono entry point — check exists)
- [ ] apps/api/src/routes/*.ts (check all 3 routes exist)
- [ ] apps/web/vite.config.ts
- [ ] apps/web/tailwind.config.js
- [ ] apps/web/index.html
- [ ] Vite build passes with zero errors

## Commands to Finish

```bash
# 1. Install
cd C:/Users/peluc/OPWABTC/.claude/worktrees/loop-oprwa-rwa-platform/oprwa
npm install -g pnpm@9
pnpm install

# 2. Build (fix any TS errors)
pnpm --filter @oprwa/web build

# 3. Push fixes
git add . && git commit -m "fix: build" && git push

# 4. Deploy frontend to Vercel
npm install -g vercel
vercel --prod --yes
# OR: Vercel dashboard → import https://github.com/Opwabtc/oprwa-live
# Build: pnpm --filter @oprwa/web build | Output: apps/web/dist | Install: pnpm install
```

## Contract Deploy (GitHub Actions)
- OPNET_MNEMONIC must be in GitHub Secrets (Opwabtc org)
- Create .github/workflows/deploy-contract.yml with workflow_dispatch
- Compile: npx asc src/op1155/index.ts --target rwaVault --measure --uncheckedBehavior never
- Deploy via @btc-vision/transaction Mnemonic + TransactionFactory pattern

## Known Issues
- OPNET_MNEMONIC not available locally (only in GitHub Secrets)
- Build not verified — may have TypeScript import errors across workspace packages
