import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { WalletConnectButton } from './WalletConnectButton';
import { ScrambleText } from './ScrambleText';

const NAV_LINKS = [
  { label: 'Market', href: '/#markets', anchor: true },
  { label: 'Dashboard', href: '/app', anchor: false },
  { label: 'Docs', href: '/docs', anchor: false },
];

export function AppNav(): React.JSX.Element {
  const location = useLocation();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleTheme = (): void => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('oprwa-theme', next);
  };

  useEffect(() => {
    const onScroll = (): void => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`app-nav${scrolled ? ' app-nav--scrolled' : ''}`}
      aria-label="Main navigation"
    >
      <div className="app-nav__inner">
        <Link to="/" className="app-nav__logo" aria-label="OPRWA home">
          <span className="app-nav__logo-text">OPRWA</span>
        </Link>

        <ul className={`app-nav__links${menuOpen ? ' app-nav__links--open' : ''}`} role="list">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              {link.anchor ? (
                <a href={link.href} className="app-nav__link">
                  <ScrambleText steps={8} speed={30}>{link.label}</ScrambleText>
                </a>
              ) : (
                <Link
                  to={link.href}
                  className={`app-nav__link${location.pathname === link.href ? ' app-nav__link--active' : ''}`}
                  aria-current={location.pathname === link.href ? 'page' : undefined}
                >
                  <ScrambleText steps={8} speed={30}>{link.label}</ScrambleText>
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className="app-nav__actions">
          <button
            className={`app-nav__hamburger${menuOpen ? ' app-nav__hamburger--open' : ''}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
          <button
            className="app-nav__theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '○' : '●'}
          </button>
          <WalletConnectButton />
        </div>
      </div>
    </nav>
  );
}
