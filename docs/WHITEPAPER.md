# OPRWA Whitepaper
**Version 1.0 — March 2026**

---

## Executive Summary

OPRWA is the Bitcoin-native Real World Asset distribution platform. It enables Bitcoin wallet holders to access fractional ownership of institutional-grade assets — commercial real estate, sovereign T-bills, and commodity reserves — through a single sign-only transaction. No bank account. No custody. No off-chain fee collection.

Fees are enforced by the RWAVault smart contract (OPNet OP_1155). Pricing is deterministic and auditable by anyone. KYC is abstracted and testnet-auto-verified, mainnet-plug-in-ready.

---

## 1. The Problem

Bitcoin holders represent the largest pool of self-custodied, liquid capital in the world — over $1 trillion in market value, distributed across millions of wallets globally. Yet they are systematically excluded from Real World Asset markets.

The barriers are structural:

**Access barriers:**
- RWA markets require bank accounts, licensed custodians, or regulated brokerages
- Minimum investment thresholds range from $50,000 to $500,000 — excluding 99% of participants
- Geographic restrictions eliminate large emerging-market Bitcoin holder populations

**Settlement barriers:**
- Traditional RWA settlement runs T+2 to T+5
- No 24/7 access — markets close, custodians operate business hours
- Cross-border settlement involves correspondent banking, SWIFT, and multi-day delays

**Trust barriers:**
- Fee structures are opaque — hidden spreads, management fees, performance fees
- Price discovery happens off-chain, unverifiable
- Custody is concentrated — a single custodian failure can freeze assets

Bitcoin, the world's most transparent, self-custodied, programmable asset, cannot participate in the world's largest asset class.

**The opportunity:** RWA tokenization is projected to reach $16 trillion by 2030 (Boston Consulting Group). The Bitcoin-native layer is empty.

---

## 2. The Solution

OPRWA is the interface, routing, and identity layer between Bitcoin holders and Real World Assets.

Three components operating as a unified system:

### 2.1 Interface Layer
A cinematic, 60fps React application with Lenis smooth scroll, GSAP-animated sections, and WebGL particle effects. The design system (SNL: Simple, New, Liquid) prioritizes trust through premium aesthetics and transparent information display.

No KYC walls block browsing or price discovery. Users can evaluate any asset — yields, prices, fees, market pressure — without connecting a wallet.

### 2.2 Routing Layer
The RWAVault contract (AssemblyScript, OPNet OP_1155) handles:
- Fractional token minting and burning
- Transfer gating (whitelist-controlled for compliance)
- On-chain fee computation and enforcement
- Demand factor storage (drives deterministic pricing)

The contract is the single source of truth for fees. The frontend never calculates fees independently.

### 2.3 Identity Layer
A KYC abstraction adapter:
- **Testnet:** TestnetKYC — all actions auto-verified, no friction
- **Mainnet:** Plug in Sumsub or Persona for gated actions (transfer, withdrawal only)
- Browse and buy never blocked by KYC at any stage

---

## 3. Architecture

### 3.1 Deterministic Pricing Model

Price discovery is fully deterministic and replicable by any external party:

```
demand_factor = clamp(k * (buys - sells) / liquidity_pool, -0.05, 0.05)
  where k = 0.05
  buys = rolling 24h buy volume (sats)
  sells = rolling 24h sell volume (sats)
  liquidity_pool = simulated available liquidity

price_per_fraction = NAV_per_fraction * (1 + spread + demand_factor)
  where spread is fixed per asset (1%–3%)
```

Asset spreads:
- São Paulo Commercial Tower: 2.0%
- US T-Bill Fund: 1.5%
- Gold Vault Reserve: 2.5%

**Guarantee:** Same inputs always produce the same price. No oracle manipulation possible. Any user can verify any price independently.

### 3.2 On-Chain Fee Enforcement

Fee computation lives exclusively in the RWAVault contract:

```
scaled_demand = clamp(demand_factor * 10000 + 500, 0, 1000)
  // 500 = neutral, 0 = min pressure, 1000 = max pressure

basis_points = 250 + clamp((scaled_demand - 500) / 2, -250, 250)
  // range: 250 bps (0.25%) to 750 bps (0.75%)

fee = max(1000 sats, floor(tx_value * basis_points / 100000))
```

The frontend displays the fee by calling the backend's deterministic mirror of this formula. The contract is authoritative — what the contract says the fee is, the fee is.

### 3.3 Liquidity Simulation Model

OPRWA uses an optimistic UX model:

```
User action → PENDING (immediate UX confirmation)
              ↓ (2–5 seconds async settlement)
             SETTLED (position appears in portfolio)
```

Users are never blocked waiting for on-chain confirmation. The frontend shows PENDING state immediately. The backend settles asynchronously and updates portfolio state. This pattern mirrors how professional trading platforms operate — instant execution confirmation, async clearing.

---

## 4. Revenue Model

OPRWA captures protocol fees on every transaction, enforced by the RWAVault contract.

| Demand Level | Fee Rate | Example (100,000 sats) |
|---|---|---|
| Minimum (negative pressure) | 0.25% | 250 sats (min: 1,000 sats) |
| Neutral | 0.25% | 250 sats |
| Maximum (positive pressure) | 0.75% | 750 sats |

The dynamic fee model aligns protocol revenue with market activity. During high-demand periods (heavy buying), fees rise to 0.75%. During low-demand periods, fees remain at the 0.25% base rate.

Minimum fee of 1,000 sats ensures protocol sustainability for small transactions.

**Revenue scenarios (projected):**

| Stage | Monthly Volume | Fee Rate | Monthly Revenue |
|---|---|---|---|
| Testnet | Simulated only | N/A | $0 |
| Mainnet v1 (closed beta) | $500K–$2M | 0.25%–0.35% | $1,250–$7,000 |
| Mainnet v2 (open, 10 assets) | $10M+ | 0.25%–0.50% | $25,000–$50,000 |
| Mainnet v3 (institutional) | $100M+ | 0.25% baseline | $250,000+ |

---

## 5. Competitive Moat

### 5.1 Identity Infrastructure (KYC-Ready Architecture)

OPRWA's KYC abstraction layer is plug-in ready. The `KYCAdapter` interface allows swapping `TestnetKYC` for `SumsubKYC` or `PersonaKYC` by changing one class — no frontend changes required.

Competitors building on raw wallet connections cannot gate restricted actions (transfer, withdrawal) without rebuilding their entire identity layer. OPRWA ships with this infrastructure on day one.

### 5.2 24/7 Liquidity (Instant UX)

Traditional RWA platforms have settlement windows. OPRWA has no settlement windows. The optimistic PENDING→SETTLED model means users always receive instant UX confirmation — regardless of Bitcoin block times or network congestion.

This is architecturally structural: the frontend is decoupled from on-chain confirmation.

### 5.3 Deterministic Transparency

Every price and fee can be computed independently by any user, developer, or auditor using the published formula. This is verifiable trust — the highest form of trust in financial systems.

No black-box pricing. No hidden spreads. No front-running.

### 5.4 Bitcoin-Native First-Mover Position

The Bitcoin-native RWA layer is empty. EVM chains (Ethereum, Polygon) have early-mover RWA infrastructure. Bitcoin L1 via OPNet has none. OPRWA is the first.

First-mover advantage in infrastructure compounds: integrations, liquidity, user habit formation.

---

## 6. Compliance Design

OPRWA is designed for progressive compliance — minimal friction now, full compliance capability without architectural changes.

### 6.1 Current (Testnet)

- Browse: no restriction
- Buy: no restriction (auto-verified via TestnetKYC)
- Transfer: no restriction (whitelist disabled)
- Withdrawal: no restriction

### 6.2 Mainnet v1

- Browse: no restriction
- Buy: wallet connect required (KYC level 0 — address ownership only)
- Transfer: KYC level 1 (identity verification via Sumsub)
- Withdrawal: KYC level 1

### 6.3 Mainnet v2 (Regulated Assets)

- Browse: no restriction
- Buy up to $10K: KYC level 1
- Buy >$10K: KYC level 2 (enhanced due diligence)
- Transfer/Withdrawal: KYC level 2

The `KYCAdapter` interface handles all of this without touching the frontend. Implementation is swapped at the provider level.

### 6.4 Jurisdiction Strategy

OPRWA operates as a technology interface, not a financial intermediary. Asset issuance and legal structuring happen at the asset originator level (outside OPRWA scope). OPRWA routes signed transactions — it does not custody, issue, or settle.

This positioning mirrors existing compliant infrastructure: OPNet executes on Bitcoin L1, which has no issuer.

---

## 7. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| OPNet OP_1155 protocol instability | HIGH | IContractAdapter abstraction — swappable implementation |
| Lenis + wallet modal conflicts | MEDIUM | Explicit lenis.stop()/lenis.start() on every modal lifecycle |
| Deterministic pricing drift | MEDIUM | demand_factor clamped to [-0.05, 0.05], spread fixed per asset |
| Fee mismatch frontend/contract | HIGH | Frontend calls API mirror of contract formula — never calculates independently |
| 60fps on mid-tier devices | MEDIUM | Canvas fallback, lazy-load particles, RAF-synchronized with Lenis |
| Mainnet KYC complexity | LOW | Abstraction layer ships on day one — plug-in when needed |

---

## 8. Technical Guarantees

- **No custody:** OPRWA never holds user funds at any layer
- **No hidden routing:** All fee flows are on-chain and auditable
- **No frontend fees:** All fee logic lives in RWAVault.collectFee()
- **Sign-only:** Bitcoin wallets sign transactions, never share private keys
- **Deterministic execution:** Same inputs always produce the same output
- **Verifiable:** Any user can replicate the pricing formula independently

---

## 9. Roadmap

| Milestone | Target |
|---|---|
| Testnet v1 (3 assets, mock settlement) | March 2026 |
| Contract audit + testnet hardening | April 2026 |
| Mainnet v1 (closed beta, 3 assets, real settlement) | Q2 2026 |
| KYC integration (Sumsub) | Q2 2026 |
| Mainnet v2 (open, 10 assets) | Q3 2026 |
| Secondary market (resale) | Q4 2026 |
| Institutional API | Q1 2027 |

---

## Appendix: Contract Reference

### RWAVault Methods

| Method | Access | Description |
|---|---|---|
| mint(to, tokenId, amount) | Admin | Mint fractions to address |
| burn(from, tokenId, amount) | Admin or holder | Burn fractions |
| transfer(to, tokenId, amount) | Holder (whitelist-gated) | Transfer fractions |
| balanceOf(account, tokenId) | View | Get balance |
| collectFee(txValue) | View | Compute on-chain fee |
| setWhitelist(address, bool) | Admin | Whitelist management |
| isWhitelisted(address) | View | Check whitelist status |
| setDemandFactor(scaled) | Admin | Update demand factor |

### RWAVault Events

| Event | Fields |
|---|---|
| Mint | tokenId, to, amount |
| Burn | tokenId, from, amount |
| Transfer | from, to, tokenId, amount |
| DemandFactorSet | scaledValue |
| WhitelistSet | account, approved |
