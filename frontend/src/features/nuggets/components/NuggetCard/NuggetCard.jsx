import React from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';
import './NuggetCard.css';

const NuggetCard = ({ nugget }) => {
  const { text, category, itemTitle, itemId } = nugget;

  // Generate a soft gradient based on category or random
  const getGradient = (cat) => {
    const colors = {
      'Insight': 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
      'Action': 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
      'Fact': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      'Concept': 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      'Quick Note': 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
    };
    return colors[cat] || 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)';
  };

  return (
    <div className="nugget-card">
      <div className="nugget-card-glow" style={{ background: getGradient(category) }}></div>
      
      <div className="nugget-content">
        <div className="nugget-header">
          <span className="nugget-badge">
            <Sparkles size={12} />
            {category}
          </span>
          <span className="nugget-source">{itemTitle}</span>
        </div>

        <p className="nugget-text">"{text}"</p>

        <div className="nugget-footer">
          <button className="nugget-action-btn" title="View Source">
            <ExternalLink size={16} />
            Explore Focus
          </button>
        </div>
      </div>
    </div>
  );
};

export default NuggetCard;
