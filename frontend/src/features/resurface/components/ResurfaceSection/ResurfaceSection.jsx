import React, { useState } from 'react';
import { ThumbsUp, X, Clock, Eye, CalendarDays, RotateCcw } from 'lucide-react';
import './ResurfaceSection.css';

/* ─── Helpers ─────────────────────────────── */
function timeAgo(date) {
  if (!date) return null;
  const seconds = (Date.now() - new Date(date)) / 1000;
  if (seconds < 3600)    return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400)   return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  const months = Math.floor(seconds / 2592000);
  const years  = Math.floor(seconds / 31536000);
  if (years >= 1)  return `${years} year${years > 1 ? 's' : ''} ago`;
  return `${months}mo ago`;
}

/* ─── Single Card ─────────────────────────── */
const ResurfaceCard = ({ item, index, onItemClick, onLike, onSkip }) => {
  const [dismissed, setDismissed]   = useState(false);
  const [liked,     setLiked]       = useState(false);

  if (dismissed) return null;

  const isTimeCapsule = item.resurfaceReason === 'Time Capsule';
  const ago           = timeAgo(item.lastAccessedAt || item.createdAt);
  const savedDate     = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : null;
  const likes = item.interactions?.likes || 0;
  const views = item.accessCount || 0;

  return (
    <article
      className={`rs-card${liked ? ' rs-card--liked' : ''}`}
      style={{ animationDelay: `${index * 55}ms` }}
      onClick={() => onItemClick?.(item)}
    >
      {/* Thumbnail */}
      <div className="rs-thumb">
        {item.image
          ? <img src={item.image} alt="" loading="lazy" />
          : <div className="rs-thumb__letter">
              {(item.type || item.title || 'M')[0].toUpperCase()}
            </div>
        }
      </div>

      {/* Body */}
      <div className="rs-body">
        {/* Top row: reason + time */}
        <div className="rs-row rs-row--meta">
          <span className={`rs-badge ${isTimeCapsule ? 'rs-badge--time' : 'rs-badge--rediscover'}`}>
            {isTimeCapsule ? <CalendarDays size={9} /> : <RotateCcw size={9} />}
            {isTimeCapsule ? 'On This Day' : 'Resurfaced'}
          </span>
          {ago && (
            <span className="rs-meta-item">
              <Clock size={9} />{ago}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="rs-title">{item.title}</h3>

        {/* Tags */}
        {(item.tags || []).length > 0 && (
          <div className="rs-tags">
            {(item.tags || []).slice(0, 4).map((t, i) => (
              <span key={i} className="rs-tag">{t}</span>
            ))}
          </div>
        )}

        {/* Bottom row: stats + date */}
        <div className="rs-row rs-row--footer">
          <div className="rs-stats">
            {views > 0 && (
              <span className="rs-meta-item"><Eye size={9} />{views}</span>
            )}
            {likes > 0 && (
              <span className="rs-meta-item rs-meta-item--green"><ThumbsUp size={9} />{likes}</span>
            )}
            {savedDate && (
              <span className="rs-meta-item">{savedDate}</span>
            )}
          </div>

          {/* Relevance bar */}
          {item._score > 0 && (
            <div className="rs-score-bar" title={`Relevance: ${Math.round(item._score * 100)}%`}>
              <div className="rs-score-fill" style={{ width: `${Math.min(100, item._score * 100)}%` }} />
            </div>
          )}
        </div>
      </div>

      {/* Action buttons — appear on hover */}
      <div className="rs-actions" onClick={e => e.stopPropagation()}>
        <button
          className={`rs-btn rs-btn--like${liked ? ' active' : ''}`}
          onClick={() => { setLiked(true); onLike?.(item._id); }}
          title="Mark useful"
        ><ThumbsUp size={12} /></button>
        <button
          className="rs-btn rs-btn--skip"
          onClick={() => { setDismissed(true); onSkip?.(item._id); }}
          title="Dismiss"
        ><X size={12} /></button>
      </div>
    </article>
  );
};

/* ─── Section ─────────────────────────────── */
const ResurfaceSection = ({ items, loading, onItemClick, onLike, onSkip }) => {

  if (loading) {
    return (
      <section className="rs-section">
        <header className="rs-header">
          <p className="rs-eyebrow">For You</p>
          <h2 className="rs-heading">Time Capsule</h2>
        </header>
        <div className="rs-list">
          {[...Array(3)].map((_, i) => <div key={i} className="rs-skel" />)}
        </div>
      </section>
    );
  }

  if (!items || items.length === 0) return null;

  const hasTimeCapsule = items.some(i => i.resurfaceReason === 'Time Capsule');

  return (
    <section className="rs-section">
      <header className="rs-header">
        <div>
          <p className="rs-eyebrow">For You</p>
          <h2 className="rs-heading">{hasTimeCapsule ? 'On This Day' : 'Time Capsule'}</h2>
        </div>
        <span className="rs-pill">{items.length} resurfaced</span>
      </header>

      <div className="rs-list">
        {items.slice(0, 5).map((item, i) => (
          <ResurfaceCard
            key={item._id}
            item={item}
            index={i}
            onItemClick={onItemClick}
            onLike={onLike}
            onSkip={onSkip}
          />
        ))}
      </div>
    </section>
  );
};

export default ResurfaceSection;
