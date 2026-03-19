/**
 * TextShuffle — scrambles text character by character on scroll enter.
 * Each char runs through random chars before resolving to the real one.
 */
import React, { useEffect, useRef, useState } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%';

interface TextShuffleProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
}

export function TextShuffle({
  text,
  className,
  delay = 0,
  speed = 40,
}: TextShuffleProps): React.JSX.Element {
  const [displayed, setDisplayed] = useState<string>(text);
  const containerRef = useRef<HTMLSpanElement>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry || !entry.isIntersecting || hasRun.current) return;
        hasRun.current = true;
        observer.disconnect();

        const chars = text.split('');
        const resolved = new Array<string>(chars.length).fill(' ');

        // Per-char random frame counts
        const frameCounts = chars.map(() => 4 + Math.floor(Math.random() * 5));
        const frameCounters = new Array<number>(chars.length).fill(0);
        let doneCount = 0;

        const startTime = performance.now();

        const intervalId = setInterval(() => {
          const elapsed = performance.now() - startTime - delay;
          if (elapsed < 0) return;

          let updated = false;

          chars.forEach((realChar, i) => {
            if (resolved[i] === realChar) return;

            const charDelay = i * 40;
            if (elapsed < charDelay) {
              resolved[i] = CHARS[Math.floor(Math.random() * CHARS.length)] ?? 'X';
              updated = true;
              return;
            }

            frameCounters[i] += 1;

            if (frameCounters[i] >= frameCounts[i]) {
              resolved[i] = realChar;
              doneCount += 1;
              updated = true;
            } else {
              resolved[i] = CHARS[Math.floor(Math.random() * CHARS.length)] ?? 'X';
              updated = true;
            }
          });

          if (updated) {
            setDisplayed(resolved.join(''));
          }

          if (doneCount >= chars.length) {
            clearInterval(intervalId);
            setDisplayed(text);
          }
        }, speed);
      },
      { threshold: 0.2 },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [text, delay, speed]);

  return (
    <span ref={containerRef} className={`text-shuffle${className ? ` ${className}` : ''}`}>
      {displayed}
    </span>
  );
}
