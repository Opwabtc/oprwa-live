import React from 'react';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ParticleCanvas } from '@/components/ParticleCanvas';
import { useAssets } from '@/hooks/useAssets';
import { AssetCard } from '@/components/AssetCard';

gsap.registerPlugin(ScrollTrigger);

export function Landing(): React.JSX.Element {
  const heroRef = useRef<HTMLDivElement>(null);
  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLDivElement>(null);
  const { assets } = useAssets();

  useEffect(() => {
    // Hero elements: use autoAlpha so opacity+visibility are set atomically.
    // autoAlpha: 0 sets visibility:hidden + opacity:0 — prevents invisible-but-interactive elements.
    // On complete, GSAP restores visibility:visible automatically.
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo('.hero__eyebrow',
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 0.7 },
      0.15,
    )
    .fromTo('.hero__headline',
      { autoAlpha: 0, y: 40 },
      { autoAlpha: 1, y: 0, duration: 0.9 },
      0.3,
    )
    .fromTo('.hero__sub',
      { autoAlpha: 0, y: 24 },
      { autoAlpha: 1, y: 0, duration: 0.8 },
      0.55,
    )
    .fromTo('.hero__cta',
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 0.7 },
      0.8,
    );

    // Sections: scroll-triggered, also using autoAlpha to avoid opacity stuck at 0
    const ctx = gsap.context(() => {
      if (section1Ref.current) {
        gsap.fromTo(section1Ref.current,
          { autoAlpha: 0, y: 48 },
          {
            autoAlpha: 1, y: 0, duration: 0.9, ease: 'power2.out',
            scrollTrigger: { trigger: section1Ref.current, start: 'top 82%' },
          },
        );
      }

      // NOTE: .asset-card animations are handled by Framer Motion inside AssetCard.
      // Do NOT animate .asset-card here — double-animating causes opacity stuck at 0.

      if (section3Ref.current) {
        gsap.fromTo('.how-step',
          { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.18, ease: 'power2.out',
            scrollTrigger: { trigger: section3Ref.current, start: 'top 80%' },
          },
        );
      }
    });

    return () => {
      tl.kill();
      ctx.revert();
    };
  }, []);

  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero" ref={heroRef} aria-label="Hero section">
        <ParticleCanvas />
        <div className="hero__content" style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero__eyebrow">Bitcoin-Native RWA Platform</div>
          <h1 className="hero__headline">
            Access Real World Assets<br />
            <span className="hero__headline--accent">from Bitcoin</span>
          </h1>
          <p className="hero__sub">
            Institutional-grade real estate, T-bills, and commodities — accessible from
            your Bitcoin wallet. No KYC friction. 24/7 liquidity.
          </p>
          <div className="hero__cta">
            <Link to="/marketplace" className="btn btn--primary btn--lg">
              Explore Markets
            </Link>
            <Link to="/docs" className="btn btn--secondary btn--lg">
              Read Whitepaper
            </Link>
          </div>
        </div>
      </section>

      {/* What is OPRWA */}
      <section className="landing__section" ref={section1Ref} aria-labelledby="what-heading">
        <div className="container">
          <h2 id="what-heading" className="section-title">What is OPRWA?</h2>
          <p className="section-body">
            OPRWA is the interface, routing, and identity layer between Bitcoin holders and
            Real World Assets. Built on OPNet OP_1155, it enables fractional ownership of
            institutional assets — with deterministic pricing enforced on-chain, fees
            verifiable by anyone, and no custody of user funds.
          </p>
          <div className="landing__pillars">
            <div className="landing__pillar glass-card">
              <div className="landing__pillar-icon" aria-hidden="true">01</div>
              <h3>Deterministic Pricing</h3>
              <p>Same inputs always produce the same price. No oracle manipulation. Auditable on-chain.</p>
            </div>
            <div className="landing__pillar glass-card">
              <div className="landing__pillar-icon" aria-hidden="true">02</div>
              <h3>On-Chain Fees</h3>
              <p>Protocol fees (0.25%–0.75%) are computed and enforced by the RWAVault contract.</p>
            </div>
            <div className="landing__pillar glass-card">
              <div className="landing__pillar-icon" aria-hidden="true">03</div>
              <h3>KYC-Ready</h3>
              <p>Testnet: auto-verified. Mainnet: plug in Sumsub/Persona for gated actions only.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Assets */}
      <section className="landing__section landing__section--dark" ref={section2Ref} aria-labelledby="assets-heading">
        <div className="container">
          <h2 id="assets-heading" className="section-title">Featured Assets</h2>
          <div className="asset-grid">
            {assets.length > 0
              ? assets.slice(0, 3).map((asset, i) => (
                  <AssetCard key={asset.id} asset={asset} index={i} />
                ))
              : [0, 1, 2].map((i) => (
                  <div key={i} className="asset-card-skeleton glass-card" aria-hidden="true">
                    <div className="skeleton-block skeleton-block--header" />
                    <div className="skeleton-block skeleton-block--title" />
                    <div className="skeleton-block skeleton-block--body" />
                  </div>
                ))}
          </div>
          <div className="landing__assets-cta">
            <Link to="/marketplace" className="btn btn--secondary btn--md">
              View All Assets
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="landing__section" ref={section3Ref} aria-labelledby="how-heading">
        <div className="container">
          <h2 id="how-heading" className="section-title">How It Works</h2>
          <div className="how-steps">
            <div className="how-step glass-card">
              <div className="how-step__number" aria-hidden="true">1</div>
              <h3 className="how-step__title">Connect Wallet</h3>
              <p className="how-step__desc">
                Connect your Bitcoin wallet (Unisat, Xverse, OKX). Sign-only — no private key
                storage. Testnet: auto-verified instantly.
              </p>
            </div>
            <div className="how-step glass-card">
              <div className="how-step__number" aria-hidden="true">2</div>
              <h3 className="how-step__title">Choose an Asset</h3>
              <p className="how-step__desc">
                Browse real estate, T-bills, and commodities. See live prices, yields, and
                on-chain fee breakdown before committing.
              </p>
            </div>
            <div className="how-step glass-card">
              <div className="how-step__number" aria-hidden="true">3</div>
              <h3 className="how-step__title">Sign Transaction</h3>
              <p className="how-step__desc">
                Sign the Bitcoin transaction. PENDING confirmation is instant. Position appears
                in your portfolio after on-chain settlement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="landing__cta-banner" aria-labelledby="cta-heading">
        <div className="container landing__cta-inner">
          <h2 id="cta-heading" className="landing__cta-title">
            Ready to access global assets from Bitcoin?
          </h2>
          <Link to="/marketplace" className="btn btn--primary btn--lg">
            Start Investing
          </Link>
        </div>
      </section>

      <footer className="site-footer" role="contentinfo">
        <div className="container site-footer__inner">
          <span className="site-footer__brand">OPRWA</span>
          <span className="site-footer__note">
            Testnet only. No real funds. Built on OPNet Bitcoin L1.
          </span>
        </div>
      </footer>
    </div>
  );
}
