import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

export function initLenis(): Lenis {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis?.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function getLenis(): Lenis | null {
  return lenis;
}

export function onModalOpen(): void {
  lenis?.stop();
  document.body.style.overflow = 'hidden';
}

export function onModalClose(): void {
  lenis?.start();
  document.body.style.overflow = '';
}

export function destroyLenis(): void {
  if (lenis) {
    lenis.destroy();
    lenis = null;
  }
}
