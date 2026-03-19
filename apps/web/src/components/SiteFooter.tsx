import React from 'react';
import { Link } from 'react-router-dom';
import { ScrambleText } from './ScrambleText';

export function SiteFooter(): React.JSX.Element {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="site-footer__bg-overlay" aria-hidden="true" />
      <div className="container">
        <div className="site-footer__grid">
          {/* Brand column */}
          <div className="site-footer__brand-col">
            <div className="site-footer__logo-row">
              <span className="site-footer__brand">OPRWA</span>
            </div>
            <p className="site-footer__tagline">
              Real assets on Bitcoin. Own fractions of global properties
              directly from your wallet. No bank. No broker.
            </p>
            <div className="site-footer__socials">
              <a
                href="https://x.com/opwabtc/"
                target="_blank"
                rel="noopener noreferrer"
                className="site-footer__soc-btn"
                title="X / Twitter"
                aria-label="Twitter / X"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://github.com/Opwabtc/oprwa-live"
                target="_blank"
                rel="noopener noreferrer"
                className="site-footer__soc-btn site-footer__soc-btn--github"
                title="GitHub"
                aria-label="GitHub"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.745 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <p className="site-footer__col-title">Platform</p>
            <ul className="site-footer__links">
              <li>
                <a href="#markets" className="site-footer__link">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <ScrambleText steps={6} speed={28}>Markets</ScrambleText>
                </a>
              </li>
              <li>
                <Link to="/app" className="site-footer__link">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <ScrambleText steps={6} speed={28}>Dashboard</ScrambleText>
                </Link>
              </li>
              <li>
                <Link to="/docs" className="site-footer__link">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <ScrambleText steps={6} speed={28}>Docs</ScrambleText>
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <p className="site-footer__col-title">Resources</p>
            <ul className="site-footer__links">
              <li>
                <a href="https://opnet.org" target="_blank" rel="noopener noreferrer" className="site-footer__link">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <ScrambleText steps={6} speed={28}>OPNet</ScrambleText>
                </a>
              </li>
              <li>
                <a href="https://opscan.org/accounts/opt1sqrx3wegg9au7l6amnd7jal5rety53sf9cg04s6sq?network=testnet" target="_blank" rel="noopener noreferrer" className="site-footer__link">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <ScrambleText steps={6} speed={28}>Contract ↗</ScrambleText>
                </a>
              </li>
              <li>
                <a href="https://github.com/Opwabtc/oprwa-live" target="_blank" rel="noopener noreferrer" className="site-footer__link">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <ScrambleText steps={6} speed={28}>GitHub ↗</ScrambleText>
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="site-footer__col-title">Legal</p>
            <ul className="site-footer__links">
              <li>
                <Link to="/terms" className="site-footer__link">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <ScrambleText steps={6} speed={28}>Terms of Use</ScrambleText>
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="site-footer__link">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <ScrambleText steps={6} speed={28}>Privacy Policy</ScrambleText>
                </Link>
              </li>
              <li>
                <Link to="/terms#risk" className="site-footer__link">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <ScrambleText steps={6} speed={28}>Risk Disclosure</ScrambleText>
                </Link>
              </li>
            </ul>
            <p className="site-footer__col-title" style={{ marginTop: '1.5rem' }}>Contract</p>
            <p className="site-footer__contract">opt1sqrx3wegg9au7l6amnd7jal5rety53sf9cg04s6sq</p>
          </div>
        </div>

        <div className="site-footer__bottom">
          <span className="site-footer__copy">© 2026 OPRWA. All rights reserved.</span>
          <span className="site-footer__note">Built on Bitcoin · OPNet Testnet</span>
        </div>
      </div>
    </footer>
  );
}
