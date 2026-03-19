import React, { useState } from 'react';
import { useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAssets } from '@/hooks/useAssets';
import { AssetCard } from '@/components/AssetCard';
import { TextReveal } from '@/components/TextReveal';
import { StackedCards } from '@/components/StackedCards';
import { SiteFooter } from '@/components/SiteFooter';

gsap.registerPlugin(ScrollTrigger);

const STACKED_CARDS = [
  {
    number: '01',
    title: 'Connect your wallet',
    desc: 'OPWallet, UniSat or OKX. No signup. No KYC. Your keys, your call.',
    tag: '30 seconds',
  },
  {
    number: '02',
    title: 'Pick your asset',
    desc: 'Real estate in São Paulo, gold in Zurich, T-bills. Choose what you believe in.',
    tag: 'Your choice',
  },
  {
    number: '03',
    title: 'Sign and you own it',
    desc: 'One signature. Your position is recorded on Bitcoin. You hold it — nobody else.',
    tag: 'On-chain',
  },
];

const FILTER_OPTS = [
  { value: '', label: 'All assets' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'fixed_income', label: 'Fixed Income' },
  { value: 'commodity', label: 'Commodity' },
];

export function Landing(): React.JSX.Element {
  const { assets } = useAssets();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const whyGridRef = useRef<HTMLDivElement>(null);
  const gradientHeadRef = useRef<HTMLSpanElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero__sub', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.65 });
      gsap.fromTo('.hero__cta', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.9 });

      gsap.to('.hero__content', {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });

      gsap.to('.hero__video', {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });

      // Blur + fade hero content as user scrolls into assets
      gsap.to('.hero__content', {
        filter: 'blur(14px)',
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: '42% top', end: '86% top', scrub: 1.4 },
      });

      // Assets heading reveal
      gsap.fromTo('#assets-heading',
        { autoAlpha: 0, y: 32, scale: 0.96 },
        {
          autoAlpha: 1, y: 0, scale: 1, duration: 0.85, ease: 'power3.out',
          scrollTrigger: { trigger: '#assets-heading', start: 'top 88%', toggleActions: 'play none none none' },
        },
      );

      // Section body text parallax depth
      gsap.utils.toArray<HTMLElement>('.section-body').forEach((el) => {
        gsap.fromTo(el, { y: 18, autoAlpha: 0 }, {
          y: 0, autoAlpha: 1, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
        });
      });

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

      const whyGrid = whyGridRef.current;
      if (whyGrid) {
        const whyItems = Array.from(whyGrid.querySelectorAll<HTMLElement>('.why-item'));
        gsap.fromTo(
          whyItems,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.65,
            stagger: 0.12,
            ease: 'power2.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: whyGrid,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          },
        );
      }

      gsap.fromTo('#why-heading',
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: '#why-heading', start: 'top 92%', toggleActions: 'play none none none' },
        },
      );
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    document.querySelectorAll('.reveal-up, .reveal-stagger').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Hero headline mouse parallax — moves opposite to cursor, max ±10px
  useEffect(() => {
    const heroEl = heroRef.current;
    if (!heroEl) return;
    const headlineEl = heroEl.querySelector<HTMLElement>('.hero__headline');
    const subEl = heroEl.querySelector<HTMLElement>('.hero__sub');
    if (!headlineEl) return;

    const xTo = gsap.quickTo(headlineEl, 'x', { duration: 1.1, ease: 'power2.out' });
    const yTo = gsap.quickTo(headlineEl, 'y', { duration: 1.1, ease: 'power2.out' });
    const xToSub = subEl ? gsap.quickTo(subEl, 'x', { duration: 1.4, ease: 'power2.out' }) : null;
    const yToSub = subEl ? gsap.quickTo(subEl, 'y', { duration: 1.4, ease: 'power2.out' }) : null;

    const onMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const rx = (e.clientX - cx) / cx;
      const ry = (e.clientY - cy) / cy;
      xTo(-rx * 10);
      yTo(-ry * 6);
      xToSub?.(-rx * 5);
      yToSub?.(-ry * 3);
    };

    const onMouseLeave = () => {
      xTo(0); yTo(0);
      xToSub?.(0); yToSub?.(0);
    };

    heroEl.addEventListener('mousemove', onMouseMove);
    heroEl.addEventListener('mouseleave', onMouseLeave);

    return () => {
      heroEl.removeEventListener('mousemove', onMouseMove);
      heroEl.removeEventListener('mouseleave', onMouseLeave);
      gsap.killTweensOf(headlineEl);
      if (subEl) gsap.killTweensOf(subEl);
    };
  }, []);

  const handleCardTilt = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    el.style.transform = `perspective(900px) rotateX(${-dy * 6}deg) rotateY(${dx * 6}deg) translateZ(8px)`;
    el.style.setProperty('--mx', (((e.clientX - rect.left) / rect.width) * 100).toFixed(1));
    el.style.setProperty('--my', (((e.clientY - rect.top) / rect.height) * 100).toFixed(1));
  }, []);

  const handleCardTiltLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = '';
  }, []);

  return (
    <div className="landing">
      {/* ── Hero ─────────────────────────────────────── */}
      <section ref={heroRef} className="hero" aria-label="Hero section">
        <video
          ref={videoRef}
          className="hero__video"
          src="/hero-bg.mp4"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
        <div className="hero__overlay" aria-hidden="true" />
        <div className="hero__fluid" aria-hidden="true" />

        <div className="hero__content">
          <h1 className="hero__headline">
            <TextReveal as="span" delay={0.3} stagger={0.06} className="hero__headline-line hero__headline-white">
              Own a piece
            </TextReveal>
            <span className="hero__headline--accent hero__accent-reveal" style={{ display: 'block' }}>
              of the world.
            </span>
          </h1>
          <p className="hero__sub">
            Buy into real estate, gold and government bonds with any amount of Bitcoin.
            No bank. No minimum. No bullshit.
          </p>
          <div className="hero__cta">
            <a href="#markets" className="btn btn--primary btn--lg">
              Start owning →
            </a>
            <Link to="/docs" className="btn btn--secondary btn--lg">
              How it works
            </Link>
          </div>
        </div>
      </section>

      {/* ── Marquee strip ─────────────────────────────── */}
      <div className="marquee-strip" aria-hidden="true">
        <div className="marquee-track">
          {Array.from({ length: 4 }, (_, gi) =>
            ['Real Estate', '·', 'Gold', '·', 'T-Bills', '·', 'Bitcoin', '·', 'On-Chain', '·', 'Non-Custodial', '·', 'OPNet', '·'].map((item, i) => (
              <span key={`${gi}-${i}`} className={`marquee-item${item === '·' ? ' marquee-dot' : ''}`}>{item}</span>
            ))
          )}
        </div>
      </div>

      {/* ── Assets / Markets ─────────────────────────── */}
      <section
        id="markets"
        className="landing__section landing__section--assets"
        aria-labelledby="assets-heading"
      >
        <div className="container">
          <h2 id="assets-heading" className="section-title">
            <span ref={gradientHeadRef} className="gradient-scroll-text">
              What you can own today
            </span>
          </h2>
          <p className="section-body reveal-up">Pick your asset. Decide how much. Done.</p>

          {/* Search + filter bar */}
          <div className="asset-toolbar">
            <div className="asset-toolbar__search">
              <span className="asset-toolbar__search-icon" aria-hidden="true">⌕</span>
              <input
                type="text"
                placeholder="Search assets..."
                className="asset-toolbar__input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search assets"
              />
              {search && (
                <button
                  className="asset-toolbar__clear"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
            <div className="asset-toolbar__filters" role="group" aria-label="Filter by category">
              {FILTER_OPTS.map((opt) => (
                <button
                  key={opt.value}
                  className={`asset-toolbar__filter-btn${filterCat === opt.value ? ' asset-toolbar__filter-btn--active' : ''}`}
                  onClick={() => setFilterCat(opt.value)}
                  aria-pressed={filterCat === opt.value}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="asset-grid">
            {assets.length > 0
              ? assets
                  .filter((asset) =>
                    (filterCat === '' || asset.category === filterCat) &&
                    (search === '' || asset.name.toLowerCase().includes(search.toLowerCase()))
                  )
                  .map((asset, i) => (
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
        heading="Three steps. One wallet."
      />

      {/* ── Why Bitcoin? ─────────────────────────────── */}
      <section className="landing__section landing__section--why" aria-labelledby="why-heading">
        <div className="container">
          <h2 id="why-heading" className="section-title">
            <TextReveal as="span" stagger={0.07}>
              Why Bitcoin?
            </TextReveal>
          </h2>
          <div className="why-grid reveal-stagger" ref={whyGridRef}>
            <div
              className="why-item glass-card"
              onMouseMove={handleCardTilt}
              onMouseLeave={handleCardTiltLeave}
            >
              <div className="why-item__label">Ownership</div>
              <h3 className="why-item__title">You own it, for real</h3>
              <p className="why-item__desc">No bank. No fund manager. When you buy, you hold it — and nobody else can touch it.</p>
            </div>
            <div
              className="why-item glass-card"
              onMouseMove={handleCardTilt}
              onMouseLeave={handleCardTiltLeave}
            >
              <div className="why-item__label">Availability</div>
              <h3 className="why-item__title">Invest at 3am if you want</h3>
              <p className="why-item__desc">Bitcoin doesn't close at 5pm. Neither do we. Buy any time, from anywhere.</p>
            </div>
            <div
              className="why-item glass-card"
              onMouseMove={handleCardTilt}
              onMouseLeave={handleCardTiltLeave}
            >
              <div className="why-item__label">Transparency</div>
              <h3 className="why-item__title">See every number, always</h3>
              <p className="why-item__desc">Every position lives on Bitcoin's blockchain. Check it yourself any time — no trust required.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <SiteFooter />
    </div>
  );
}
