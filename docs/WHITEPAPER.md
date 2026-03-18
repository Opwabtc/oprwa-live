# OPRWA Whitepaper
**Version 2.0 — March 2026**

---

## Executive Summary

OPRWA is the first Real World Asset distribution platform built natively on Bitcoin Layer 1.

The protocol is live. The RWAVault contract (`opt1sqz3chv4dyhmsegr672qpumvy9se52kwlnyhq6q5d`) is deployed on OPNet testnet. The frontend at [oprwa.vercel.app](https://oprwa.vercel.app) connects real Bitcoin wallets to real on-chain transactions. No mocks. No simulations. No intermediaries.

Bitcoin holders can purchase fractional ownership in institutional-grade assets — commercial real estate, sovereign debt, and commodity reserves — with a single wallet signature. Fees are enforced by the contract. Pricing is deterministic and independently verifiable. Custody never transfers to OPRWA.

The platform is architected for mainnet deployment, compliance integration, and institutional-grade scale from day one.

---

## 1. The Problem

### 1.1 The Capital Divide

Bitcoin holders represent the largest concentration of self-custodied, liquid capital in human history — over $1 trillion in aggregate value, distributed across tens of millions of wallets worldwide. This capital is structurally excluded from Real World Asset markets.

The exclusion is not incidental. It is architectural:

**Access barriers**
- RWA markets require licensed custodians, bank accounts, or regulated brokerage relationships
- Minimum investment thresholds range from $50,000 to $500,000, excluding 99% of potential participants
- Geographic restrictions eliminate entire populations of Bitcoin holders in emerging markets

**Settlement barriers**
- Traditional RWA settlement operates on T+2 to T+5 cycles
- Markets close. Custodians work business hours. Cross-border settlement routes through SWIFT
- Bitcoin operates 24/7/365. RWA settlement does not

**Trust barriers**
- Fee structures are opaque: management fees, hidden spreads, performance allocations, custody charges
- Price discovery is off-chain and unverifiable
- Custody is concentrated — a single custodian failure can freeze all assets across all holders

Bitcoin is the most transparent, auditable, and self-custodied monetary asset ever created. It cannot participate in the world's largest asset class.

### 1.2 The Market Opportunity

Real World Asset tokenization is projected to reach $16 trillion by 2030 (Boston Consulting Group, 2023). BlackRock, Franklin Templeton, and JPMorgan have each launched tokenized asset products in the past 24 months.

Every major institution is building on Ethereum. The Bitcoin-native RWA layer is empty.

OPRWA is the first.

---

## 2. The Protocol

OPRWA is a three-layer system: interface, routing, and identity. Each layer has a single responsibility and can be upgraded independently.

### 2.1 Interface Layer

A production React application — 60fps, GSAP-animated, WebGL particle hero, Lenis smooth scroll. The design system (SNL: Simple, New, Liquid) is built for institutional credibility: dark-first, Bitcoin orange, glassmorphism card system, zero emojis, skeleton loaders.

Users can browse every asset, see live on-chain pricing and yields, and evaluate fees without connecting a wallet. No KYC gate blocks discovery.

### 2.2 Routing Layer (RWAVault Contract)

The core of the protocol is the RWAVault smart contract — compiled from AssemblyScript to WASM, deployed on OPNet's Bitcoin L1 execution layer, implementing the OPNet OP-1155 multi-token standard.

**Contract address:** `opt1sqz3chv4dyhmsegr672qpumvy9se52kwlnyhq6q5d`
**WASM size:** 26,188 bytes
**Network:** OPNet Testnet (Bitcoin L1)

The contract is the single source of truth for:
- Fractional token issuance (`purchase`, `mint`) and destruction (`burn`)
- Transfer compliance enforcement via whitelist
- Fee computation (`collectFee`) — never delegated to off-chain logic
- Demand factor storage — drives deterministic pricing

### 2.3 Identity Layer

A pluggable KYC abstraction:
- **Testnet (`TestnetKYC`):** All actions auto-verified, no friction
- **Mainnet v1 (`SumsubKYC` or `PersonaKYC`):** Identity verification for restricted actions only (transfer, withdrawal)
- Browse and purchase are never KYC-gated

The `IKYCAdapter` interface allows compliance requirements to be swapped by changing a single class. No frontend modifications required for compliance changes.

---

## 3. Technical Architecture

### 3.1 Transaction Flow

Every purchase in OPRWA follows a strict on-chain flow:

```
1. User clicks BUY
2. Frontend fetches on-chain price via totalSupplyOf() + collectFee()
3. Frontend constructs purchase(tokenId, amount) call
4. OPNet SDK: setTransactionDetails() → simulate() → sendTransaction()
5. User wallet signs — private key never leaves device
6. Transaction broadcasts to Bitcoin L1 via OPNet
7. Frontend polls for settlement; shows OPScan link on confirmation
8. Portfolio refreshes: balanceOf() called on-chain
```

No mock. No simulation bypass. No off-chain settlement. Every step is verifiable.

### 3.2 Deterministic Pricing Model

All pricing is fully deterministic and independently replicable:

```
demand_factor = clamp(k × (buys − sells) / liquidity_pool, −0.05, 0.05)
  where:
    k = 0.05 (sensitivity coefficient)
    buys  = rolling 24h buy volume (satoshis)
    sells = rolling 24h sell volume (satoshis)
    liquidity_pool = available protocol liquidity

price_per_fraction = NAV_per_fraction × (1 + spread + demand_factor)
```

Asset spreads (fixed per asset):
- Commercial Real Estate: 2.0%
- Sovereign T-Bill Fund: 1.5%
- Commodity Reserve: 2.5%

**Invariant:** The same inputs always produce the same price. No oracle dependency. No manipulation surface. Any user, auditor, or regulator can verify any price independently using the published formula.

### 3.3 On-Chain Fee Enforcement

Fee computation lives exclusively in `RWAVault.collectFee()`:

```
scaled_demand = clamp(demand_factor × 10000 + 500, 0, 1000)
  // 500 = market neutral, 0 = minimum demand, 1000 = maximum demand

basis_points = 250 + clamp((scaled_demand − 500) / 2, −250, 250)
  // range: 250 bps (0.25%) to 750 bps (0.75%)

fee = max(1000 sats, floor(tx_value × basis_points / 100000))
```

The contract is authoritative. The frontend never calculates fees independently — it calls `collectFee()` and displays what the contract returns. Fee manipulation at the application layer is architecturally impossible.

### 3.4 Wallet Integration

OPRWA supports all major Bitcoin L1 wallets without custodying keys:

```
Detection priority:
  1. window.opnet        → OPWallet (preferred — native OPNet support)
  2. window.unisat       → UniSat Wallet
  3. window.okxwallet.bitcoin → OKX Wallet

All wallets:
  → requestAccounts()  — connect and retrieve address
  → sign-only pattern — wallet signs, dApp never touches the key
```

The SDK (`@btc-vision/transaction`, `opnet`) is dynamically imported — the 2.2MB OPNet bundle loads only when a user initiates a transaction, not on page load.

### 3.5 Contract Method Reference

| Method | Selector | Access | Description |
|--------|----------|--------|-------------|
| `purchase(tokenId, amount)` | `0x3ac5da7c` | **Public** | Mint fractions to caller — main user entry point |
| `mint(to, tokenId, amount)` | `0x92168b41` | Admin | Mint to arbitrary address |
| `burn(from, tokenId, amount)` | — | Admin / Holder | Destroy fractions |
| `transfer(to, tokenId, amount)` | — | Holder | Transfer (whitelist-gated for compliance) |
| `balanceOf(account, tokenId)` | — | View | On-chain position query |
| `totalSupplyOf(tokenId)` | — | View | Total issued fractions |
| `collectFee(txValue)` | — | View | Dynamic fee — contract is authoritative |
| `setDemandFactor(scaled)` | — | Admin | Update market demand signal |
| `setWhitelist(address, bool)` | — | Admin | Transfer compliance gate |
| `isWhitelisted(address)` | — | View | Check transfer eligibility |

### 3.6 Contract Events

| Event | Fields | Description |
|-------|--------|-------------|
| `Mint` | tokenId, to, amount | Fraction issuance |
| `Burn` | tokenId, from, amount | Fraction destruction |
| `Transfer` | from, to, tokenId, amount | Position movement |
| `Purchase` | tokenId, buyer, amount | Public purchase |
| `DemandFactorSet` | scaledValue | Pricing signal update |
| `WhitelistSet` | account, approved | Compliance gate update |

---

## 4. Revenue Model

The protocol captures fees on every transaction, enforced by the contract, collected by the protocol treasury.

### 4.1 Fee Structure

| Market State | Basis Points | Rate | Example (100,000 sats) |
|---|---|---|---|
| Low demand | 250 bps | 0.25% | 250 sats (min: 1,000 sats) |
| Neutral | 250–500 bps | 0.25%–0.50% | 250–500 sats |
| High demand | 750 bps | 0.75% | 750 sats |

The dynamic fee model aligns protocol revenue with market activity. Minimum fee of 1,000 sats provides sustainability for small-denomination transactions.

### 4.2 Revenue Projections

| Stage | Monthly Volume | Fee Range | Monthly Revenue |
|-------|---------------|-----------|-----------------|
| Testnet v1 | — | — | — |
| Mainnet v1 (closed beta, 3 assets) | $500K–$2M | 0.25%–0.35% | $1,250–$7,000 |
| Mainnet v2 (open, 10 assets) | $10M–$50M | 0.25%–0.50% | $25,000–$250,000 |
| Mainnet v3 (institutional) | $100M+ | 0.25% baseline | $250,000+/month |

Projections assume Bitcoin price ≥ $90,000 (March 2026 baseline) and OPNet mainnet stability.

---

## 5. Competitive Moat

### 5.1 Bitcoin-Native First-Mover

Every major RWA protocol runs on Ethereum or Ethereum-compatible chains. Bitcoin L1 via OPNet has no established RWA infrastructure. OPRWA deploys the first.

First-mover advantages in financial infrastructure compound: protocol integrations build on existing protocols, liquidity concentrates in established venues, and user habits form around the first trustworthy interface. The moat is structural.

### 5.2 Non-Custodial Architecture

OPRWA cannot hold user funds — not by policy, but by architecture. The wallet signs. The contract executes. OPRWA is the routing layer. There is no custody layer to compromise, regulate, or fail.

BlackRock BUIDL, Franklin OnChain, and most EVM-based RWA products route through custodians. OPRWA does not.

### 5.3 Deterministic Transparency

Every price and every fee can be verified independently by any party with the published formula. This is verifiable trust — a higher-order trust property than audit reports or attestations.

Institutional investors, regulators, and sophisticated users can verify that OPRWA does exactly what it says, without trusting OPRWA to say so.

### 5.4 Compliance-Ready Architecture

OPRWA's `IKYCAdapter` interface ships on day one. Compliance requirements are a parameter, not a rebuild. Adding enhanced KYC for regulated assets, jurisdiction-based restrictions, or institutional onboarding requires changing one class — not the contract, not the frontend, not the pricing engine.

Competitors building on raw wallet connections have no equivalent path to compliance without rebuilding their identity layer.

### 5.5 Instant Settlement UX

Traditional RWA settlement: T+2 to T+5. OPRWA: immediate UX confirmation, async on-chain settlement. Users experience instant execution. The frontend shows PENDING state immediately after broadcast and updates portfolio state on confirmation.

---

## 6. Compliance Design

OPRWA is designed for progressive compliance — minimal friction at launch, full compliance capability available without architectural changes.

### 6.1 Current State (Testnet v2 — Live)

| Action | Requirement |
|--------|-------------|
| Browse assets | None |
| View pricing, yields, fees | None |
| Connect wallet | Wallet signature only |
| Purchase fractions | Wallet connected + testnet BTC |
| Transfer | Auto-whitelisted (testnet) |

### 6.2 Mainnet v1

| Action | Requirement |
|--------|-------------|
| Browse, price discovery | None |
| Purchase up to regulatory threshold | Wallet address ownership (KYC level 0) |
| Transfer | Identity verification — Sumsub / Persona (KYC level 1) |
| Withdrawal | KYC level 1 |

### 6.3 Mainnet v2 (Regulated Assets)

| Action | Requirement |
|--------|-------------|
| Browse | None |
| Purchase up to $10K equivalent | KYC level 1 |
| Purchase above $10K | Enhanced due diligence (KYC level 2) |
| Transfer, withdrawal | KYC level 2 |

### 6.4 Jurisdiction Strategy

OPRWA operates as a technology interface layer — not a financial intermediary. Asset issuance, legal structuring, and regulatory licensing occur at the asset originator level, outside OPRWA's scope. OPRWA constructs and broadcasts signed transactions on behalf of users. It does not custody, settle, issue, or clear.

This architecture mirrors Bitcoin itself: a protocol that routes value without being an intermediary. OPNet executes on Bitcoin L1, which has no issuer. OPRWA inherits that property.

---

## 7. Security

| Guarantee | Implementation |
|-----------|----------------|
| No custody | OPRWA holds no funds at any layer — architecture-enforced |
| No key storage | Private keys never leave the user's wallet — sign-only pattern |
| On-chain fees | `collectFee()` is the sole fee authority — frontend cannot override |
| No hidden routing | All fee flows on-chain and auditable via OPScan |
| Deterministic execution | Same inputs always produce the same output — no oracle dependency |
| XSS-safe | All user-facing strings sanitized before DOM insertion |
| Whitelist gating | Transfer compliance enforced at contract level — cannot be bypassed |

### 7.1 Contract Security Properties

- `purchase()` is permissionless and mints only to `Blockchain.tx.sender` — no spoofing possible
- `mint()` is admin-only — cannot be called by external users
- Fee computation uses integer arithmetic only — no floating-point precision attacks
- `SafeMath` on all u256 arithmetic — no integer overflow/underflow
- No external calls during execution — no reentrancy surface
- All storage via typed `StoredMapU256` — no raw storage slot collisions

---

## 8. Risk Analysis

| Risk | Severity | Mitigation |
|------|----------|------------|
| OPNet protocol instability | HIGH | `IContractAdapter` abstraction — contract implementation swappable without frontend changes |
| Bitcoin block time variance | MEDIUM | Optimistic UX: PENDING shown immediately; settlement async |
| Fee model gaming | MEDIUM | `demand_factor` clamped to `[−0.05, 0.05]`; spread fixed per asset at protocol level |
| Regulatory action on asset class | HIGH | Whitelist gating + KYCAdapter enables jurisdiction compliance at contract level |
| Oracle manipulation | LOW | No oracle dependency — all pricing deterministic from formula |
| Wallet library incompatibility | MEDIUM | Strict wallet detection order; graceful degradation per wallet type |
| 60fps on mid-tier devices | LOW | Canvas fallback, lazy particle loading, RAF-synchronized with Lenis |

---

## 9. Roadmap

| Milestone | Status | Target |
|-----------|--------|--------|
| Testnet v1 — 3 assets, mock settlement | Complete | March 2026 |
| Testnet v2 — real wallet, real contract, real transactions | **Complete** | March 2026 |
| Contract security audit | Pending | April 2026 |
| Mainnet v1 — closed beta, 3 assets | Planned | Q2 2026 |
| KYC integration (Sumsub) | Planned | Q2 2026 |
| Mainnet v2 — open, 10 assets | Planned | Q3 2026 |
| Secondary market (peer-to-peer resale) | Planned | Q4 2026 |
| Institutional API | Planned | Q1 2027 |

---

## 10. Deployed Infrastructure

### Live Contract

| Field | Value |
|-------|-------|
| Address | `opt1sqz3chv4dyhmsegr672qpumvy9se52kwlnyhq6q5d` |
| Network | OPNet Testnet |
| Standard | OP-1155 |
| WASM | 26,188 bytes |
| Deployed | March 2026 |
| Explorer | [OPScan](https://opscan.org/accounts/opt1sqz3chv4dyhmsegr672qpumvy9se52kwlnyhq6q5d?network=testnet) |

### Live Frontend

| Field | Value |
|-------|-------|
| URL | https://oprwa.vercel.app |
| Platform | Vercel |
| Source | https://github.com/Opwabtc/oprwa-live |
| Build | Vite 5, React 18, TypeScript strict |

---

## Appendix A: Monorepo Structure

```
oprwa-live/
├── apps/
│   ├── web/            React 18 frontend — Vite, TypeScript, Zustand, Tailwind
│   └── api/            Hono 4 — asset metadata and pricing display only
├── packages/
│   ├── contracts/      RWAVaultAdapter + ABI + deployed-address.json
│   ├── core/           Wallet detection, KYC adapter, pricing engine
│   └── ui/             SNL design system
├── contracts/
│   ├── src/op1155/     AssemblyScript contract source
│   ├── build/          Compiled WASM artifacts
│   ├── abis/           Contract ABI definitions
│   └── scripts/        Deployment scripts
└── docs/
    ├── README.md
    └── WHITEPAPER.md
```

## Appendix B: OPNet Transaction Pattern

All on-chain calls follow this pattern (no exceptions):

```typescript
// 1. Declare simulated outputs BEFORE simulate()
contract.setTransactionDetails({
  inputs:  [],
  outputs: [{ to: recipientP2TR, value: satsAmount, index: 1,
               flags: TransactionOutputFlags.hasTo }],
});

// 2. Simulate — checks revert conditions off-chain
const sim = await contract.purchase(tokenId, amount);
if (sim.revert) throw new Error(sim.revert);

// 3. Send — wallet signs, private key never exposed
const receipt = await sim.sendTransaction({
  signer: null, mldsaSigner: null,
  refundTo: walletAddress,
  network: NETWORK,
  maximumAllowedSatToSpend: satsAmount + 50_000n,
  extraOutputs: [{ address: recipientP2TR, value: Number(satsAmount) }],
});
const txid = receipt.transactionId;  // NOT receipt.txid
```

## Appendix C: Pricing Formula Reference

```
// On-chain demand signal (set by admin, clamped by contract)
demand_factor ∈ [−0.05, 0.05]

// Scaled for integer arithmetic
scaled_demand = clamp(demand_factor × 10000 + 500, 0, 1000)
//   500 = neutral market
//     0 = maximum negative pressure
//  1000 = maximum positive pressure

// Basis points for fee computation
basis_points = 250 + clamp((scaled_demand − 500) / 2, −250, 250)
//   min: 250 bps (0.25%)
//   max: 750 bps (0.75%)

// Fee enforced by contract
fee_sats = max(1000, floor(tx_value_sats × basis_points / 100000))

// Asset price
price = NAV_per_fraction × (1 + asset_spread + demand_factor_normalized)
```

---

*OPRWA is a technology protocol. This document is informational and does not constitute financial, investment, legal, or tax advice. Participation in testnet involves no real value. Mainnet participation involves real Bitcoin and real risk.*
