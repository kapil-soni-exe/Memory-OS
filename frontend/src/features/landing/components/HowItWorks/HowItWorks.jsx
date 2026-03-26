import React from 'react';
import { Globe, Brain, GitBranch } from 'lucide-react';
import './HowItWorks.css';

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

const HowItWorks = () => (
  <section className="how" id="how-it-works">
    <div className="container">
      <div className="section-header">
        <span className="section-eyebrow">How it works</span>
        <h2 className="section-heading">
          Three steps to a smarter<br />
          <span className="gradient-text">knowledge base</span>
        </h2>
        <p className="section-subheading">
          MemoryOS handles the heavy lifting so your brain can focus on thinking,
          creating, and connecting ideas.
        </p>
      </div>

      <div className="how__grid">
        {STEPS.map(({ Icon, step, title, description, accent, bg }, i) => (
          <div className="how__card" key={step}>
            {/* Step number */}
            <div className="how__step">{step}</div>

            {/* Icon */}
            <div className="how__icon-wrap" style={{ background: bg }}>
              <Icon size={26} strokeWidth={1.8} color={accent} />
            </div>

            <h3 className="how__title">{title}</h3>
            <p className="how__desc">{description}</p>

            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div className="how__connector" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12l7 7 7-7" stroke="#D1D1D6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
