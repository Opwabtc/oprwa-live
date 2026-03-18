import React from 'react';
import { useEffect, useRef } from 'react';
import { useLenis } from 'lenis/react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  color: string;
  baseOpacity: number;
}

const COLORS = ['#f7931a', '#d4a017', '#ffaa33', '#cc7a00', '#ffd060'];
const MAX_PARTICLES =
  typeof navigator !== 'undefined' && navigator.hardwareConcurrency > 4 ? 3000 : 1500;

function createParticle(width: number, height: number): Particle {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const opacity = 0.08 + Math.random() * 0.35;
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    radius: 0.5 + Math.random() * 1.5,
    opacity,
    baseOpacity: opacity,
    color,
  };
}

export function ParticleCanvas(): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const scrollVelRef = useRef(0);

  // Sync scroll velocity from ReactLenis context
  useLenis(({ velocity }: { velocity: number }) => {
    scrollVelRef.current = velocity;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animating = false;

    function resize(): void {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      if (particlesRef.current.length === 0) {
        particlesRef.current = Array.from({ length: MAX_PARTICLES }, () =>
          createParticle(canvas.width, canvas.height)
        );
      }
    }

    function draw(): void {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;
      const scrollVel = Math.abs(scrollVelRef.current);

      for (const p of particlesRef.current) {
        // Mouse repulsion
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80) {
          const force = (80 - dist) / 80;
          p.vx += (dx / dist) * force * 0.5;
          p.vy += (dy / dist) * force * 0.5;
        }

        // Scroll velocity boost
        if (scrollVel > 0) {
          p.vy -= scrollVel * 0.02;
        }

        // Velocity damping
        p.vx *= 0.98;
        p.vy *= 0.98;

        // Clamp velocity
        const maxVel = 1.5;
        const velMag = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (velMag > maxVel) {
          p.vx = (p.vx / velMag) * maxVel;
          p.vy = (p.vy / velMag) * maxVel;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Opacity based on scroll
        p.opacity = p.baseOpacity + scrollVel * 0.02;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.min(1, p.opacity);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      scrollVelRef.current *= 0.9;
    }

    function animate(): void {
      if (!animating) return;
      draw();
      rafRef.current = requestAnimationFrame(animate);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animating) {
          animating = true;
          resize();
          animate();
        } else if (!entry.isIntersecting && animating) {
          animating = false;
          cancelAnimationFrame(rafRef.current);
        }
      },
      { threshold: 0.01 }
    );

    observer.observe(canvas);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const handleMouse = (e: MouseEvent): void => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    window.addEventListener('mousemove', handleMouse, { passive: true });

    return () => {
      animating = false;
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
      aria-hidden="true"
    />
  );
}
