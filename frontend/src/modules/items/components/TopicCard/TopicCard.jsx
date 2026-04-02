import React from 'react';
import { Folder, MoreHorizontal, Trash2, ChevronRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import './TopicCard.css';

const TOPIC_COLORS = [
  {
    key: 'purple',
    iconBg: 'var(--feature-purple-bg)',
    iconColor: 'var(--feature-purple)',
    tagBg: 'var(--feature-purple-bg)',
    tagColor: 'var(--feature-purple)',
    bar: 'var(--feature-purple)',
  },
  {
    key: 'pink',
    iconBg: 'var(--feature-pink-bg)',
    iconColor: 'var(--feature-pink)',
    tagBg: 'var(--feature-pink-bg)',
    tagColor: 'var(--feature-pink)',
    bar: 'var(--feature-pink)',
  },
  {
    key: 'green',
    iconBg: 'var(--feature-green-bg)',
    iconColor: 'var(--feature-green)',
    tagBg: 'var(--feature-green-bg)',
    tagColor: 'var(--feature-green)',
    bar: 'var(--feature-green)',
  },
  {
    key: 'orange',
    iconBg: 'var(--feature-orange-bg)',
    iconColor: 'var(--feature-orange)',
    tagBg: 'var(--feature-orange-bg)',
    tagColor: 'var(--feature-orange)',
    bar: 'var(--feature-orange)',
  },
  {
    key: 'blue',
    iconBg: 'var(--feature-blue-bg)',
    iconColor: 'var(--feature-blue)',
    tagBg: 'var(--feature-blue-bg)',
    tagColor: 'var(--feature-blue)',
    bar: 'var(--feature-blue)',
  },
];

// Deterministic color pick based on topic name
function getTopicColor(topicName = '') {
  let hash = 0;
  for (let i = 0; i < topicName.length; i++) {
    hash = topicName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TOPIC_COLORS[Math.abs(hash) % TOPIC_COLORS.length];
}

import { motion, AnimatePresence } from 'framer-motion';
import { itemRevealer, springHover, microSpring } from '../../../../styles/animations';

const TopicCard = ({ topic, onClick, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const color = getTopicColor(topic.topicName);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleDelete = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (window.confirm(`Delete "${topic.topicName}" and all its memories?`)) {
      onDelete(topic._id);
    }
  };

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setMenuOpen(prev => !prev);
  };

  const visibleTags = (topic.tags || []).slice(0, 3);
  const subCount = topic.subTopics?.length || topic.subCount || 0;

  return (
    <motion.div
      variants={itemRevealer}
      layout
      {...springHover}
      className="topic-card"
      onClick={onClick}
      style={{ '--card-accent': color.bar }}
    >
      {/* Top row — icon + menu */}
      <div className="tc-top">
        <motion.div
          variants={microSpring}
          whileHover="whileHover"
          whileTap="whileTap"
          className="tc-icon"
          style={{ background: color.iconBg, color: color.iconColor }}
        >
          <Folder size={20} />
        </motion.div>

        <div className="tc-menu-wrapper" ref={menuRef}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="tc-menu-btn"
            onClick={handleMenuToggle}
            aria-label="Topic options"
          >
            <MoreHorizontal size={16} />
          </motion.button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                className="tc-dropdown"
              >
                <button
                  className="tc-dropdown-item danger"
                  onClick={handleDelete}
                >
                  <Trash2 size={14} />
                  Delete topic
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Topic name */}
      <h3 className="tc-name">{topic.topicName}</h3>

      {/* Reason / description */}
      {topic.reason && (
        <p className="tc-reason">{topic.reason}</p>
      )}

      {/* Footer — tags + meta */}
      <div className="tc-footer">
        <div className="tc-tags">
          {visibleTags.map(tag => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="tc-tag"
              style={{
                background: color.tagBg,
                color: color.tagColor,
              }}
            >
              {tag}
            </motion.span>
          ))}
        </div>

        <div className="tc-meta">
          {subCount > 0 && (
            <span className="tc-sub-badge">
              <Folder size={10} />
              {subCount}
            </span>
          )}
          <span className="tc-count">{topic.itemCount || 0} memories</span>
          <ChevronRight size={14} className="tc-chevron" />
        </div>
      </div>

      {/* Bottom accent bar */}
      <motion.div 
        className="tc-accent-bar" 
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ delay: 0.5, duration: 0.8 }}
      />
    </motion.div>
  );
};

export default TopicCard;