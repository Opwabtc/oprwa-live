# Changelog

All notable changes to OPRWA are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Planned
- Mainnet deployment
- KYC adapter integration
- On-chain yield distribution UI
- Mobile wallet deep-link support

---

## [0.3.0] — 2026-03-18

### Added
- 9 RWA assets across real estate, fixed income and commodities (tokenIds 0–8)
- `CursorTrail` — orange canvas particle trail with glow (mix-blend-mode: screen)
- `ScrambleText` — text scramble animation on hover for nav and footer links
- `StackedCards` — GSAP pinned 3D card peel with mouse tilt
- `TextReveal` — word-level scroll-triggered reveal animation
- `TextShuffle` — IntersectionObserver character scramble
- Fluid noise gradient background on landing sections (CSS animation)
- Footer background image with blur overlay
- 3D perspective tilt on Why Bitcoin and Three Steps cards
- Wallet connect button inside BuyModal when disconnected
- OPScan and Mempool explorer links in transaction success state
- Testnet simulation note for mock transaction IDs
- Dashboard portfolio loaded from on-chain balances for all 9 assets
- Comprehensive mobile responsive CSS (buy modal fullscreen, nav collapse)

### Changed
- Hero headline "Own a piece" forced white in both dark and light themes
- Hero "of the world." uses CSS reveal animation (fixes gradient visibility)
- Hero scroll indicator removed (conflicted with CTA buttons)
- Landing copy humanized — removed all technical/artificial language
- StackedCards scroll travel increased to 500px/card, scrub to 2.5 (slower)
- walletStore now loads all 9 asset balances on wallet connect (was 3)
- BuyModal close enabled during `pending` state (only locked during `signing`)
- Dashboard shows real on-chain positions, no mock data

### Fixed
- Hero headline second line ("of the world.") invisible — `overflow: hidden`
  on `TextReveal` inner spans broke `background-clip: text` gradient
- Portfolio empty after wallet connect — walletStore only fetched 3/9 assets
- "Connect Wallet First" button non-functional in BuyModal
- Modal locked after transaction submitted — close now allowed post-signing

---

## [0.2.0] — 2026-03-17

### Added
- OPWA Design System v4 color tokens (dark + warm parchment light)
- Liquid glass card effect (`backdrop-filter`, mouse shimmer via `--mx/--my`)
- `AssetCard` mouse shimmer with Framer Motion lift on hover
- Dashboard portfolio page (replaces Featured Assets section)
- `usePortfolio` hook merging on-chain + pending local transactions
- OPNetRWAVaultAdapter with real contract calls via OPNet SDK
- H-01 fix: `getPublicKeyInfo` sender resolution
- H-02 fix: on-chain balance polling post-transaction (replaces fixed timeout)
- H-03 fix: txid format validation before building explorer URLs
- M-02 fix: wallet address format validation before RPC calls
- M-03 fix: raw contract error strings not leaked to UI
- BuyModal with animated states: idle → signing → pending → settled / error
- Portfolio store for local pending transaction tracking

### Changed
- Contract deployed: `opt1sqrx3wegg9au7l6amnd7jal5rety53sf9cg04s6sq` (9 tokenIds)
- Hero headline wrapping fixed (`text-transform: none`, reduced font-size clamp)
- InfiniteMarquee livebar removed from landing page

### Security
- SECURITY.md response timeline and scope defined
- Vercel headers hardened (CSP, HSTS, X-Frame-Options, Permissions-Policy)
- `.env` files excluded from git; deployment uses Vercel environment variables

---

## [0.1.0] — 2026-03-10

### Added
- Initial monorepo setup (Turborepo, pnpm workspaces)
- React + Vite frontend (`apps/web`)
- AssemblyScript OP-1155 contract (`contracts/src/op1155/RWAVault.ts`)
- 3 RWA assets (tokenIds 0–2): real estate, treasury bills, gold
- WalletConnectButton supporting OPWallet, UniSat, OKX
- GSAP ScrollTrigger animations on landing page
- Framer Motion page transitions
- Lenis smooth scroll integration
- `@oprwa/contracts` TypeScript adapter package
- `@oprwa/core` shared utilities
- GitHub Actions CI pipeline
- MIT License
