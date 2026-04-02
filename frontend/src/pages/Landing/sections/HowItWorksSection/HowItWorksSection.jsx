import React from 'react';
import { Globe, Brain, GitBranch } from 'lucide-react';
import './HowItWorksSection.css';

const STEPS = [
  {
    Icon:        Globe,
    step:        '01',
    title:       'Save Anything',
    description: 'Clip articles, PDFs, tweets, YouTube videos, or jot a quick note — from any device, in one click using the MemoryOS browser extension.',
    accent:      'var(--feature-blue)',
    bg:          'var(--feature-blue-bg)',
  },
  {
    Icon:        Brain,
    step:        '02',
    title:       'AI Understanding',
    description: 'Our AI reads every piece of content and instantly generates crisp summaries, relevant tags, and semantic embeddings — zero effort from you.',
    accent:      'var(--feature-purple)',
    bg:          'var(--feature-purple-bg)',
  },
  {
    Icon:        GitBranch,
    step:        '03',
    title:       'Connected Knowledge',
    description: 'Semantic embeddings link related ideas across your entire library, surfacing connections you never knew existed via an interactive knowledge graph.',
    accent:      'var(--feature-pink)',
    bg:          'var(--feature-pink-bg)',
  },
];

import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../../../../styles/animations';

const HowItWorksSection = () => (
  <section className="how" id="how-it-works">
    <div className="container">
      <motion.div 
        className="section-header"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <motion.span variants={fadeInUp} className="section-eyebrow">How it works</motion.span>
        <motion.h2 variants={fadeInUp} className="section-heading">
          Three steps to a smarter<br />
          <span className="gradient-text">knowledge base</span>
        </motion.h2>
        <motion.p variants={fadeInUp} className="section-subheading">
          MemoryOS handles the heavy lifting so your brain can focus on thinking,
          creating, and connecting ideas.
        </motion.p>
      </motion.div>

      <motion.div 
        className="how__grid"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
      >
        {STEPS.map(({ Icon, step, title, description, accent, bg }, i) => (
          <motion.div 
            className="how__card" 
            key={step}
            variants={fadeInUp}
            whileHover={{ y: -5 }}
          >
            {/* Step number */}
            <motion.div 
              className="how__step"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + (i * 0.2) }}
            >
              {step}
            </motion.div>

            {/* Icon */}
            <div className="how__icon-wrap" style={{ background: bg }}>
              <Icon size={26} strokeWidth={1.8} color={accent} />
            </div>

            <h3 className="how__title">{title}</h3>
            <p className="how__desc">{description}</p>

            {/* Connector */}
            {i < STEPS.length - 1 && (
              <motion.div 
                className="how__connector" 
                aria-hidden="true"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 + (i * 0.2) }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12l7 7 7-7" stroke="#D1D1D6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default HowItWorksSection;
