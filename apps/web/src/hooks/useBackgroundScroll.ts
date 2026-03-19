import { useEffect } from 'react';

export function useBackgroundScroll(): void {
  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth < 768) return;

    const el = document.getElementById('bg-gradient');
    if (!el) return;

    let raf: number;

    const onScroll = (): void => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        el.style.transform = `translateY(${-y * 0.012}px)`;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
}
