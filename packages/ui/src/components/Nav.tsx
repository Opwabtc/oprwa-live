import { type ReactNode, useState, useEffect } from "react";
import { clsx } from "clsx";

interface NavLink {
  label: string;
  href: string;
}

interface NavProps {
  links?: NavLink[];
  walletSlot?: ReactNode;
  themeToggleSlot?: ReactNode;
  logoSlot?: ReactNode;
}

export function Nav({
  links = [],
  walletSlot,
  themeToggleSlot,
  logoSlot,
}: NavProps): JSX.Element {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = (): void => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={clsx("nav", scrolled && "nav--scrolled")} aria-label="Main navigation">
      <div className="nav__inner">
        <div className="nav__logo">
          {logoSlot ?? (
            <a href="/" className="nav__logo-link" aria-label="OPRWA home">
              <span className="nav__logo-text">OPRWA</span>
            </a>
          )}
        </div>

        <ul className="nav__links" role="list">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="nav__link">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="nav__actions">
          {themeToggleSlot}
          {walletSlot}
        </div>
      </div>
    </nav>
  );
}
