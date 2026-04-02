import React from 'react';
import { Search, FileText, Tag, Network } from 'lucide-react';
import './FeaturesSection.css';

const FEATURES = [
  {
    Icon:        Search,
    title:       'Semantic Search',
    description: 'Search by meaning, not just keywords. Find any idea you\'ve ever saved — even if you can\'t remember the exact words.',
    accent:      'var(--feature-blue)',
    bg:          'var(--feature-blue-bg)',
  },
  {
    Icon:        FileText,
    title:       'AI Summaries',
    description: 'Every saved item is instantly condensed into a crisp, intelligent summary so you extract value in seconds, not minutes.',
    accent:      'var(--feature-purple)',
    bg:          'var(--feature-purple-bg)',
  },
  {
    Icon:        Tag,
    title:       'Automatic Topics',
    description: 'Content is automatically organised into topics and categories. Your library curates itself as you build it.',
    accent:      'var(--feature-pink)',
    bg:          'var(--feature-pink-bg)',
  },
  {
    Icon:        Network,
    title:       'Knowledge Graph',
    description: 'Visualise the relationships between your ideas in an interactive graph that reveals hidden connections across your entire library.',
    accent:      'var(--feature-green)',
    bg:          'var(--feature-green-bg)',
  },
];

import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../../../../styles/animations';

const FeaturesSection = () => (
  <section className="features" id="features">
    <div className="container">
      <motion.div 
        className="section-header"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <motion.span variants={fadeInUp} className="section-eyebrow">Features</motion.span>
        <motion.h2 variants={fadeInUp} className="section-heading">
          Everything your knowledge<br />
          <span className="gradient-text">needs to grow</span>
        </motion.h2>
        <motion.p variants={fadeInUp} className="section-subheading">
          Stop losing great ideas. MemoryOS turns a firehose of content into
          a structured, searchable, and beautifully connected knowledge base.
        </motion.p>
      </motion.div>

      <motion.div 
        className="features__grid"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
      >
        {FEATURES.map(({ Icon, title, description, accent, bg }) => (
          <motion.article 
            className="features__card" 
            key={title}
            variants={fadeInUp}
            whileHover={{ y: -5, boxShadow: 'var(--shadow-lg)' }}
          >
            <div className="features__icon-wrap" style={{ background: bg }}>
              <Icon size={24} strokeWidth={1.8} color={accent} />
            </div>
            <h3 className="features__title">{title}</h3>
            <p className="features__desc">{description}</p>
          </motion.article>
        ))}
      </motion.div>
    </div>
  </section>
);

export default FeaturesSection;
