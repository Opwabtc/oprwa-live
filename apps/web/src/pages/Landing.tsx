import React from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ParticleCanvas } from '@/components/ParticleCanvas';
import { useAssets } from '@/hooks/useAssets';
import { AssetCard } from '@/components/AssetCard';

gsap.registerPlugin(ScrollTrigger);

export function Landing(): React.JSX.Element {
  const { assets } = useAssets();

  useEffect(() => {
    // 1. Hero timeline — rápido, impactante
    const heroTl = gsap.timeline();
    heroTl
      .fromTo(
        '.hero__eyebrow',
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.6 },
        0.1,
      )
      .fromTo(
        '.hero__headline',
        { autoAlpha: 0, y: 60, skewY: 2 },
        { autoAlpha: 1, y: 0, skewY: 0, duration: 1.1, ease: 'power4.out' },
        0.25,
      )
      .fromTo(
        '.hero__sub',
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        0.55,
      )
      .fromTo(
        '.hero__cta',
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' },
        0.8,
      )
      .fromTo(
        '.hero__scroll-indicator',
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.5 },
        1.2,
      );

    // 2. Stats bar — scroll trigger
    gsap.fromTo(
      '.stats-bar',
      { autoAlpha: 0, y: 20 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.stats-bar', start: 'top 90%' },
      },
    );

    // 3. Section titles reveal
    gsap.utils.toArray<HTMLElement>('.section-title').forEach((el) => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 32 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
        },
      );
    });

    // 4. Section bodies
    gsap.utils.toArray<HTMLElement>('.section-body').forEach((el) => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 87%' },
        },
      );
    });

    // 5. Pillars/cards stagger — assets handled by Framer Motion inside AssetCard, skip .asset-card
    const pillarEls = gsap.utils.toArray<HTMLElement>('.landing__pillar, .how-step, .why-item');
    if (pillarEls.length > 0) {
      const triggerEl = document.querySelector('.landing__pillars, .how-steps, .why-grid');
      if (triggerEl) {
        gsap.fromTo(
          pillarEls,
          { autoAlpha: 0, y: 36 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power2.out',
            scrollTrigger: { trigger: triggerEl, start: 'top 80%' },
          },
        );
      }
    }

    // 6. CTA banner
    gsap.fromTo(
      '.landing__cta-banner',
      { autoAlpha: 0, y: 24 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.landing__cta-banner', start: 'top 88%' },
      },
    );

    return () => {
      heroTl.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="landing">
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="hero" aria-label="Hero section">
        <ParticleCanvas />
        <div className="hero__content" style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero__eyebrow">Bitcoin-Native · Testnet Live</div>
          <h1 className="hero__headline">
            <span style={{ display: 'block' }}>Own a piece</span>
            <span
              className="hero__headline--accent"
              style={{ display: 'block' }}
            >
              of the world.
            </span>
          </h1>
          <p className="hero__sub">
            Real estate, T-bills and gold — straight from your Bitcoin wallet.
            No bank. No broker. Just you.
          </p>
          <div className="hero__cta">
            <Link to="/marketplace" className="btn btn--primary btn--lg">
              Start Investing →
            </Link>
            <Link to="/docs" className="btn btn--secondary btn--lg">
              How it works
            </Link>
          </div>
        </div>

        <div className="hero__scroll-indicator" aria-hidden="true">
          <span>scroll</span>
          <div className="hero__scroll-dot" />
        </div>
      </section>

      {/* ── Stats Bar ────────────────────────────────── */}
      <div className="stats-bar" role="complementary" aria-label="Platform statistics">
        <div className="stats-bar__item">
          <span className="stats-bar__value">3</span>
          <span className="stats-bar__label">Assets Live</span>
        </div>
        <div className="stats-bar__sep" aria-hidden="true" />
        <div className="stats-bar__item">
          <span className="stats-bar__value">1,000</span>
          <span className="stats-bar__label">sats / fraction</span>
        </div>
        <div className="stats-bar__sep" aria-hidden="true" />
        <div className="stats-bar__item">
          <span className="stats-bar__value">L1</span>
          <span className="stats-bar__label">Bitcoin · Non-Custodial</span>
        </div>
        <div className="stats-bar__sep" aria-hidden="true" />
        <div className="stats-bar__item">
          <span className="stats-bar__value">Testnet</span>
          <span className="stats-bar__label">Live Now</span>
        </div>
      </div>

      {/* ── Featured Assets ───────────────────────────── */}
      <section
        className="landing__section landing__section--assets"
        aria-labelledby="assets-heading"
      >
        <div className="container">
          <h2 id="assets-heading" className="section-title">
            What you can own today
          </h2>
          <p className="section-body">
            Pick one. Sign once. Done.
          </p>
          <div className="asset-grid">
            {assets.length > 0
              ? assets.slice(0, 3).map((asset, i) => (
                  <AssetCard key={asset.id} asset={asset} index={i} />
                ))
              : [0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="asset-card-skeleton glass-card"
                    aria-hidden="true"
                  >
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

      {/* ── What is OPRWA ────────────────────────────── */}
      <section
        className="landing__section"
        style={{ background: 'var(--bg-2)' }}
        aria-labelledby="what-heading"
      >
        <div className="container">
          <h2 id="what-heading" className="section-title">
            Simple. Real. Yours.
          </h2>
          <p className="section-body">
            OPRWA puts institutional assets on Bitcoin. Buy a fraction of a
            skyscraper, a gold vault, or US government debt — with the same
            wallet you use for sats. No KYC friction on testnet.
          </p>
          <div className="landing__pillars">
            <div className="landing__pillar glass-card">
              <div className="landing__pillar-icon" aria-hidden="true">01</div>
              <h3>On-chain pricing</h3>
              <p>Same price every time. No oracle. No manipulation.</p>
            </div>
            <div className="landing__pillar glass-card">
              <div className="landing__pillar-icon" aria-hidden="true">02</div>
              <h3>Your keys, your asset</h3>
              <p>We never hold your funds. Not now, not ever.</p>
            </div>
            <div className="landing__pillar glass-card">
              <div className="landing__pillar-icon" aria-hidden="true">03</div>
              <h3>Always open</h3>
              <p>No business hours. No holidays. Bitcoin doesn't sleep.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────── */}
      <section
        className="landing__section"
        aria-labelledby="how-heading"
      >
        <div className="container">
          <h2 id="how-heading" className="section-title">
            Three steps. One Bitcoin wallet.
          </h2>
          <div className="how-steps">
            <div className="how-step glass-card">
              <div className="how-step__number" aria-hidden="true">1</div>
              <h3 className="how-step__title">Connect wallet</h3>
              <p className="how-step__desc">
                OPWallet, UniSat or OKX. Takes 10 seconds.
              </p>
            </div>
            <div className="how-step glass-card">
              <div className="how-step__number" aria-hidden="true">2</div>
              <h3 className="how-step__title">Choose an asset</h3>
              <p className="how-step__desc">
                Real estate. T-bills. Gold. Pick one.
              </p>
            </div>
            <div className="how-step glass-card">
              <div className="how-step__number" aria-hidden="true">3</div>
              <h3 className="how-step__title">Sign &amp; done</h3>
              <p className="how-step__desc">
                One signature. Position confirmed on-chain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Bitcoin? ─────────────────────────────── */}
      <section
        className="landing__section landing__section--why"
        aria-labelledby="why-heading"
      >
        <div className="container">
          <h2 id="why-heading" className="section-title">
            Why Bitcoin?
          </h2>
          <div className="why-grid">
            <div className="why-item glass-card">
              <div className="why-item__label">Ownership</div>
              <h3 className="why-item__title">No middleman</h3>
              <p className="why-item__desc">
                Your asset. Your keys. No bank takes a cut.
              </p>
            </div>
            <div className="why-item glass-card">
              <div className="why-item__label">Availability</div>
              <h3 className="why-item__title">Always open</h3>
              <p className="why-item__desc">
                Bitcoin doesn't close at 5pm. Neither do we.
              </p>
            </div>
            <div className="why-item glass-card">
              <div className="why-item__label">Transparency</div>
              <h3 className="why-item__title">Verifiable</h3>
              <p className="why-item__desc">
                Every number is on-chain. Check it yourself.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer CTA ───────────────────────────────── */}
      <section className="landing__cta-banner" aria-labelledby="cta-heading">
        <div className="container landing__cta-inner">
          <h2 id="cta-heading" className="landing__cta-title">
            Your first asset is one click away.
          </h2>
          <Link to="/marketplace" className="btn btn--primary btn--lg">
            Open Markets →
          </Link>
        </div>
      </section>

      <footer className="site-footer" role="contentinfo">
        <div className="container site-footer__inner">
          <span className="site-footer__brand">OPRWA</span>
          <span className="site-footer__note">
            Testnet Only · Built on Bitcoin
          </span>
        </div>
      </footer>
    </div>
  );
}
