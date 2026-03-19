/**
 * PopCatCursor — floating 3D bubble that toggles the pop-cat meme cursor.
 * Uses JS mousedown/mouseup to reliably swap cursor images (CSS :active
 * doesn't update cursor in Chrome/Edge on the same frame).
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { sounds } from '@/hooks/useSounds';

const CURSOR_NORMAL = "url('/popcat-normal-64.png') 32 32, auto";
const CURSOR_CLICK  = "url('/popcat-click-64.png') 32 32, auto";

export function PopCatCursor(): React.JSX.Element {
  const [active, setActive] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const activeRef = useRef(false); // stable ref for event listeners

  // Sync ref to state so event listeners always see current value
  useEffect(() => { activeRef.current = active; }, [active]);

  // Inject cursor CSS vars + JS mousedown/mouseup when active
  useEffect(() => {
    const root = document.documentElement;

    if (active) {
      root.style.cursor = CURSOR_NORMAL;

      const onDown = (): void => {
        if (activeRef.current) root.style.cursor = CURSOR_CLICK;
      };
      const onUp = (): void => {
        if (activeRef.current) root.style.cursor = CURSOR_NORMAL;
      };

      document.addEventListener('mousedown', onDown);
      document.addEventListener('mouseup', onUp);

      return (): void => {
        document.removeEventListener('mousedown', onDown);
        document.removeEventListener('mouseup', onUp);
        root.style.cursor = '';
      };
    } else {
      root.style.cursor = '';
    }
  }, [active]);

  const toggle = useCallback((): void => {
    sounds.click();
    setActive((v) => !v);
  }, []);

  // 3D magnetic tilt on mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>): void => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rotX = ((e.clientY - cy) / (rect.height / 2)) * -24;
    const rotY = ((e.clientX - cx) / (rect.width / 2)) * 24;
    const shadowX = rotY * -0.5;
    const shadowY = Math.abs(rotX) * 0.4 + 12;
    el.style.transform = `perspective(260px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.12) translateY(-5px)`;
    el.style.boxShadow = `${shadowX}px ${shadowY}px 38px rgba(0,0,0,0.60), 0 0 28px rgba(249,115,22,0.32), inset 0 1px 0 rgba(255,255,255,0.22)`;
  }, []);

  const handleMouseLeave = useCallback((): void => {
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
          src={active ? '/popcat-click-64.png' : '/popcat-normal-64.png'}
          alt=""
          className="popcat-bubble__img"
          draggable={false}
        />
      </span>
      {active && <span className="popcat-bubble__on" aria-hidden="true">ON</span>}
    </button>
  );
}
