# OPRWA — Bitcoin-Native RWA Distribution Platform

## Vision

Access Real World Assets from Bitcoin. One wallet. One click. Global assets.

OPRWA enables Bitcoin holders to fractionally own institutional-grade assets — commercial real estate, sovereign T-bills, and commodity reserves — directly from their Bitcoin wallet. No custody. No bank account. No hidden fees.

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Bitcoin Wallet                            │
│              (Unisat / Xverse / OKX — sign only)            │
└───────────────────────────┬──────────────────────────────────┘
                            │ Sign transaction (no key sharing)
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                  OPRWA Frontend                               │
│         (React 19, Vite, Lenis, GSAP, Framer Motion)        │
│                                                              │
│  • Particle canvas hero (2000 WebGL particles)              │
│  • 60fps Lenis smooth scroll + GSAP ScrollTrigger           │
│  • Glassmorphism SNL design system                          │
│  • Zustand state management                                  │
└───────────────────────────┬──────────────────────────────────┘
                            │ REST API (port 3001)
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                  OPRWA API (Hono)                             │
│              (Deterministic pricing engine)                  │
│                                                              │
│  GET  /api/assets          → 3 mock RWA assets              │
│  GET  /api/assets/:id      → single asset                   │
│  GET  /api/price/:assetId  → deterministic price + fee      │
│  GET  /api/portfolio/:wallet → positions                    │
│  POST /api/buy             → PENDING tx → SETTLED (async)   │
└───────────────────────────┬──────────────────────────────────┘
                            │ OPNet SDK
                            ▼
┌──────────────────────────────────────────────────────────────┐
│              RWAVault Contract (AssemblyScript)               │
│                  (OPNet OP_1155 standard)                    │
│                                                              │
│  mint / burn / transfer / balanceOf                         │
│  collectFee (on-chain, deterministic)                       │
│  setWhitelist / isWhitelisted                               │
│  getDemandFactor / setDemandFactor                          │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
                    Bitcoin L1 (OPNet)
```

## Setup

### Prerequisites
- Node 20+
- pnpm 9+

### Install

```bash
git clone https://github.com/Opwabtc/oprwa.git
cd oprwa
pnpm install
```

### Development

```bash
# Start API on port 3001
pnpm --filter @oprwa/api dev

# Start frontend on port 3000 (new terminal)
pnpm --filter @oprwa/web dev
```

### Build

```bash
pnpm --filter @oprwa/web build
```

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 5, TypeScript (strict) |
| Scroll | Lenis 1.3 + GSAP ScrollTrigger |
| Animation | Framer Motion 11 |
| State | Zustand 5 |
| Styling | Tailwind CSS 3 + CSS custom properties |
| Backend | Hono 4, Node 20 |
| Contracts | AssemblyScript, OPNet btc-runtime |
| Wallet | @btc-vision/walletconnect (mock on testnet) |
| Monorepo | pnpm workspaces + Turbo |
| CI/CD | GitHub Actions + Vercel |

## Packages

| Package | Description |
|---------|-------------|
| `@oprwa/web` | React frontend app |
| `@oprwa/api` | Hono mock API server |
| `@oprwa/ui` | SNL design system (GlassCard, Button, Badge, Modal, Nav) |
| `@oprwa/core` | Wallet adapter, KYC adapter, pricing engine |
| `@oprwa/contracts` | IContractAdapter + RWAVaultAdapter + TestAdapter |

## Design System (SNL — Simple, New, Liquid)

- **Dark mode default** — bg: #0a0a0a, accent: #ff9900 (Bitcoin orange), gold: #d4a017
- **Glassmorphism cards** — backdrop-blur: 12px, bg: rgba(255,255,255,0.04), border: rgba(255,255,255,0.08)
- **No spinners** — skeleton loaders everywhere
- **No emojis** — clean, premium, minimal
- **prefers-reduced-motion** — respected globally

## Security

- No custody of user funds
- No private key storage (sign-only wallet pattern)
- All fees computed on-chain by RWAVault.collectFee()
- Deterministic pricing: same inputs always produce same output
- KYC abstraction: auto-verified on testnet, plug-in ready for mainnet
