/**
 * ScrambleText — scrambles text on hover, resolves back on leave.
 * Renders as an inline <span>. Pass className / style as needed.
 */
import React, { useRef, useCallback } from 'react';

const SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

type IntrinsicTag = keyof React.JSX.IntrinsicElements;

interface ScrambleTextProps {
  children: string;
  className?: string;
  style?: React.CSSProperties;
  speed?: number;      // ms between frames (default 35)
  steps?: number;      // frames to fully resolve (default 10)
  tag?: IntrinsicTag;
}

export function ScrambleText({
  children,
  className,
  style,
  speed = 35,
  steps = 10,
  tag = 'span',
}: ScrambleTextProps): React.JSX.Element {
  const Tag = tag as IntrinsicTag;
  const elRef = useRef<HTMLElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const original = children;

  const startScramble = useCallback((): void => {
    const el = elRef.current;
    if (!el) return;
    if (timerRef.current) clearInterval(timerRef.current);

    let frame = 0;
    timerRef.current = setInterval(() => {
      frame++;
      const progress = Math.min(frame / steps, 1);

      if (progress >= 1) {
        clearInterval(timerRef.current!);
        el.textContent = original;
        return;
      }

      const resolved = Math.floor(progress * original.length);
      el.textContent = original
        .split('')
        .map((char, i) => {
          if (char === ' ') return ' ';
          if (i < resolved) return char;
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        })
        .join('');
    }, speed);
  }, [original, speed, steps]);

  const stopScramble = useCallback((): void => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (elRef.current) elRef.current.textContent = original;
  }, [original]);

  // callback ref that works with any tag
  const setRef = useCallback((node: HTMLElement | null) => {
    elRef.current = node;
  }, []);

  const tagProps = {
    ref: setRef as React.RefCallback<HTMLElement>,
    className,
    style,
    onMouseEnter: startScramble,
    onMouseLeave: stopScramble,
  };

  return React.createElement(Tag, tagProps, children);
}
