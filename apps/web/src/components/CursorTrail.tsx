/**
 * CursorTrail — orange canvas cursor trail with glow.
 * Fixed overlay, pointer-events: none, mix-blend-mode: screen.
 */
import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  life: number;
  size: number;
  vx: number;
  vy: number;
}

export function CursorTrail(): null {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: -999, y: -999 });
  const lastMouse = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.style.cssText =
      'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9998;mix-blend-mode:screen;';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    canvasRef.current = canvas;

    const ctx = canvas.getContext('2d')!;

    const resize = (): void => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const onMove = (e: MouseEvent): void => {
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      const speed = Math.sqrt(dx * dx + dy * dy);
      mouse.current = { x: e.clientX, y: e.clientY };
      lastMouse.current = { x: e.clientX, y: e.clientY };

      // Spawn 1-3 particles based on speed
      const count = Math.min(3, Math.max(1, Math.floor(speed / 8)));
      for (let i = 0; i < count; i++) {
        particles.current.push({
          x: e.clientX + (Math.random() - 0.5) * 4,
          y: e.clientY + (Math.random() - 0.5) * 4,
          life: 1,
          size: Math.random() * 4 + 2,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2,
        });
        if (particles.current.length > 60) particles.current.shift();
      }
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    const draw = (): void => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Decay and remove dead particles
      particles.current = particles.current.filter((p) => {
        p.life -= 0.045;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        return p.life > 0;
      });

      for (const p of particles.current) {
        const a = p.life;
        const r = p.size * p.life;

        // Outer glow
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 5);
        grd.addColorStop(0, `rgba(249, 115, 22, ${a * 0.85})`);
        grd.addColorStop(0.3, `rgba(249, 115, 22, ${a * 0.35})`);
        grd.addColorStop(0.7, `rgba(255, 153, 0, ${a * 0.08})`);
        grd.addColorStop(1, 'rgba(249, 115, 22, 0)');

        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Hot core
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 200, 100, ${a * 0.9})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return (): void => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
      canvas.remove();
    };
  }, []);

  return null;
}
