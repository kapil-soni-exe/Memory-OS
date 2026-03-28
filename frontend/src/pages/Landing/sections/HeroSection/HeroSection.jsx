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

const HeroSection = () => (
  <section className="hero" id="hero">
    <div className="container hero__inner">

      {/* ── Left column ── */}
      <div className="hero__copy">
        <div className="section-eyebrow">
          <Sparkles size={13} strokeWidth={2.2} />
          AI-powered knowledge management
        </div>

        <h1 className="hero__headline">
          Your AI-powered<br />
          <span className="gradient-text">second brain</span>
        </h1>

        <p className="hero__subline">
          Save articles, PDFs, tweets, and videos from anywhere.
          MemoryOS automatically summarizes, tags, and connects
          your knowledge — so you can think deeper, not harder.
        </p>

        <div className="hero__actions">
          <Link to="/signup" className="hero__cta hero__cta--primary">
            Get Started free
            <ArrowRight size={16} strokeWidth={2.2} />
          </Link>
          <a href="#how-it-works" className="hero__cta hero__cta--ghost">
            <span className="hero__play-wrap">
              <Play size={12} fill="currentColor" />
            </span>
            See how it works
          </a>
        </div>

        {/* Social proof */}
        <div className="hero__proof">
          <div className="hero__proof-avatars">
            {['#7F5AF0', '#007AFF', '#F72585', '#28CA42'].map((c, i) => (
              <span key={i} className="hero__proof-avatar" style={{ background: c }} />
            ))}
          </div>
          <span className="hero__proof-text">
            Trusted by <strong>4,200+</strong> knowledge workers
          </span>
        </div>
      </div>

      {/* ── Right column — UI mockup ── */}
      <div className="hero__visual">
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
            <div className="hero__mockup-search">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="6.5" cy="6.5" r="5" stroke="#6E6E73" strokeWidth="1.5"/>
                <path d="M10.5 10.5 14 14" stroke="#6E6E73" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>Search your second brain…</span>
              <span className="hero__mockup-search-cmd">⌘K</span>
            </div>

            {/* Item list */}
            <div className="hero__mockup-label">Recently saved</div>
            <ul className="hero__mockup-list">
              {SAVED_ITEMS.map((item, i) => (
                <li key={item.title} className="hero__mockup-item" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="hero__mockup-icon" style={{ background: ICON_COLORS[i] }}>
                    {item.icon}
                  </div>
                  <div className="hero__mockup-info">
                    <span className="hero__mockup-title">{item.title}</span>
                    <span className="hero__mockup-tag">{item.tag}</span>
                  </div>
                  <div className="hero__mockup-dot" />
                </li>
              ))}
            </ul>

            {/* AI tag badge */}
            <div className="hero__ai-chip">
              <Sparkles size={12} />
              AI summary generated
            </div>
          </div>
        </div>

        {/* Floating accent cards */}
        <div className="hero__float hero__float--tl">
          <div className="hero__float-label">New save</div>
          <div className="hero__float-content">📰 NYT Article saved</div>
        </div>
        <div className="hero__float hero__float--br">
          <div className="hero__float-label">AI Tags</div>
          <div className="hero__float-tags">
            <span>AI</span><span>Research</span><span>LLM</span>
          </div>
        </div>
      </div>

    </div>
  </section>
);

export default HeroSection;
