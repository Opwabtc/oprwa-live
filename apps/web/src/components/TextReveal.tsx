/**
 * TextReveal — wraps children text in word-level overflow:hidden masks.
 * On scroll enter: words slide up from yPercent:110 → 0 with stagger.
 * className is passed to the outer wrapper.
 */
import React, { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface TextRevealProps {
  children: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
}

export function TextReveal({
  children,
  as: Tag = 'span',
  className,
  delay = 0,
  stagger = 0.05,
  once = true,
}: TextRevealProps): React.JSX.Element {
  // Store a mutable ref to the DOM element; callback ref avoids tag-specific typing
  const elRef = useRef<HTMLElement | null>(null);

  const setRef = useCallback((node: HTMLElement | null) => {
    elRef.current = node;
  }, []);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const chars = el.querySelectorAll<HTMLElement>('.tr-char');
    if (chars.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        chars,
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.75,
          ease: 'power3.out',
          delay,
          stagger,
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once,
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [children, delay, stagger, once]);

  const words = children.split(' ');

  const content = words.map((word, i) => (
    <React.Fragment key={i}>
      <span className="tr-word">
        <span className="tr-char">{word}</span>
      </span>
      {i < words.length - 1 && ' '}
    </React.Fragment>
  ));

  // Use a spread to pass the callback ref — TypeScript accepts this pattern
  // because HTMLElement is the common base for all heading/p/span elements.
  const tagProps = {
    ref: setRef as React.RefCallback<HTMLElement>,
    className,
  };

  return <Tag {...tagProps}>{content}</Tag>;
}
