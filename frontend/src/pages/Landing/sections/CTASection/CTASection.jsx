import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import './CTASection.css';

import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, microSpring } from '../../../../styles/animations';

const CTASection = () => (
  <section className="cta" id="cta">
    <div className="container">
      <motion.div 
        className="cta__card"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        {/* Ambient orbs */}
        <motion.div 
          className="cta__orb cta__orb--a" 
          aria-hidden="true" 
          animate={{ x: [0, 40, -20, 0], y: [0, -40, 20, 0] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        />
        <motion.div 
          className="cta__orb cta__orb--b" 
          aria-hidden="true" 
          animate={{ x: [0, -30, 10, 0], y: [0, 20, -30, 0] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
        />
        <motion.div 
          className="cta__orb cta__orb--c" 
          aria-hidden="true" 
          animate={{ x: [0, 20, -10, 0], y: [0, 30, -10, 0] }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
        />

        <motion.div 
          className="cta__content"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} className="cta__badge">
            <Sparkles size={12} />
            Free to get started
          </motion.div>

          <motion.h2 variants={fadeInUp} className="cta__heading">
            Start building your<br />
            <span className="cta__heading-gradient">second brain today</span>
          </motion.h2>

          <motion.p variants={fadeInUp} className="cta__subtext">
            Join thousands of knowledge workers, researchers, and creators who
            use MemoryOS to think deeper and work smarter.
          </motion.p>

          {/* Actions */}
          <motion.div variants={fadeInUp} className="cta__actions">
            <motion.div {...microSpring}>
              <Link to="/signup" className="cta__btn cta__btn--white">
                Get Started — it's free
                <ArrowRight size={16} strokeWidth={2.2} />
              </Link>
            </motion.div>
            <motion.a 
              href="#how-it-works" 
              className="cta__btn cta__btn--ghost"
              whileHover={{ x: 5 }}
            >
              Learn how it works
            </motion.a>
          </motion.div>

          <motion.p variants={fadeInUp} className="cta__note">No credit card required · Cancel anytime</motion.p>

          {/* Social proof */}
          <motion.div variants={fadeInUp} className="cta__proof">
            <div className="cta__proof-avatars">
              {['#7F5AF0', '#007AFF', '#F72585', '#28CA42', '#FF9800'].map((c, i) => (
                <motion.span 
                  key={i} 
                  className="cta__proof-avatar" 
                  style={{ background: c, zIndex: 5 - i }} 
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (i * 0.1) }}
                />
              ))}
            </div>
            <span className="cta__proof-text">
              <strong>4,200+</strong> people already saving smarter
            </span>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

export default CTASection;
