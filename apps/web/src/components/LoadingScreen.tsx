import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps): React.JSX.Element {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const totalMs = 1400;
    const steps = 70;
    const intervalMs = totalMs / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += 100 / steps;
      const clamped = Math.min(current, 100);
      setProgress(clamped);
      if (clamped >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          setLeaving(true);
          setTimeout(onComplete, 500);
        }, 200);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className={`loading-screen${leaving ? ' loading-screen--leaving' : ''}`} aria-hidden="true">
      <div className="loading-screen__content">
        <div className="loading-screen__wordmark">OPRWA</div>
        <div className="loading-screen__tagline">Real assets on Bitcoin</div>
        <div className="loading-screen__track">
          <div
            className="loading-screen__fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="loading-screen__pct">{Math.floor(progress)}%</div>
      </div>
    </div>
  );
}
