# OPRWA — Bitcoin-Native Real World Asset Platform

**Live:** [oprwa.vercel.app](https://oprwa.vercel.app) &nbsp;|&nbsp; **Contract:** [`opt1sqz3chv4dyhmsegr672qpumvy9se52kwlnyhq6q5d`](https://opscan.org/accounts/opt1sqz3chv4dyhmsegr672qpumvy9se52kwlnyhq6q5d?network=testnet) &nbsp;|&nbsp; **Network:** OPNet Testnet

---

OPRWA is the first Real World Asset distribution platform built natively on Bitcoin L1. It allows Bitcoin wallet holders to purchase fractional ownership in institutional-grade assets — commercial real estate, sovereign debt instruments, and commodity reserves — through a single signed transaction.

No bank account. No custodian. No intermediary. No off-chain fee logic.

---

## Status

| Component | State |
|-----------|-------|
| RWAVault contract | **LIVE** — OPNet Testnet |
| Frontend | **LIVE** — Vercel |
| Wallet connection | OPWallet / UniSat / OKX |
| On-chain data | Real (`totalSupplyOf`, `balanceOf`, `collectFee`) |
| Buy flow | Real — `purchase()` → on-chain tx → OPScan confirmation |
| Mainnet | Q2 2026 |

---

## Architecture

```
Bitcoin Wallet (OPWallet / UniSat / OKX)
        │  sign-only — private key never leaves wallet
        ▼
OPRWA Frontend (React 18, Vite, TypeScript)
        │  OPNet SDK — dynamic import, browser-side
        ▼
RWAVault Contract (AssemblyScript → WASM, OPNet OP-1155)
   opt1sqz3chv4dyhmsegr672qpumvy9se52kwlnyhq6q5d
        │
        ▼
Bitcoin L1 — OPNet execution layer
```

The frontend never holds funds, never computes fees independently, and never stores private keys. Every fee is computed by `RWAVault.collectFee()` on-chain. Every purchase executes `purchase(tokenId, amount)` — a permissionless public method on the deployed contract.

---

## Contract

**Address:** `opt1sqz3chv4dyhmsegr672qpumvy9se52kwlnyhq6q5d`
**Standard:** OPNet OP-1155
**Language:** AssemblyScript → WASM (26,188 bytes)
**Explorer:** [OPScan](https://opscan.org/accounts/opt1sqz3chv4dyhmsegr672qpumvy9se52kwlnyhq6q5d?network=testnet)

| Method | Selector | Access | Description |
|--------|----------|--------|-------------|
| `purchase(tokenId, amount)` | `0x3ac5da7c` | Public | Mint fractions to caller |
| `mint(to, tokenId, amount)` | `0x92168b41` | Admin | Mint to arbitrary address |
| `burn(from, tokenId, amount)` | — | Admin / Holder | Burn fractions |
| `transfer(to, tokenId, amount)` | — | Holder | Transfer (whitelist-gated) |
| `balanceOf(account, tokenId)` | — | View | On-chain balance |
| `totalSupplyOf(tokenId)` | — | View | Total fractions issued |
| `collectFee(txValue)` | — | View | Dynamic fee computation |
| `setDemandFactor(scaled)` | — | Admin | Update demand signal |
| `setWhitelist(address, bool)` | — | Admin | Transfer gating |

### Fee Model

Fee range: **0.25% – 0.75%** of transaction value, enforced on-chain:

```
scaled_demand = clamp(demand_factor × 10000 + 500, 0, 1000)
basis_points  = 250 + clamp((scaled_demand − 500) / 2, −250, 250)
fee           = max(1000 sats, floor(tx_value × basis_points / 100000))
```

Minimum: 1,000 sats. Maximum: 0.75% of transaction value. The contract is the sole authority on fees — the frontend displays what the contract returns.

---

## Monorepo Structure

```
oprwa-live/
├── apps/
│   ├── web/          @oprwa/web       React 18 frontend (Vite, TypeScript)
│   └── api/          @oprwa/api       Hono API (asset metadata, pricing display)
├── packages/
│   ├── contracts/    @oprwa/contracts  RWAVaultAdapter + ABI + deployed address
│   ├── core/         @oprwa/core       Wallet detection, KYC adapter, pricing
│   └── ui/           @oprwa/ui         SNL design system (GlassCard, Button, Badge)
├── contracts/                          AssemblyScript source, WASM build, deploy scripts
│   ├── src/op1155/RWAVault.ts
│   ├── build/RWAVault.wasm
│   └── scripts/deploy-rwaVault.ts
└── docs/
    ├── README.md
    └── WHITEPAPER.md
```

---

## Stack

| Layer | Technology |
|-------|-----------|
| Contract | AssemblyScript + `@btc-vision/btc-runtime` → WASM |
| Frontend | React 18, Vite 5, TypeScript (strict) |
| Scroll | Lenis 1.3 + GSAP ScrollTrigger |
| Animation | Framer Motion 11 |
| State | Zustand 5 |
| Styling | Tailwind CSS 3 + CSS custom properties |
| Wallet | OPWallet / UniSat / OKX — `window.opnet`, `window.unisat`, `window.okxwallet.bitcoin` |
| SDK | `opnet`, `@btc-vision/transaction`, `@btc-vision/bitcoin` |
| Backend | Hono 4 (metadata + pricing display only) |
| Monorepo | pnpm workspaces + Turbo |
| CI/CD | GitHub Actions + Vercel |

---

## Setup

### Prerequisites

- Node 20+
- pnpm 9+
- A funded OPNet testnet wallet (OPWallet, UniSat, or OKX)

### Install

```bash
git clone https://github.com/Opwabtc/oprwa-live.git
cd oprwa-live
pnpm install
```

### Environment

```bash
# apps/web/.env
VITE_CONTRACT_ADDRESS=opt1sqz3chv4dyhmsegr672qpumvy9se52kwlnyhq6q5d
VITE_NETWORK=testnet
VITE_RPC_URL=https://testnet.opnet.org
```

### Development

```bash
pnpm --filter @oprwa/web dev    # Frontend — port 3000
pnpm --filter @oprwa/api dev    # API — port 3001 (optional — metadata only)
```

### Build

```bash
pnpm --filter @oprwa/web build
```

### Contract — Compile

```bash
cd contracts
npm install
npx asc src/op1155/RWAVault.ts --outFile build/RWAVault.wasm --optimize
```

### Contract — Deploy

```bash
cd contracts
OPNET_MNEMONIC="your mnemonic" npx tsx scripts/deploy-rwaVault.ts
```

---

## Design System (SNL — Simple, New, Liquid)

- **Dark-first** — background `#0a0a0a`, accent `#ff9900` (Bitcoin orange), gold `#d4a017`
- **Glassmorphism** — `backdrop-blur: 12px`, `bg: rgba(255,255,255,0.04)`, `border: rgba(255,255,255,0.08)`
- **Skeleton loaders** — no spinners
- **Clean typography** — no emojis, premium minimal aesthetic
- **Motion-safe** — `prefers-reduced-motion` respected globally

---

## Security

- No custody — OPRWA never holds user funds at any layer
- Sign-only — private keys never leave the wallet; the dApp only constructs and broadcasts
- On-chain fees — `RWAVault.collectFee()` is the sole fee authority; frontend never calculates independently
- No stored keys — wallet session cleared on disconnect
- XSS-safe — all user-facing strings sanitized before DOM insertion
- Non-custodial by design — architecture cannot custody funds even if compromised

---

## Whitepaper

See [`docs/WHITEPAPER.md`](docs/WHITEPAPER.md) for full technical and economic design.

---

## License

MIT — see [LICENSE](LICENSE)
