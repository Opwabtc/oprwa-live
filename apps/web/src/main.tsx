import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ReactLenis, useLenis } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { App } from './App';
import './index.css';

gsap.registerPlugin(ScrollTrigger);

// Sync Lenis smooth-scroll position to GSAP ScrollTrigger on every frame
function LenisGSAPSync() {
  useLenis(ScrollTrigger.update);
  return null;
}

// Restore theme from localStorage
const savedTheme = localStorage.getItem('oprwa-theme');
if (savedTheme === 'light' || savedTheme === 'dark') {
  document.documentElement.setAttribute('data-theme', savedTheme);
} else {
  document.documentElement.setAttribute('data-theme', 'dark');
}

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <ReactLenis root options={{ lerp: 0.08, duration: 1.2, smoothWheel: true }}>
        <LenisGSAPSync />
        <App />
      </ReactLenis>
    </BrowserRouter>
  </StrictMode>
);
