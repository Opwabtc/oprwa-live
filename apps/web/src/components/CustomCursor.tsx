import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function CustomCursor(): React.JSX.Element {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Hide default cursor on desktop only
    if (window.matchMedia('(pointer: fine)').matches) {
      document.documentElement.style.cursor = 'none';
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    const onMove = (e: MouseEvent): void => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Dot follows instantly
      gsap.set(dot, { x: mouseX, y: mouseY });
    };

    // Ring follows with lag (lerp via GSAP ticker)
    const tick = (): void => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      gsap.set(ring, { x: ringX, y: ringY });
    };
    gsap.ticker.add(tick);

    // Magnetic effect on buttons and links
    const magneticEls = document.querySelectorAll<HTMLElement>('.btn--primary, .btn--secondary, .app-nav__logo');
    const cleanupMagnetic: (() => void)[] = [];

    magneticEls.forEach((el) => {
      const onEnter = (): void => {
        gsap.to(ring, { scale: 2.5, opacity: 0.5, duration: 0.3, ease: 'power2.out' });
        gsap.to(dot, { scale: 0.3, duration: 0.3 });
        document.documentElement.style.cursor = 'none';
      };
      const onLeave = (): void => {
        gsap.to(ring, { scale: 1, opacity: 1, duration: 0.4, ease: 'power3.out' });
        gsap.to(dot, { scale: 1, duration: 0.3 });
        gsap.set(el, { x: 0, y: 0 });
      };
      const onMouseMove = (e: MouseEvent): void => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * 0.25;
        const dy = (e.clientY - cy) * 0.25;
        gsap.to(el, { x: dx, y: dy, duration: 0.4, ease: 'power2.out' });
      };

      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
      el.addEventListener('mousemove', onMouseMove);
      cleanupMagnetic.push(() => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
        el.removeEventListener('mousemove', onMouseMove);
        gsap.set(el, { x: 0, y: 0 });
      });
    });

    window.addEventListener('mousemove', onMove);

    return () => {
      document.documentElement.style.cursor = '';
      window.removeEventListener('mousemove', onMove);
      gsap.ticker.remove(tick);
      cleanupMagnetic.forEach((fn) => fn());
    };
  }, []);

  // Only render on desktop
  if (typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches) {
    return <></>;
  }

  return (
    <>
      <div ref={dotRef} className="cursor__dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor__ring" aria-hidden="true" />
    </>
  );
}
