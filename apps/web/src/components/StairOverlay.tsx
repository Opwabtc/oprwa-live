import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const N = 6;
const STRIP_DELAY = 55; // ms between each strip
const DURATION = 380;   // ms for each strip's transition

export function StairOverlay(): React.JSX.Element | null {
  const location = useLocation();
  const prevPath = useRef(location.pathname);
  const [phase, setPhase] = useState<'idle' | 'in' | 'out'>('idle');

  useEffect(() => {
    if (location.pathname === prevPath.current) return;
    prevPath.current = location.pathname;

    setPhase('in');

    const inDone = DURATION + N * STRIP_DELAY + 80;
    const outDone = inDone + DURATION + N * STRIP_DELAY + 120;

    const t1 = setTimeout(() => setPhase('out'), inDone);
    const t2 = setTimeout(() => setPhase('idle'), outDone);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [location.pathname]);

  if (phase === 'idle') return null;

  return (
    <div className="stair-overlay" aria-hidden="true">
      {Array.from({ length: N }, (_, i) => (
        <div
          key={i}
          className={`stair-strip stair-strip--${phase}`}
          style={{ '--strip-i': i } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
