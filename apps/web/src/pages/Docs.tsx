import React from 'react';

const WHITEPAPER_SECTIONS = [
  {
    id: 'problem',
    title: 'The Problem',
    content: `Bitcoin holders represent the largest pool of liquid, self-custodied capital in the world. Yet they are systematically excluded from Real World Asset (RWA) markets: institutional real estate, sovereign T-bills, and commodity-backed instruments that generate 3–15% annual yields.

The barriers are structural:
- RWA markets require bank accounts, custodians, or brokerage intermediaries
- KYC/AML flows are designed for fiat systems, not cryptographic identity
- Settlement cycles (T+2 to T+5) are incompatible with programmable money
- Minimum investment thresholds ($50,000+) exclude 99% of participants

Bitcoin, the world's most liquid digital asset, cannot participate.`,
  },
  {
    id: 'solution',
    title: 'The Solution',
    content: `OPRWA is the interface, routing, and identity layer between Bitcoin holders and Real World Assets.

Three components:
- **Interface:** A cinematic, 60fps dApp with real-time pricing and zero-friction wallet connection
- **Routing:** OPNet OP_1155 multi-token contract (RWAVault) handling mint, burn, transfer, and fee enforcement
- **Identity:** KYC abstraction layer — auto-verified on testnet, Sumsub/Persona plug-in ready for mainnet

The result: any holder of a Bitcoin wallet can access institutional assets in three clicks.`,
  },
  {
    id: 'architecture',
    title: 'Architecture',
    content: `### Deterministic Pricing

Price discovery is fully on-chain and deterministic:

demand_factor = clamp(k * (buys - sells) / liquidity_pool, -0.05, 0.05)
price = NAV * (1 + spread + demand_factor)

Where k = 0.05, spread is fixed per asset (1%–3%), and demand_factor tracks rolling 24h buy/sell pressure. Same inputs always produce the same price — no oracle manipulation is possible.

### On-Chain Fee Enforcement

Fees are computed and enforced by the RWAVault contract:

basisPoints = 250 + clamp((demandFactor * 250), -250, 250)  // 250-750 bps
fee = max(1000 sats, txValue * basisPoints / 100000)

Result: 0.25%–0.75% protocol fee, minimum 1000 sats. Fully auditable. No frontend-calculated fees ever.

### Liquidity Simulation

Transactions flow through a PENDING to SETTLED model:
- User receives PENDING confirmation immediately (zero blocking UX)
- Backend settles asynchronously (2–5 second simulation)
- Portfolio position appears after SETTLED state
- System remains 24/7 — no settlement windows`,
  },
  {
    id: 'revenue',
    title: 'Revenue Model',
    content: `OPRWA captures 0.25%–0.75% of every transaction, computed on-chain by the RWAVault contract. At neutral demand (50/50 buy-sell pressure), the fee is 0.25%.

During high demand periods, the fee scales to 0.75% — this dynamic model aligns protocol revenue with market activity without a separate oracle or governance vote.

**Projected volume scenarios:**
- Testnet launch: $0 (simulation only)
- Mainnet v1 (3 assets, closed beta): $500K–$2M monthly volume — $1,250–$15,000/month fees
- Mainnet v2 (10 assets, open): $10M+ monthly volume — $25,000–$75,000/month fees`,
  },
  {
    id: 'moat',
    title: 'Moat',
    content: `**1. Identity (KYC-ready architecture)**
OPRWA's KYC abstraction layer is plug-in ready: swap TestnetKYC for Sumsub or Persona by changing one class. No frontend changes required. This is a compliance moat — competitors building on raw wallet connections cannot gate restricted actions without a full rebuild.

**2. 24/7 Liquidity (instant UX)**
Traditional RWA platforms have settlement windows. OPRWA has no settlement windows — every action is PENDING immediately and SETTLED asynchronously. This is structural: the frontend never blocks on-chain confirmation.

**3. Deterministic Transparency**
Every price and fee can be computed by any external party using the same formula. This is auditable trust — no black-box pricing, no hidden spreads.`,
  },
  {
    id: 'compliance',
    title: 'Compliance Design',
    content: `OPRWA is designed for progressive decentralization of compliance:

| Stage | KYC | Gated Actions |
|---|---|---|
| Testnet | Auto-verified (TestnetKYC) | None |
| Mainnet v1 | Sumsub for transfers/withdrawals | transfer, withdrawal |
| Mainnet v2 | Full KYC1 for buy | transfer, withdrawal, buy >$10K |

KYC never blocks browsing or price discovery. The UI never shows a KYC wall — it gates specific transaction types at signing time.`,
  },
  {
    id: 'security',
    title: 'Security Guarantees',
    content: `- No custody: OPRWA never holds user funds
- No hidden routing: all fee flows are on-chain and auditable
- No frontend fees: all fee logic lives in RWAVault.collectFee()
- Sign-only: wallets sign transactions, never share private keys
- Deterministic execution: same inputs always produce the same output
- Verifiable: any user can replicate the pricing formula independently`,
  },
];

function renderContent(content: string): React.ReactNode[] {
  return content.split('\n\n').map((block, i) => {
    if (block.startsWith('| ')) {
      const rows = block.split('\n').filter((r) => r.startsWith('|'));
      return (
        <div key={i} className="docs-table-wrap">
          <table className="docs-table">
            <tbody>
              {rows.map((row, ri) => {
                if (row.includes('---')) return null;
                const cells = row.split('|').filter((c) => c.trim() !== '');
                const Tag = ri === 0 ? 'th' : 'td';
                return (
                  <tr key={ri}>
                    {cells.map((cell, ci) => (
                      <Tag key={ci}>{cell.trim()}</Tag>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    if (block.startsWith('### ')) {
      return (
        <h3 key={i} className="docs-h3">
          {block.slice(4)}
        </h3>
      );
    }

    if (block.startsWith('- ') || block.includes('\n- ')) {
      const items = block.split('\n').filter((l) => l.startsWith('- '));
      return (
        <ul key={i} className="docs-list">
          {items.map((item, li) => (
            <li key={li}>{item.slice(2)}</li>
          ))}
        </ul>
      );
    }

    if (block.includes('**')) {
      const parts = block.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={i} className="docs-para">
          {parts.map((part, pi) =>
            part.startsWith('**') ? (
              <strong key={pi}>{part.slice(2, -2)}</strong>
            ) : (
              part
            )
          )}
        </p>
      );
    }

    if (block.trim() === '') return null;

    // Check if it's a code block (contains indented lines)
    if (block.startsWith('demand_factor') || block.startsWith('price') || block.startsWith('basisPoints') || block.startsWith('fee')) {
      return (
        <pre key={i} className="docs-code">
          <code>{block}</code>
        </pre>
      );
    }

    return <p key={i} className="docs-para">{block}</p>;
  });
}

export function Docs(): React.JSX.Element {
  return (
    <div className="page docs-page">
      <div className="docs-layout">
        <aside className="docs-sidebar" aria-label="Table of contents">
          <h2 className="docs-sidebar__title">Contents</h2>
          <nav>
            <ul className="docs-sidebar__list" role="list">
              {WHITEPAPER_SECTIONS.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="docs-sidebar__link">
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="docs-content container" aria-label="Whitepaper content">
          <h1 className="docs-content__title">OPRWA Whitepaper</h1>
          {WHITEPAPER_SECTIONS.map((section) => (
            <section key={section.id} id={section.id} className="docs-section">
              <h2 className="docs-section__title">{section.title}</h2>
              <div className="docs-section__body">{renderContent(section.content)}</div>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
