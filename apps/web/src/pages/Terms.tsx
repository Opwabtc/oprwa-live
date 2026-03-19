import React from 'react';
import { SiteFooter } from '@/components/SiteFooter';

export function Terms(): React.JSX.Element {
  return (
    <div className="page legal-page">
      <div className="container" style={{ maxWidth: '780px', padding: '6rem 1.5rem 4rem' }}>
        <h1 className="page-title">Terms of Use</h1>
        <p className="section-body" style={{ marginBottom: '2.5rem' }}>
          Effective date: January 1, 2026 · OPRWA Protocol
        </p>

        {[
          {
            title: '1. Acceptance of Terms',
            body: 'By accessing or using the OPRWA Protocol platform ("Platform"), you agree to be bound by these Terms of Use. If you do not agree, do not use the Platform. OPRWA is a non-custodial, permissionless protocol running on Bitcoin via OPNet. You interact with smart contracts directly from your wallet.',
          },
          {
            title: '2. Nature of the Platform',
            body: 'OPRWA is a decentralized protocol for the tokenization and fractional ownership of real-world assets ("RWAs"). The Platform is provided for informational and technological access purposes only. OPRWA does not hold your funds, custody your assets, or manage your private keys. You are solely responsible for the security of your wallet and private keys.',
          },
          {
            title: '3. Testnet Status',
            body: 'The Platform currently operates on the OPNet Testnet. Testnet tokens have no real monetary value. Any transactions made on testnet are for testing purposes only. OPRWA makes no representation that testnet functionality will persist in any mainnet deployment.',
          },
          {
            title: '4. No Investment Advice',
            body: 'Nothing on this Platform constitutes financial, investment, legal, or tax advice. Fractional ownership of RWAs involves significant risk including total loss of capital. You should consult a licensed financial advisor before making any investment decision. Past performance is not indicative of future results.',
          },
          {
            title: '5. Prohibited Uses',
            body: 'You may not use the Platform: (a) in violation of any applicable law or regulation; (b) to engage in market manipulation, wash trading, or fraudulent activity; (c) to circumvent sanctions or anti-money laundering requirements; (d) to exploit smart contract vulnerabilities; (e) in any manner that could harm the Platform or other users.',
          },
          {
            title: '6. Smart Contract Risk',
            body: 'Interactions with the OPRWA smart contract involve risks including but not limited to: software bugs, network congestion, oracle failures, and unforeseen protocol upgrades. All transactions on Bitcoin are irreversible. OPRWA is not liable for any losses arising from smart contract interactions.',
          },
          {
            title: '7. Disclaimers',
            body: 'THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. OPRWA DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. OPRWA DOES NOT GUARANTEE UNINTERRUPTED ACCESS TO THE PLATFORM.',
          },
          {
            title: '8. Limitation of Liability',
            body: 'TO THE MAXIMUM EXTENT PERMITTED BY LAW, OPRWA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM.',
          },
          {
            title: '9. Governing Law',
            body: 'These Terms shall be governed by and construed in accordance with applicable international law. Any disputes shall be resolved through binding arbitration.',
          },
          {
            title: '10. Changes to Terms',
            body: 'OPRWA reserves the right to modify these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the new Terms. Material changes will be announced through the official OPRWA communication channels.',
          },
        ].map(({ title, body }) => (
          <div key={title} style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text)' }}>{title}</h2>
            <p style={{ color: 'var(--text-2)', lineHeight: 1.75, fontSize: '0.9rem' }}>{body}</p>
          </div>
        ))}

        <div id="risk-disclosure" style={{ marginTop: '3rem', padding: '1.5rem', background: 'var(--danger-dim)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-card)' }}>
          <h2 style={{ fontSize: '1rem', color: 'var(--danger)', marginBottom: '0.5rem' }}>Risk Disclosure</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', lineHeight: 1.72 }}>
            Investing in tokenized real-world assets carries substantial risk. The value of fractional ownership tokens may fluctuate dramatically. You may lose your entire investment. RWA tokens are not insured by any government deposit insurance scheme. Liquidity may be limited. Smart contract bugs may result in permanent loss of funds. Only invest what you can afford to lose entirely. This is not a solicitation to invest.
          </p>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
