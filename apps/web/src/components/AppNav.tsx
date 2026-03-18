import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { WalletConnectButton } from './WalletConnectButton';

const NAV_LINKS = [
  { label: 'Markets', href: '/marketplace' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Dashboard', href: '/app' },
  { label: 'Docs', href: '/docs' },
];

export function AppNav(): React.JSX.Element {
  const location = useLocation();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const toggleTheme = (): void => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('oprwa-theme', next);
  };

  return (
    <nav className="app-nav" aria-label="Main navigation">
      <div className="app-nav__inner">
        <Link to="/" className="app-nav__logo" aria-label="OPRWA home">
          <span className="app-nav__logo-text">OPRWA</span>
        </Link>

        <ul className="app-nav__links" role="list">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                to={link.href}
                className={`app-nav__link${location.pathname === link.href ? ' app-nav__link--active' : ''}`}
                aria-current={location.pathname === link.href ? 'page' : undefined}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="app-nav__actions">
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
