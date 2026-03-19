/**
 * PopCatCursor — floating bubble toggle that swaps the system cursor
 * to the pop-cat meme (normal + click states). Click the bubble again
 * to restore the default cursor.
 */
import React, { useEffect, useState, useCallback } from 'react';

export function PopCatCursor(): React.JSX.Element {
  const [active, setActive] = useState(false);

  // Inject / remove the cursor styles on the document root
  useEffect(() => {
    const root = document.documentElement;
    if (active) {
      root.classList.add('popcat-mode');
    } else {
      root.classList.remove('popcat-mode');
    }
    return () => root.classList.remove('popcat-mode');
  }, [active]);

  const toggle = useCallback(() => setActive((v) => !v), []);

  return (
    <button
      className={`popcat-bubble${active ? ' popcat-bubble--active' : ''}`}
      onClick={toggle}
      aria-label={active ? 'Desativar cursor Pop Cat' : 'Ativar cursor Pop Cat'}
      title={active ? 'Desativar cursor Pop Cat' : 'Ativar cursor Pop Cat'}
    >
      <span className="popcat-bubble__emoji" aria-hidden="true">🐱</span>
      <span className="popcat-bubble__label">{active ? 'ON' : ''}</span>
    </button>
  );
}
