import React from 'react';
import { MousePointerClick, Sparkles, CheckCircle2 } from 'lucide-react';
import './BrowserExtensionSection.css';

const STEPS = [
  {
    Icon:        MousePointerClick,
    title:       'Download Extension',
    description: 'Click the button below to download the MemoryOS extension zip.',
  },
  {
    Icon:        Sparkles,
    title:       'Enable Developer Mode',
    description: 'Open chrome://extensions, toggle Developer Mode on, click "Load unpacked".',
  },
  {
    Icon:        CheckCircle2,
    title:       'Select the folder',
    description: 'Unzip the file and select the extracted folder. Extension is ready!',
  },
];

import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, microSpring } from '../../../../styles/animations';

const BrowserExtensionSection = () => (
  <section className="ext" id="extension">
    <div className="container">
      <div className="ext__inner">

        {/* Left: copy */}
        <motion.div 
          className="ext__copy"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.span variants={fadeInUp} className="section-eyebrow">Browser Extension</motion.span>
          <motion.h2 variants={fadeInUp} className="ext__heading">
            Save from anywhere<br />
            <span className="gradient-text">in one click</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="ext__subtext">
            Our lightweight browser extension works on Chrome, Firefox, Edge,
            and Arc. Clip anything from the web without ever leaving the page.
          </motion.p>

          {/* Steps */}
          <motion.div variants={staggerContainer} className="ext__steps">
            {STEPS.map(({ Icon, title, description }, i) => (
              <motion.div variants={fadeInUp} className="ext__step" key={title}>
                <div className="ext__step-num">{i + 1}</div>
                <div className="ext__step-body">
                  <span className="ext__step-title">{title}</span>
                  <span className="ext__step-desc">{description}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.a
            variants={fadeInUp}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="/memoryos-extension.zip"
            download="memoryos-extension.zip"
            className="ext__cta"
          >
            <MousePointerClick size={16} strokeWidth={2} />
            Download Extension — free
          </motion.a>
        </motion.div>

        {/* Right: extension popup mockup */}
        <motion.div 
          className="ext__visual"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Browser outline */}
          <div className="ext__browser">
            <div className="ext__browser-chrome">
              <div className="ext__browser-dots">
                <span /><span /><span />
              </div>
              <div className="ext__browser-bar">medium.com/future-of-ai</div>
              {/* Extension icon in toolbar */}
              <motion.div 
                className="ext__toolbar-icon" 
                title="MemoryOS Extension"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2, delay: 1 }}
              >
                
              </motion.div>
            </div>
            <div className="ext__browser-body">
              {/* Fake article */}
              <div className="ext__article-preview">
                <div className="ext__article-tag">Article · Medium</div>
                <div className="ext__article-title">
                  The Future of AI Agents: How Autonomous Systems Will Change Work
                </div>
                <div className="ext__article-lines">
                  <span /><span /><span /><span style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Extension popup */}
          <motion.div 
            className="ext__popup"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.5, type: 'spring' }}
          >
            <div className="ext__popup-header">
              <span className="ext__popup-name">Memory<span className="gradient-text">OS</span></span>
            </div>

            <div className="ext__popup-title">
              The Future of AI Agents…
            </div>

            <div className="ext__popup-row">
              <span className="ext__popup-label">Type</span>
              <span className="ext__popup-value">Article</span>
            </div>
            <div className="ext__popup-row">
              <span className="ext__popup-label">Tags</span>
              <div className="ext__popup-tags">
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>AI</motion.span>
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>Agents</motion.span>
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>Future</motion.span>
              </div>
            </div>

            <motion.button 
              className="ext__popup-save"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles size={14} />
              Save to MemoryOS
            </motion.button>

            <motion.div 
              className="ext__popup-saved"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              <CheckCircle2 size={13} />
              Saved & summarized
            </motion.div>
          </motion.div>
        </motion.div>

      </div>
    </div>
  </section>
);

export default BrowserExtensionSection;
