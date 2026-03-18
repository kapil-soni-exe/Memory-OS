import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import './CTA.css';

const CTA = () => (
  <section className="cta" id="cta">
    <div className="container">
      <div className="cta__card">
        {/* Ambient orbs */}
        <div className="cta__orb cta__orb--a" aria-hidden="true" />
        <div className="cta__orb cta__orb--b" aria-hidden="true" />
        <div className="cta__orb cta__orb--c" aria-hidden="true" />

        <div className="cta__content">
          {/* Badge */}
          <div className="cta__badge">
            <Sparkles size={12} />
            Free to get started
          </div>

          <h2 className="cta__heading">
            Start building your<br />
            <span className="cta__heading-gradient">second brain today</span>
          </h2>

          <p className="cta__subtext">
            Join thousands of knowledge workers, researchers, and creators who
            use MemoryOS to think deeper and work smarter.
          </p>

          {/* Actions */}
          <div className="cta__actions">
            <Link to="/signup" className="cta__btn cta__btn--white">
              Get Started — it's free
              <ArrowRight size={16} strokeWidth={2.2} />
            </Link>
            <a href="#how-it-works" className="cta__btn cta__btn--ghost">
              Learn how it works
            </a>
          </div>

          <p className="cta__note">No credit card required · Cancel anytime</p>

          {/* Social proof */}
          <div className="cta__proof">
            <div className="cta__proof-avatars">
              {['#7F5AF0', '#007AFF', '#F72585', '#28CA42', '#FF9800'].map((c, i) => (
                <span key={i} className="cta__proof-avatar" style={{ background: c, zIndex: 5 - i }} />
              ))}
            </div>
            <span className="cta__proof-text">
              <strong>4,200+</strong> people already saving smarter
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default CTA;
