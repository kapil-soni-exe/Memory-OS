import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features',     href: '#features' },
  { label: 'Extension',    href: '#extension' },
];

const Navbar = () => {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const close = () => setMenuOpen(false);

  return (
    <header className={`nav${scrolled ? ' nav--scrolled' : ''}`}>
      <div className="container nav__inner">

        {/* Brand */}
        <Link to="/" className="nav__brand" onClick={close} aria-label="MemoryOS">
          <img src="/logo.png" alt="MemoryOS logo" className="nav__logo" />
        </Link>

        {/* Desktop links */}
        <nav className="nav__links" aria-label="Primary">
          {NAV_LINKS.map(({ label, href }) => (
            <a key={href} href={href} className="nav__link">{label}</a>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="nav__actions">
          <Link to="/login" className="nav__btn nav__btn--ghost">Log in</Link>
          <Link to="/signup" className="nav__btn nav__btn--dark">Get Started</Link>
        </div>

        {/* Hamburger */}
        <button
          className="nav__hamburger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={`nav__drawer${menuOpen ? ' nav__drawer--open' : ''}`} aria-hidden={!menuOpen}>
        {NAV_LINKS.map(({ label, href }) => (
          <a key={href} href={href} className="nav__drawer-link" onClick={close}>{label}</a>
        ))}
        <Link to="/signup" className="nav__btn nav__btn--dark nav__drawer-cta" onClick={close}>
          Get Started
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
