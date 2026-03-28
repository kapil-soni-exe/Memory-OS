import React from 'react';
import NavbarSection from './sections/NavbarSection/NavbarSection';
import HeroSection from './sections/HeroSection/HeroSection';
import HowItWorksSection from './sections/HowItWorksSection/HowItWorksSection';
import FeaturesSection from './sections/FeaturesSection/FeaturesSection';
import BrowserExtensionSection from './sections/BrowserExtensionSection/BrowserExtensionSection';
import CTASection from './sections/CTASection/CTASection';
import './Landing.css';

const Landing = () => (
  <>
    <NavbarSection />

    <main>
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <BrowserExtensionSection />
      <CTASection />
    </main>

    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <img src="/logo.png" alt="MemoryOS" className="footer__logo" />
          <span className="footer__name">MemoryOS</span>
        </div>

        <p className="footer__copy">
          © {new Date().getFullYear()} MemoryOS. All rights reserved.
        </p>

        <nav className="footer__links" aria-label="Footer">
          {['Privacy', 'Terms', 'Contact'].map(l => (
            <a key={l} href="#" className="footer__link">{l}</a>
          ))}
        </nav>
      </div>
    </footer>
  </>
);

export default Landing;
