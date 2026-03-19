/**
 * StackedCards — pinned GSAP section with slow scroll peel + parallax atmosphere.
 */
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface StackedCard {
  number: string;
  title: string;
  desc: string;
  tag?: string;
}

interface StackedCardsProps {
  cards: StackedCard[];
  heading?: string;
  eyebrow?: string;
}

export function StackedCards({ cards, heading, eyebrow }: StackedCardsProps): React.JSX.Element {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const cardEls = Array.from(stage.querySelectorAll<HTMLElement>('.sc-card'));
    if (cardEls.length === 0) return;

    const n = cardEls.length;

    cardEls.forEach((card, i) => {
      gsap.set(card, {
        scale: 1 - i * 0.05,
        y: i * 20,
        zIndex: n - i,
        transformOrigin: 'bottom center',
      });
    });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: `+=${(n + 1) * 500}`,
          pin: true,
          scrub: 2.5,
        },
      });

      const segSize = 1 / n;

      for (let i = 0; i < n; i++) {
        const card = cardEls[i];
        if (!card) continue;
        const at = i * segSize;

        tl.to(
          card,
          { y: '-120%', opacity: 0, rotateX: 8, ease: 'power2.in', duration: segSize * 0.85 },
          at,
        );

        for (let j = i + 1; j < n; j++) {
          const downstream = cardEls[j];
          if (!downstream) continue;
          const newRank = j - (i + 1);
          tl.to(
            downstream,
            {
              scale: 1 - newRank * 0.05,
              y: newRank * 20,
              ease: 'power2.out',
              duration: segSize * 0.85,
            },
            at,
          );
        }
      }

      // Parallax atmosphere lines
      const parallax = parallaxRef.current;
      if (parallax) {
        const lines = Array.from(parallax.querySelectorAll<HTMLElement>('.sc-parallax__line'));

        const st = {
          trigger: stage,
          start: 'top top',
          end: `+=${(n + 1) * 500}`,
          scrub: 1.8,
        };

        lines[0] && gsap.fromTo(lines[0], { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, scrollTrigger: { ...st, scrub: 1.2 } });
        lines[1] && gsap.fromTo(lines[1], { scaleX: 1, opacity: 0.5 }, { scaleX: 0.3, opacity: 0, scrollTrigger: { ...st, scrub: 1.0 } });
      }
    }, section);

    return () => ctx.revert();
  }, [cards]);

  return (
    <div className="sc-section" ref={sectionRef}>
      {/* Parallax atmosphere — behind the stage */}
      <div className="sc-parallax" ref={parallaxRef} aria-hidden="true">
        <div className="sc-parallax__line sc-parallax__line--1" />
        <div className="sc-parallax__line sc-parallax__line--2" />
      </div>

      <div className="sc-stage" ref={stageRef}>
        {eyebrow !== undefined && <div className="section-eyebrow sc-eyebrow">{eyebrow}</div>}
        {heading !== undefined && <p className="sc-heading">{heading}</p>}
        <div className="sc-stack">
          {cards.map((card, i) => (
            <div
              key={i}
              className="sc-card glass-card"
            >
              <div className="sc-card__top">
                <span className="sc-card__num">{card.number}</span>
                {card.tag !== undefined && (
                  <span className="sc-card__tag">{card.tag}</span>
                )}
              </div>
              <div>
                <h3 className="sc-card__title">{card.title}</h3>
                <p className="sc-card__desc">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
