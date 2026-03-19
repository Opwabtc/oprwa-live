/**
 * PopCatCursor — floating 3D bubble toggle that swaps the system cursor
 * to the pop-cat meme (normal + click states). Click the bubble again
 * to restore the default cursor.
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';

export function PopCatCursor(): React.JSX.Element {
  const [active, setActive] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

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

  // 3D tilt on mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rotX = ((e.clientY - cy) / (rect.height / 2)) * -22;
    const rotY = ((e.clientX - cx) / (rect.width / 2)) * 22;
    el.style.transform = `perspective(280px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.10) translateY(-4px)`;
    el.style.boxShadow = `
      ${rotY * -0.5}px ${rotX * 0.5 + 12}px 36px rgba(0,0,0,0.55),
      0 0 28px rgba(249,115,22,0.35),
      inset 0 1px 0 rgba(255,255,255,0.18)
    `;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    el.style.transform = '';
    el.style.boxShadow = '';
  }, []);

  return (
    <button
      ref={btnRef}
      className={`popcat-bubble${active ? ' popcat-bubble--active' : ''}`}
      onClick={toggle}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label={active ? 'Desativar cursor Pop Cat' : 'Ativar cursor Pop Cat'}
      title={active ? 'Desativar cursor Pop Cat' : 'Ativar cursor Pop Cat'}
    >
      <span className="popcat-bubble__face" aria-hidden="true">
        <img
          src={active ? '/popcat-click.png' : '/popcat-normal.png'}
          alt=""
          className="popcat-bubble__img"
          draggable={false}
        />
      </span>
      {active && <span className="popcat-bubble__on" aria-hidden="true">ON</span>}
    </button>
  );
}
