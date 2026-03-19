import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'assets', label: 'Available Assets' },
  { id: 'pricing', label: 'Pricing & Fees' },
  { id: 'security', label: 'Security' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'roadmap', label: 'Roadmap' },
];

const STATS = [
  { value: '9', label: 'Real-world assets' },
  { value: '0', label: 'Counterparty risk' },
  { value: '< 3s', label: 'Settlement' },
  { value: '0.25%', label: 'Protocol fee' },
];

const ASSETS_TABLE = [
  { name: 'São Paulo — Faria Lima Tower', category: 'Real Estate', apy: '14.2%', fractions: '500,000', price: '1,000 sats' },
  { name: 'US Treasury Bill Fund (3M)', category: 'Fixed Income', apy: '5.3%', fractions: '1,000,000', price: '1,000 sats' },
  { name: 'Gold Vault Reserve — Zurich', category: 'Commodity', apy: '4.8%', fractions: '250,000', price: '1,000 sats' },
  { name: 'Miami Beach — Sunset Bay', category: 'Real Estate', apy: '15.0%', fractions: '420,000', price: '1,000 sats' },
  { name: 'Manhattan — Midtown Commerce', category: 'Real Estate', apy: '12.0%', fractions: '690,000', price: '1,000 sats' },
  { name: 'Dubai Marina — View Tower', category: 'Real Estate', apy: '18.0%', fractions: '100,000', price: '1,000 sats' },
  { name: 'EU Corporate Bond Fund', category: 'Fixed Income', apy: '6.1%', fractions: '800,000', price: '1,000 sats' },
  { name: 'Silver Vault Reserve — Zurich', category: 'Commodity', apy: '3.9%', fractions: '300,000', price: '1,000 sats' },
  { name: 'London — Grade-A Office', category: 'Real Estate', apy: '11.5%', fractions: '450,000', price: '1,000 sats' },
];

const FAQ = [
  {
    q: 'Do I need to complete KYC to use OPRWA?',
    a: 'On testnet, all wallets are auto-verified — no signup, no forms. Mainnet will require KYC only for high-volume transfers above $10,000, implemented at signing time, never as a browsing wall.',
  },
  {
    q: 'Who holds the underlying assets?',
    a: 'OPRWA is a tokenization layer. The underlying physical assets are held by institutional custodians and fund administrators. Each token is backed 1:1 by a corresponding share in the underlying fund or property. Audits are published quarterly.',
  },
  {
    q: 'Can I sell my fractions?',
    a: 'Fraction transfers and secondary market functionality are on the roadmap for Q3 2026. On mainnet, you will be able to list fractions for sale directly through the protocol — no CEX, no intermediary.',
  },
  {
    q: 'What happens if I lose access to my wallet?',
    a: 'Your fractions live on Bitcoin — not on our servers. Whoever controls the wallet controls the tokens. Keep your seed phrase in a safe place. We cannot recover lost wallets.',
  },
  {
    q: 'How is the price calculated?',
    a: 'Prices are deterministic: NAV × (1 + spread + demand_factor). All three components are publicly auditable on-chain. No oracle. No black box. You can replicate the price formula yourself from raw blockchain data.',
  },
  {
    q: 'What wallets are supported?',
    a: 'OPWallet (native OPNet), UniSat, and OKX Wallet. All three support Bitcoin and OPNet transactions. No browser extension required beyond the wallet itself.',
  },
];

export function Docs(): React.JSX.Element {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="page docs-page">
      <div className="docs-layout">
        {/* Sidebar */}
        <aside className="docs-sidebar" aria-label="Table of contents">
          <p className="docs-sidebar__title">Contents</p>
          <nav>
            <ul className="docs-sidebar__list" role="list">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="docs-sidebar__link">{s.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', borderRadius: '10px' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', margin: '0 0 0.4rem' }}>Live on Testnet</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 0.75rem', lineHeight: 1.5 }}>RWAVault contract is deployed and accepting transactions.</p>
            <a
              href="https://opscan.org/accounts/opt1sqrx3wegg9au7l6amnd7jal5rety53sf9cg04s6sq?network=testnet"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '0.72rem', color: 'var(--accent)', textDecoration: 'underline', textUnderlineOffset: '3px' }}
            >
              View on OPScan ↗
            </a>
          </div>
        </aside>

        {/* Main content */}
        <main className="docs-content" aria-label="Documentation">

          {/* Hero */}
          <section id="overview" className="docs-section docs-section--hero">
            <div className="docs-badge">Technical Documentation · v1.0</div>
            <h1 className="docs-hero-title">
              Real assets.<br />
              <span style={{ color: 'var(--accent)' }}>On Bitcoin.</span>
            </h1>
            <p className="docs-hero-body">
              OPRWA is a tokenization protocol that lets anyone with a Bitcoin wallet hold fractions of
              institutional real estate, commodities, and fixed-income instruments — directly on Bitcoin L1
              through OPNet, with no bank account, no minimum, and no counterparty risk.
            </p>

            {/* Stats */}
            <div className="docs-stats-row">
              {STATS.map((s) => (
                <div key={s.label} className="docs-stat-card glass-card">
                  <span className="docs-stat-value">{s.value}</span>
                  <span className="docs-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* How it works */}
          <section id="how-it-works" className="docs-section">
            <div className="docs-section-label">Protocol</div>
            <h2 className="docs-section-title">Three steps. One wallet.</h2>
            <p className="docs-section-body">
              No account creation. No bank wire. No waiting period. The entire flow lives in your wallet.
            </p>
            <div className="docs-steps">
              {[
                { n: '01', title: 'Connect', body: 'Open OPWallet, UniSat, or OKX. One click and your address is live. We never see your private key.' },
                { n: '02', title: 'Choose', body: 'Browse nine real-world assets across real estate, commodities, and fixed income. See live pricing, APY, and availability.' },
                { n: '03', title: 'Own', body: 'Sign one transaction. Your fractions are minted on Bitcoin and attributed to your wallet address. Nobody can take them.' },
              ].map((step) => (
                <div key={step.n} className="docs-step glass-card">
                  <span className="docs-step__num">{step.n}</span>
                  <h3 className="docs-step__title">{step.title}</h3>
                  <p className="docs-step__body">{step.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Architecture */}
          <section id="architecture" className="docs-section">
            <div className="docs-section-label">Under the hood</div>
            <h2 className="docs-section-title">Architecture</h2>
            <p className="docs-section-body">
              OPRWA is three layers: a React frontend, an off-chain pricing API, and an on-chain
              AssemblyScript contract. Only the contract is authoritative. The API can fail, the frontend
              can lie — the contract cannot.
            </p>
            <div className="docs-arch-grid">
              <div className="docs-arch-card glass-card">
                <div className="docs-arch-card__label">Layer 1 — Bitcoin L1</div>
                <h3 className="docs-arch-card__title">RWAVault Contract</h3>
                <p className="docs-arch-card__body">
                  OP-1155 multi-token contract written in AssemblyScript, compiled to WASM, executed by OPNet.
                  Handles mint, transfer, fee collection, and balance accounting. All state is on Bitcoin.
                </p>
                <div className="docs-arch-card__meta">
                  <span>opt1sqrx3wegg9au7l6amnd7jal5rety53sf9...04s6sq</span>
                </div>
              </div>
              <div className="docs-arch-card glass-card">
                <div className="docs-arch-card__label">Layer 2 — Pricing API</div>
                <h3 className="docs-arch-card__title">Deterministic Pricing</h3>
                <p className="docs-arch-card__body">
                  Asset prices are computed from a transparent formula, not an oracle. The API
                  exposes pre-computed quotes, but every number is reproducible from on-chain data alone.
                </p>
                <pre className="docs-code-inline">
                  {`price = NAV × (1 + spread + demand_factor)
demand_factor ∈ [-0.05, 0.05]`}
                </pre>
              </div>
              <div className="docs-arch-card glass-card">
                <div className="docs-arch-card__label">Layer 3 — Interface</div>
                <h3 className="docs-arch-card__title">React + OPNet SDK</h3>
                <p className="docs-arch-card__body">
                  Vite-bundled SPA with Zustand state management, GSAP animations, and direct wallet
                  integration. The frontend calls contract.purchase() — the wallet signs, the contract
                  settles. No backend in the transaction path.
                </p>
              </div>
            </div>
          </section>

          {/* Assets */}
          <section id="assets" className="docs-section">
            <div className="docs-section-label">Markets</div>
            <h2 className="docs-section-title">Available Assets</h2>
            <p className="docs-section-body">
              All nine assets are live on testnet. Each fraction costs 1,000 sats.
              APY is indicative based on underlying asset yield.
            </p>
            <div className="docs-table-wrap">
              <table className="docs-table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Category</th>
                    <th>APY</th>
                    <th>Total Fractions</th>
                    <th>Price/Fraction</th>
                  </tr>
                </thead>
                <tbody>
                  {ASSETS_TABLE.map((a) => (
                    <tr key={a.name}>
                      <td style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.85rem' }}>{a.name}</td>
                      <td>
                        <span style={{
                          display: 'inline-flex', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600,
                          background: a.category === 'Real Estate' ? 'var(--accent-dim)' : a.category === 'Commodity' ? 'var(--gold-dim)' : 'rgba(59,130,246,0.12)',
                          color: a.category === 'Real Estate' ? 'var(--accent)' : a.category === 'Commodity' ? 'var(--gold)' : 'var(--info)',
                          border: `1px solid ${a.category === 'Real Estate' ? 'var(--accent-border)' : a.category === 'Commodity' ? 'var(--gold-border)' : 'rgba(59,130,246,0.25)'}`,
                        }}>
                          {a.category}
                        </span>
                      </td>
                      <td style={{ color: 'var(--success)', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{a.apy}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{a.fractions}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--accent)' }}>{a.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Pricing */}
          <section id="pricing" className="docs-section">
            <div className="docs-section-label">Economics</div>
            <h2 className="docs-section-title">Pricing & Fees</h2>
            <p className="docs-section-body">
              Every number is auditable. No black-box pricing. No hidden spread. You can verify
              the formula yourself from raw blockchain data.
            </p>
            <div className="docs-pricing-grid">
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Price Formula</p>
                <pre className="docs-code-inline">
                  {`price = NAV × (1 + spread + demand_factor)

demand_factor = clamp(k × (buys − sells) / pool, −0.05, 0.05)
k = 0.05   |   spread = 1%–3% (per asset)`}
                </pre>
              </div>
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Fee Formula</p>
                <pre className="docs-code-inline">
                  {`basisPoints = 250 + clamp(demandFactor × 250, −250, 250)
// Result: 250–750 bps  (0.25%–0.75%)

fee = max(1,000 sats, txValue × basisPoints / 100,000)`}
                </pre>
              </div>
            </div>
            <div className="docs-fee-row">
              {[
                { label: 'Protocol fee (neutral market)', value: '0.25%' },
                { label: 'Protocol fee (high demand)', value: '0.75%' },
                { label: 'Minimum fee', value: '1,000 sats' },
                { label: 'No custodian fee', value: '✓' },
              ].map((item) => (
                <div key={item.label} className="docs-fee-item glass-card">
                  <span className="docs-fee-item__value">{item.value}</span>
                  <span className="docs-fee-item__label">{item.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Security */}
          <section id="security" className="docs-section">
            <div className="docs-section-label">Trust model</div>
            <h2 className="docs-section-title">Security Guarantees</h2>
            <p className="docs-section-body">
              OPRWA is non-custodial by design. We cannot freeze your assets, charge undisclosed fees,
              or change the rules mid-game. The contract is the only authority.
            </p>
            <div className="docs-security-grid">
              {[
                { icon: '◎', title: 'Non-custodial', body: 'OPRWA never holds funds. Fractions are minted directly to your wallet address. No escrow, no multisig controlled by us.' },
                { icon: '⊞', title: 'On-chain fees', body: 'All fee logic lives in RWAVault.collectFee(). The frontend cannot bypass or reduce fees — and cannot steal from users.' },
                { icon: '◈', title: 'Sign-only flow', body: 'Wallets sign transactions and nothing else. Private keys are never shared with or seen by OPRWA.' },
                { icon: '◧', title: 'Deterministic', body: 'Same inputs always produce the same output. The pricing and fee formulas are fixed in contract bytecode — no governance attack surface.' },
                { icon: '◫', title: 'Verifiable', body: 'Anyone can replicate every price and fee from raw on-chain data. Full transparency, no trust required.' },
                { icon: '◩', title: 'KYC-ready', body: 'Compliance is a plug-in, not a wall. TestnetKYC auto-verifies on testnet. Sumsub/Persona slot in at mainnet without frontend changes.' },
              ].map((item) => (
                <div key={item.title} className="docs-security-card glass-card">
                  <span className="docs-security-card__icon" aria-hidden="true">{item.icon}</span>
                  <h3 className="docs-security-card__title">{item.title}</h3>
                  <p className="docs-security-card__body">{item.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Compliance */}
          <section id="compliance" className="docs-section">
            <div className="docs-section-label">Regulatory</div>
            <h2 className="docs-section-title">Compliance Design</h2>
            <p className="docs-section-body">
              Compliance gates specific transaction types at signing time, not browsing time.
              No user ever hits a KYC wall when exploring the platform.
            </p>
            <div className="docs-table-wrap">
              <table className="docs-table">
                <thead>
                  <tr>
                    <th>Stage</th>
                    <th>KYC Provider</th>
                    <th>Gated Actions</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { stage: 'Testnet', kyc: 'Auto-verified', gated: 'None', status: 'Live', ok: true },
                    { stage: 'Mainnet v1', kyc: 'Sumsub', gated: 'Transfer, Withdraw', status: 'Q3 2026', ok: false },
                    { stage: 'Mainnet v2', kyc: 'Full KYC1', gated: 'Buy > $10K', status: 'Q4 2026', ok: false },
                  ].map((row) => (
                    <tr key={row.stage}>
                      <td style={{ color: 'var(--text)', fontWeight: 600 }}>{row.stage}</td>
                      <td>{row.kyc}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{row.gated}</td>
                      <td>
                        <span style={{
                          display: 'inline-flex', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600,
                          background: row.ok ? 'var(--success-dim)' : 'var(--bg-elevated)',
                          color: row.ok ? 'var(--success)' : 'var(--text-muted)',
                          border: `1px solid ${row.ok ? 'var(--success-border)' : 'var(--border)'}`,
                        }}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Roadmap */}
          <section id="roadmap" className="docs-section">
            <div className="docs-section-label">Milestones</div>
            <h2 className="docs-section-title">Roadmap</h2>
            <div className="docs-roadmap">
              {[
                { period: 'Q1 2026', title: 'Testnet Launch', items: ['RWAVault contract deployed', '9 assets live', 'OPWallet / UniSat / OKX support', 'Real-time portfolio dashboard'], done: true },
                { period: 'Q2 2026', title: 'Mainnet Preparation', items: ['Security audit', 'Custodian integration', 'Legal opinion letters', 'Performance testing at scale'], done: false },
                { period: 'Q3 2026', title: 'Mainnet v1', items: ['3-asset closed beta', 'Sumsub KYC for transfers', 'Secondary market (P2P)', 'Institutional onboarding flow'], done: false },
                { period: 'Q4 2026', title: 'Mainnet v2', items: ['Full 9-asset open access', 'On-chain yield distribution', 'Mobile-optimized wallet UX', 'API for third-party integrations'], done: false },
              ].map((phase) => (
                <div key={phase.period} className={`docs-roadmap__phase glass-card${phase.done ? ' docs-roadmap__phase--done' : ''}`}>
                  <div className="docs-roadmap__period">
                    {phase.period}
                    {phase.done && <span className="docs-roadmap__live">Live</span>}
                  </div>
                  <h3 className="docs-roadmap__title">{phase.title}</h3>
                  <ul className="docs-roadmap__items">
                    {phase.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="docs-section">
            <div className="docs-section-label">FAQ</div>
            <h2 className="docs-section-title">Common Questions</h2>
            <div className="docs-faq">
              {FAQ.map((item, i) => (
                <div
                  key={i}
                  className={`docs-faq__item glass-card${openFaq === i ? ' docs-faq__item--open' : ''}`}
                >
                  <button
                    className="docs-faq__q"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                  >
                    {item.q}
                    <span className="docs-faq__chevron" aria-hidden="true">
                      {openFaq === i ? '−' : '+'}
                    </span>
                  </button>
                  {openFaq === i && (
                    <p className="docs-faq__a">{item.a}</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="docs-section docs-section--cta glass-card">
            <p className="docs-section-label">Get started</p>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0.5rem 0 0.75rem' }}>
              Own a piece of the world.
            </h2>
            <p style={{ color: 'var(--text-2)', fontSize: '0.975rem', maxWidth: '480px', lineHeight: 1.7, margin: '0 0 1.75rem' }}>
              Nine assets. One wallet. No minimum. Connect in 30 seconds and start building your portfolio on Bitcoin.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/#markets" className="btn btn--primary btn--lg">Browse assets →</Link>
              <Link to="/app" className="btn btn--secondary btn--lg">Dashboard</Link>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
