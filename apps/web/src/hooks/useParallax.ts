import { useEffect } from 'react';

export function useParallax(selector: string, factor = 0.035): void {
  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth < 768) return;

    const elements = document.querySelectorAll<HTMLElement>(selector);
    let raf: number;

    const update = (): void => {
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2 - window.innerHeight / 2;
        el.style.transform = `translateY(${center * factor}px)`;
      });
    };

    const onScroll = (): void => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [selector, factor]);
}
