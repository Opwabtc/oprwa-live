import React from 'react';
import { SiteFooter } from '@/components/SiteFooter';

export function Privacy(): React.JSX.Element {
  return (
    <div className="page legal-page">
      <div className="container" style={{ maxWidth: '780px', padding: '6rem 1.5rem 4rem' }}>
        <h1 className="page-title">Privacy Policy</h1>
        <p className="section-body" style={{ marginBottom: '2.5rem' }}>
          Effective date: January 1, 2026 · OPRWA Protocol
        </p>

        {[
          {
            title: '1. Information We Do Not Collect',
            body: 'OPRWA is a non-custodial, decentralized protocol. We do not collect, store, or process: your name, email address, phone number, government-issued identification, IP address logs, or any personally identifiable information. We do not require account creation or KYC.',
          },
          {
            title: '2. On-Chain Data',
            body: "Blockchain transactions are public by nature. When you interact with the OPRWA smart contract, your Bitcoin wallet address and transaction data are permanently recorded on the Bitcoin blockchain and visible to anyone. This is an inherent property of public blockchains and is not within OPRWA's control.",
          },
          {
            title: '3. Frontend Analytics',
            body: 'The OPRWA web application may use privacy-respecting analytics to understand aggregate usage patterns (e.g., page views, feature usage). No personally identifiable data is collected. No cross-site tracking cookies are used. Any analytics data is aggregated and anonymized.',
          },
          {
            title: '4. Local Storage',
            body: "The Platform stores your theme preference (light/dark) and wallet connection state in your browser's localStorage. This data never leaves your device and is not transmitted to any server.",
          },
          {
            title: '5. Third-Party Services',
            body: "The Platform fetches Bitcoin price data from mempool.space, an open-source Bitcoin explorer. No personal data is sent in these requests. The Platform connects to OPNet's RPC nodes (testnet.opnet.org) for blockchain interactions. Review OPNet's privacy policy for their data practices.",
          },
          {
            title: '6. Wallet Connections',
            body: 'When you connect a Bitcoin wallet (OPWallet, UniSat, OKX), the connection is handled entirely by the wallet extension in your browser. OPRWA does not receive your private keys, seed phrases, or signing credentials. OPRWA only receives your public wallet address to display portfolio data.',
          },
          {
            title: '7. Cookies',
            body: 'OPRWA does not use tracking cookies. Only functional browser storage (localStorage) is used for theme and session preferences.',
          },
          {
            title: '8. Data Retention',
            body: 'Since we do not collect personal data, there is nothing to retain or delete. Your on-chain transaction history is permanent on the Bitcoin blockchain and cannot be removed.',
          },
          {
            title: '9. Contact',
            body: 'For privacy-related inquiries, contact us through our GitHub repository at github.com/Opwabtc/oprwa-live or via our official X account @opwabtc.',
          },
          {
            title: '10. Changes to This Policy',
            body: 'We may update this Privacy Policy periodically. Material changes will be announced through official OPRWA channels. Continued use of the Platform after changes constitutes acceptance.',
          },
        ].map(({ title, body }) => (
          <div key={title} style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text)' }}>{title}</h2>
            <p style={{ color: 'var(--text-2)', lineHeight: 1.75, fontSize: '0.9rem' }}>{body}</p>
          </div>
        ))}
      </div>
      <SiteFooter />
    </div>
  );
}
