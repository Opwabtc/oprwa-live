/**
 * InfiniteMarquee — horizontal infinite ticker with Lenis velocity boost.
 * Renders items three times for seamless loop. useLenis adjusts timeScale.
 */
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useLenis } from 'lenis/react';

interface MarqueeItem {
  label: string;
  accent?: string;
}

interface InfiniteMarqueeProps {
  items: MarqueeItem[];
  speed?: number;
}

function MarqueeItemEl({ item }: { item: MarqueeItem }): React.JSX.Element {
  return (
    <div className="marquee-item">
      {item.accent !== undefined ? (
        <>
          <span style={{ color: 'var(--accent)' }}>{item.accent}</span>
          {item.label}
        </>
      ) : (
        item.label
      )}
    </div>
  );
}

export function InfiniteMarquee({ items, speed = 40 }: InfiniteMarqueeProps): React.JSX.Element {
  const trackRef = useRef<HTMLDivElement>(null);
  // We measure the first copy via a wrapper span with known position
  const copy1Ref = useRef<HTMLSpanElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    const copy1 = copy1Ref.current;
    if (!track || !copy1) return;

    // Width of a single copy = right edge of last child in copy1
    const children = copy1.children;
    if (children.length === 0) return;
    const lastChild = children[children.length - 1] as HTMLElement;
    const singleWidth =
      lastChild.offsetLeft + lastChild.offsetWidth - (children[0] as HTMLElement).offsetLeft;

    if (singleWidth <= 0) return;

    const ctx = gsap.context(() => {
      tweenRef.current = gsap.to(track, {
        x: `-=${singleWidth}`,
        duration: speed,
        ease: 'none',
        repeat: -1,
        modifiers: {
          x: (x: string) => {
            const parsed = parseFloat(x);
            const wrapped = gsap.utils.wrap(-singleWidth, 0, parsed);
            return `${wrapped}px`;
          },
        },
      });
    }, track);

    return () => {
      tweenRef.current = null;
      ctx.revert();
    };
  }, [items, speed]);

  useLenis((lenis) => {
    if (!tweenRef.current) return;
    const velocity = lenis.velocity;
    const boost = Math.max(1, Math.min(4, 1 + Math.abs(velocity) / 3));
    tweenRef.current.timeScale(boost);
  });

  return (
    <div className="marquee-strip" aria-hidden="true">
      <div className="marquee-track" ref={trackRef}>
        <span ref={copy1Ref} style={{ display: 'contents' }}>
          {items.map((item, i) => (
            <MarqueeItemEl key={`a-${i}`} item={item} />
          ))}
        </span>
        {items.map((item, i) => (
          <MarqueeItemEl key={`b-${i}`} item={item} />
        ))}
        {items.map((item, i) => (
          <MarqueeItemEl key={`c-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
}
