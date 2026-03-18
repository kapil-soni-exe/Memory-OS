import React from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Hero from '../../components/Hero/Hero';
import HowItWorks from '../../components/HowItWorks/HowItWorks';
import Features from '../../components/Features/Features';
import BrowserExtension from '../../components/BrowserExtension/BrowserExtension';
import CTA from '../../components/CTA/CTA';
import './Landing.css';

const Landing = () => (
  <>
    <Navbar />

    <main>
      <Hero />
      <HowItWorks />
      <Features />
      <BrowserExtension />
      <CTA />
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
