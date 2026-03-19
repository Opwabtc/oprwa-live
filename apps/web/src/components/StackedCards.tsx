/**
 * StackedCards — pinned GSAP section with slow scroll peel and 3D mouse tilt.
 */
import React, { useEffect, useRef, useCallback } from 'react';
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
}

export function StackedCards({ cards, heading }: StackedCardsProps): React.JSX.Element {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

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
      // Slower: increased scroll travel (500px/card) and scrub (2.5)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: `+=${n * 500}`,
          pin: true,
          scrub: 2.5,
        },
      });

      const segSize = 1 / (n - 1);

      for (let i = 0; i < n - 1; i++) {
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
    }, section);

    return () => ctx.revert();
  }, [cards]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    el.style.transform = `perspective(900px) rotateX(${-dy * 7}deg) rotateY(${dx * 7}deg) translateZ(10px)`;
    el.style.setProperty('--mx', (((e.clientX - rect.left) / rect.width) * 100).toFixed(1));
    el.style.setProperty('--my', (((e.clientY - rect.top) / rect.height) * 100).toFixed(1));
  }, []);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = '';
  }, []);

  return (
    <div className="sc-section" ref={sectionRef}>
      <div className="sc-stage" ref={stageRef}>
        {heading !== undefined && <p className="sc-heading">{heading}</p>}
        <div className="sc-stack">
          {cards.map((card, i) => (
            <div
              key={i}
              className="sc-card glass-card"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
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
