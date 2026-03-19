/**
 * StackedCards — pinned GSAP section. Cards start stacked with 3D perspective.
 * As scroll advances, each card peels off (scale down, y up, opacity fade).
 * The last card stays visible.
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

    // Set initial stacked state — card[0] on top, cards behind scaled/offset
    cardEls.forEach((card, i) => {
      gsap.set(card, {
        scale: 1 - i * 0.05,
        y: i * 20,
        zIndex: n - i,
        transformOrigin: 'bottom center',
      });
    });

    const ctx = gsap.context(() => {
      // Pin stage for n * 300px of scroll travel
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: `+=${n * 300}`,
          pin: true,
          scrub: 1.2,
        },
      });

      // Each card except last peels off in its own segment
      const segSize = 1 / (n - 1);

      for (let i = 0; i < n - 1; i++) {
        const card = cardEls[i];
        if (!card) continue;
        const at = i * segSize;

        // Peel current top card off
        tl.to(
          card,
          { y: '-120%', opacity: 0, rotateX: 8, ease: 'power2.in', duration: segSize * 0.8 },
          at,
        );

        // Promote remaining cards
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
              duration: segSize * 0.8,
            },
            at,
          );
        }
      }
    }, section);

    return () => ctx.revert();
  }, [cards]);

  return (
    <div className="sc-section" ref={sectionRef}>
      <div className="sc-stage" ref={stageRef}>
        {heading !== undefined && <p className="sc-heading">{heading}</p>}
        <div className="sc-stack">
          {cards.map((card, i) => (
            <div key={i} className="sc-card">
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
