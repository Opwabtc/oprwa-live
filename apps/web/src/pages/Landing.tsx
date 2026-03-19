import React from 'react';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAssets } from '@/hooks/useAssets';
import { AssetCard } from '@/components/AssetCard';
import { TextReveal } from '@/components/TextReveal';
import { TextShuffle } from '@/components/TextShuffle';
import { StackedCards } from '@/components/StackedCards';

gsap.registerPlugin(ScrollTrigger);

const STACKED_CARDS = [
  {
    number: '01',
    title: 'Connect your wallet',
    desc: 'OPWallet, UniSat or OKX. No KYC. No registration. Just your keys.',
    tag: '30 seconds',
  },
  {
    number: '02',
    title: 'Choose an asset',
    desc: 'Real estate. T-Bills. Gold. Browse on-chain properties with full transparency.',
    tag: 'Your choice',
  },
  {
    number: '03',
    title: 'Sign & confirm',
    desc: 'One signature. Position minted on Bitcoin L1. Fully non-custodial.',
    tag: 'On-chain',
  },
];

export function Landing(): React.JSX.Element {
  const { assets } = useAssets();
  const videoRef = useRef<HTMLVideoElement>(null);
  const whyGridRef = useRef<HTMLDivElement>(null);
  const gradientHeadRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Hero entrance
      gsap.fromTo('.hero__sub', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.65 });
      gsap.fromTo('.hero__cta', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.9 });
      gsap.fromTo('.hero__scroll-indicator', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, delay: 1.3 });

      // 2. Parallax hero text
      gsap.to('.hero__content', {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });

      // 3. Video parallax (subtle)
      gsap.to('.hero__video', {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });

      // 4. Asset cards stagger
      gsap.fromTo(
        '.asset-grid .asset-card',
        { autoAlpha: 0, y: 40 },
        {
          autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: '.asset-grid', start: 'top 80%' },
        },
      );

      // 5. Gradient scroll text on #markets heading
      const gradientEl = gradientHeadRef.current;
      if (gradientEl) {
        gsap.fromTo(
          gradientEl,
          { backgroundPosition: '100% 50%' },
          {
            backgroundPosition: '0% 50%',
            ease: 'none',
            scrollTrigger: {
              trigger: gradientEl,
              start: 'top 90%',
              end: 'top 40%',
              scrub: 1,
            },
          },
        );
      }

      // 6. Why Bitcoin staircase: add .stair-visible to each .why-item with stagger
      const whyGrid = whyGridRef.current;
      if (whyGrid) {
        const whyItems = Array.from(whyGrid.querySelectorAll<HTMLElement>('.why-item'));
        gsap.fromTo(
          whyItems,
          { x: -40, y: 20, opacity: 0 },
          {
            x: 0,
            y: 0,
            opacity: 1,
            duration: 0.65,
            stagger: 0.12,
            ease: 'cubic.bezier(0.22, 1, 0.36, 1)',
            scrollTrigger: {
              trigger: whyGrid,
              start: 'top 80%',
              onEnter: () => {
                whyItems.forEach((item, i) => {
                  setTimeout(() => {
                    item.classList.add('stair-visible');
                  }, i * 120);
                });
              },
              once: true,
            },
          },
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="landing">
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="hero" aria-label="Hero section">
        <video
          ref={videoRef}
          className="hero__video"
          src="/buidl.mp4"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
        <div className="hero__overlay" aria-hidden="true" />
        <div className="hero__fluid" aria-hidden="true" />

        <div className="hero__content">
          <div className="hero__eyebrow">
            <TextShuffle text="Bitcoin-Native · Testnet Live" delay={200} speed={35} />
          </div>
          <h1 className="hero__headline">
            <TextReveal as="span" delay={0.3} stagger={0.06} className="hero__headline-line">
              Own a piece
            </TextReveal>
            <span className="hero__headline--accent" style={{ display: 'block' }}>
              <TextReveal as="span" delay={0.5} stagger={0.06}>
                of the world.
              </TextReveal>
            </span>
          </h1>
          <p className="hero__sub">
            Real estate, T-bills and gold — straight from your Bitcoin wallet.
            No bank. No broker. Just you.
          </p>
          <div className="hero__cta">
            <a href="#markets" className="btn btn--primary btn--lg">
              Start Investing →
            </a>
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

      {/* ── Assets / Markets ─────────────────────────── */}
      <section
        id="markets"
        className="landing__section landing__section--assets"
        aria-labelledby="assets-heading"
      >
        <div className="container">
          <h2 id="assets-heading" className="section-title">
            <TextReveal as="span" stagger={0.06}>
              What you can own
            </TextReveal>{' '}
            <span ref={gradientHeadRef} className="gradient-scroll-text">
              today
            </span>
          </h2>
          <p className="section-body">Pick one. Sign once. Done.</p>
          <div className="asset-grid">
            {assets.length > 0
              ? assets.map((asset, i) => (
                  <AssetCard key={asset.id} asset={asset} index={i} />
                ))
              : [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="asset-card-skeleton glass-card" aria-hidden="true">
                    <div className="skeleton-block skeleton-block--header" />
                    <div className="skeleton-block skeleton-block--title" />
                    <div className="skeleton-block skeleton-block--body" />
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* ── Stacked Cards (Three Steps) ───────────────── */}
      <StackedCards
        cards={STACKED_CARDS}
        heading="Three Steps. One Wallet."
      />

      {/* ── Why Bitcoin? ─────────────────────────────── */}
      <section className="landing__section landing__section--why" aria-labelledby="why-heading">
        <div className="container">
          <h2 id="why-heading" className="section-title">
            <TextReveal as="span" stagger={0.07}>
              Why Bitcoin?
            </TextReveal>
          </h2>
          <div className="why-grid" ref={whyGridRef}>
            <div className="why-item glass-card" data-staircase>
              <div className="why-item__label">Ownership</div>
              <h3 className="why-item__title">No middleman</h3>
              <p className="why-item__desc">Your asset. Your keys. No bank takes a cut.</p>
            </div>
            <div className="why-item glass-card" data-staircase>
              <div className="why-item__label">Availability</div>
              <h3 className="why-item__title">Always open</h3>
              <p className="why-item__desc">Bitcoin doesn't close at 5pm. Neither do we.</p>
            </div>
            <div className="why-item glass-card" data-staircase>
              <div className="why-item__label">Transparency</div>
              <h3 className="why-item__title">Verifiable</h3>
              <p className="why-item__desc">Every number is on-chain. Check it yourself.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="site-footer" role="contentinfo">
        <div className="container">
          <div className="site-footer__grid">
            <div className="site-footer__brand-col">
              <span className="site-footer__brand">OPRWA</span>
              <p className="site-footer__tagline">
                Real World Assets on Bitcoin. Own fractions of global properties
                directly from your wallet. No bank. No broker.
              </p>
              <span className="site-footer__badge">Testnet Live</span>
            </div>

            <div>
              <p className="site-footer__col-title">Platform</p>
              <ul className="site-footer__links">
                <li><a href="#markets" className="site-footer__link">Markets</a></li>
                <li><Link to="/app" className="site-footer__link">Dashboard</Link></li>
                <li><Link to="/docs" className="site-footer__link">Docs</Link></li>
              </ul>
            </div>

            <div>
              <p className="site-footer__col-title">Resources</p>
              <ul className="site-footer__links">
                <li><a href="https://opnet.org" target="_blank" rel="noopener noreferrer" className="site-footer__link">OPNet</a></li>
                <li>
                  <a
                    href="https://opscan.org/accounts/opt1sqrectyl6jplc9jesnuupzluxpak6d42qwu6dxec0?network=testnet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="site-footer__link"
                  >
                    Contract ↗
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/Opwabtc/oprwa-live"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="site-footer__link"
                  >
                    GitHub ↗
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="site-footer__col-title">Legal</p>
              <ul className="site-footer__links">
                <li><a href="#" className="site-footer__link">Terms of Use</a></li>
                <li><a href="#" className="site-footer__link">Privacy Policy</a></li>
                <li><a href="#" className="site-footer__link">Risk Disclosure</a></li>
              </ul>
              <p className="site-footer__col-title" style={{ marginTop: '1.5rem' }}>Contract</p>
              <p className="site-footer__contract">opt1sqrectyl6jplc9jesnuupzluxpak6d42qwu6dxec0</p>
            </div>
          </div>

          <div className="site-footer__bottom">
            <span className="site-footer__copy">© 2026 OPRWA. All rights reserved.</span>
            <span className="site-footer__note">Built on Bitcoin · OPNet Testnet</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
