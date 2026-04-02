import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import './HeroSection.css';

const SAVED_ITEMS = [
  { icon: '📄', label: 'Article',      title: 'The Future of AI Agents',          tag: 'Article' },
  { icon: '🎬', label: 'YouTube',      title: 'Deep Work by Cal Newport',         tag: 'Video'   },
  { icon: '🐦', label: 'Tweet',        title: 'Thread on RAG systems',            tag: 'Tweet'   },
  { icon: '📑', label: 'PDF',          title: 'Attention Is All You Need',        tag: 'PDF'     },
  { icon: '📝', label: 'Note',         title: 'Project brainstorm — Q2 2026',     tag: 'Note'    },
];

const ICON_COLORS = [
  'var(--feature-blue-bg)',
  'var(--feature-pink-bg)',
  'var(--feature-purple-bg)',
  'var(--feature-orange-bg)',
  'var(--feature-green-bg)'
];

import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, microSpring } from '../../../../styles/animations';

const HeroSection = () => (
  <section className="hero" id="hero">
    <div className="container hero__inner">

      {/* ── Left column ── */}
      <motion.div 
        className="hero__copy"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={fadeInUp} className="section-eyebrow">
          <Sparkles size={13} strokeWidth={2.2} />
          AI-powered knowledge management
        </motion.div>

        <motion.h1 variants={fadeInUp} className="hero__headline">
          Your AI-powered<br />
          <span className="gradient-text">second brain</span>
        </motion.h1>

        <motion.p variants={fadeInUp} className="hero__subline">
          Save articles, PDFs, tweets, and videos from anywhere.
          MemoryOS automatically summarizes, tags, and connects
          your knowledge — so you can think deeper, not harder.
        </motion.p>

        <motion.div variants={fadeInUp} className="hero__actions">
          <motion.div {...microSpring}>
            <Link to="/signup" className="hero__cta hero__cta--primary">
              Get Started free
              <ArrowRight size={16} strokeWidth={2.2} />
            </Link>
          </motion.div>
          <motion.a 
            href="#how-it-works" 
            className="hero__cta hero__cta--ghost"
            whileHover={{ y: -2, backgroundColor: 'var(--color-surface-sunken)' }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <span className="hero__play-wrap">
              <Play size={12} fill="#fff" />
            </span>
            See how it works
          </motion.a>
        </motion.div>

        {/* Social proof */}
        <motion.div variants={fadeInUp} className="hero__proof">
          <div className="hero__proof-avatars">
            {['#7F5AF0', '#007AFF', '#F72585', '#28CA42'].map((c, i) => (
              <motion.span 
                key={i} 
                className="hero__proof-avatar" 
                style={{ background: c }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + (i * 0.1) }}
              />
            ))}
          </div>
          <span className="hero__proof-text">
            Trusted by <strong>4,200+</strong> knowledge workers
          </span>
        </motion.div>
      </motion.div>

      {/* ── Right column — UI mockup ── */}
      <motion.div 
        className="hero__visual"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="hero__window">
          {/* Browser chrome */}
          <div className="hero__chrome">
            <div className="hero__dots">
              <span /><span /><span />
            </div>
            <div className="hero__url-bar">app.memoryos.ai</div>
          </div>

          {/* Mockup body */}
          <div className="hero__mockup-body">
            {/* Search bar */}
            <motion.div 
              className="hero__mockup-search"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="6.5" cy="6.5" r="5" stroke="var(--color-text-secondary)" strokeWidth="1.5"/>
                <path d="M10.5 10.5 14 14" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>Search your second brain…</span>
              <span className="hero__mockup-search-cmd">⌘K</span>
            </motion.div>

            {/* Item list */}
            <div className="hero__mockup-label">Recently saved</div>
            <ul className="hero__mockup-list">
              {SAVED_ITEMS.map((item, i) => (
                <motion.li 
                  key={item.title} 
                  className="hero__mockup-item"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + (i * 0.1) }}
                >
                  <div className="hero__mockup-icon" style={{ background: ICON_COLORS[i] }}>
                    {item.icon}
                  </div>
                  <div className="hero__mockup-info">
                    <span className="hero__mockup-title">{item.title}</span>
                    <span className="hero__mockup-tag">{item.tag}</span>
                  </div>
                  <div className="hero__mockup-dot" />
                </motion.li>
              ))}
            </ul>

            {/* AI tag badge */}
            <motion.div 
              className="hero__ai-chip"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <Sparkles size={12} />
              AI summary generated
            </motion.div>
          </div>
        </div>

        {/* Floating accent cards */}
        <motion.div 
          className="hero__float hero__float--tl"
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          <div className="hero__float-label">New save</div>
          <div className="hero__float-content">📰 NYT Article saved</div>
        </motion.div>
        <motion.div 
          className="hero__float hero__float--br"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        >
          <div className="hero__float-label">AI Tags</div>
          <div className="hero__float-tags">
            <span>AI</span><span>Research</span><span>LLM</span>
          </div>
        </motion.div>
      </motion.div>

    </div>
  </section>
);

export default HeroSection;
