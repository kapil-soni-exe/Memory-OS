import React from 'react';
import { Search, FileText, Tag, Network } from 'lucide-react';
import './Features.css';

const FEATURES = [
  {
    Icon:        Search,
    title:       'Semantic Search',
    description: 'Search by meaning, not just keywords. Find any idea you\'ve ever saved — even if you can\'t remember the exact words.',
    accent:      '#007AFF',
    bg:          '#EEF3FF',
  },
  {
    Icon:        FileText,
    title:       'AI Summaries',
    description: 'Every saved item is instantly condensed into a crisp, intelligent summary so you extract value in seconds, not minutes.',
    accent:      '#7F5AF0',
    bg:          '#F4F0FF',
  },
  {
    Icon:        Tag,
    title:       'Automatic Topics',
    description: 'Content is automatically organised into topics and categories. Your library curates itself as you build it.',
    accent:      '#F72585',
    bg:          '#FFF0F5',
  },
  {
    Icon:        Network,
    title:       'Knowledge Graph',
    description: 'Visualise the relationships between your ideas in an interactive graph that reveals hidden connections across your entire library.',
    accent:      '#00B976',
    bg:          '#F0FFF8',
  },
];

const Features = () => (
  <section className="features" id="features">
    <div className="container">
      <div className="section-header">
        <span className="section-eyebrow">Features</span>
        <h2 className="section-heading">
          Everything your knowledge<br />
          <span className="gradient-text">needs to grow</span>
        </h2>
        <p className="section-subheading">
          Stop losing great ideas. MemoryOS turns a firehose of content into
          a structured, searchable, and beautifully connected knowledge base.
        </p>
      </div>

      <div className="features__grid">
        {FEATURES.map(({ Icon, title, description, accent, bg }) => (
          <article className="features__card" key={title}>
            <div className="features__icon-wrap" style={{ background: bg }}>
              <Icon size={24} strokeWidth={1.8} color={accent} />
            </div>
            <h3 className="features__title">{title}</h3>
            <p className="features__desc">{description}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
