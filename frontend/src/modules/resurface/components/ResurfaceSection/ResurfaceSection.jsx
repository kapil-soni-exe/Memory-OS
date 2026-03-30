import React, { useState, useMemo } from 'react';
import { ThumbsUp, X, Clock, Eye, CalendarDays, RotateCcw, Lightbulb } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getResurfaceItems } from '../../../items/services/item.api';
import { useDeleteItem, useLikeItem, useSkipItem, useViewItem } from '../../../items/hooks/useItemMutation';
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
const ResurfaceCard = ({ item, index, onItemClick, onLike, onSkip, onView }) => {
  const [dismissed, setDismissed]   = useState(false);
  const [liked,     setLiked]       = useState(false);
  const [feedback,  setFeedback]    = useState(null); // { message, type }

  if (dismissed) return null;

  const isTimeCapsule = item.resurfaceReason === 'Time Capsule';
  const ago           = timeAgo(item.lastAccessedAt || item.createdAt);
  const savedDate     = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : null;
  const likes = item.interactions?.likes || 0;
  const views = item.accessCount || 0;

  // Deriving "Why this resurfaced" explanation
  let explanation = "Worth revisiting";
  if (isTimeCapsule) {
    explanation = "From this day in past years";
  } else if (item.resurfaceReason === 'Related to your focus') {
    explanation = "Related to your current focus";
  } else if (item.lastAccessedAt) {
    const diffDays = Math.floor((Date.now() - new Date(item.lastAccessedAt)) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      explanation = "You checked this recently";
    } else if (diffDays === 1) {
      explanation = "You viewed this yesterday";
    } else if (diffDays < 7) {
      explanation = `You viewed this ${diffDays} days ago`;
    } else {
      explanation = `You haven’t viewed this in ${diffDays} days`;
    }
  }

  // Scoring Label Logic
  let scoreLabel = "Quick revisit";
  let scoreClass = "rs-score--low";
  const rawScore = item._score || 0;
  if (rawScore >= 0.7) {
    scoreLabel = "Highly relevant";
    scoreClass = "rs-score--high";
  } else if (rawScore >= 0.4) {
    scoreLabel = "Worth revisiting";
    scoreClass = "rs-score--medium";
  }

  const handleCardClick = () => {
    if (feedback || dismissed) return;

    // 1. Show feedback
    setFeedback({ message: "Marked as revisited", type: "view" });

    // 2. Mark as viewed in backend
    onView?.(item._id);

    // 3. Trigger navigation/detail open
    onItemClick?.(item);

    // 4. Smoothly dismiss from feed
    setTimeout(() => setDismissed(true), 1600);
  };

  return (
    <article
      className={`rs-card${liked ? ' rs-card--liked' : ''}${feedback ? ' rs-card--dismissing' : ''}`}
      style={{ animationDelay: `${index * 55}ms` }}
      onClick={handleCardClick}
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
        {/* 1. WHY this resurfaced (Top priority) */}
        <div className="rs-explanation">
          <Lightbulb size={13} className="rs-explanation-icon" />
          <span className="rs-explanation-text">{explanation}</span>
        </div>

        {/* 2. Title (Main content) */}
        <h3 className="rs-title">{item.title}</h3>

        {/* 3. Relevance Label (Subtle badge) */}
        {rawScore > 0 && (
          <div className="rs-relevance-row">
            <span className={`rs-score-badge ${scoreClass}`}>
              {scoreLabel}
            </span>
            {ago && (
              <span className="rs-meta-item">
                <Clock size={10} />{ago}
              </span>
            )}
          </div>
        )}

        {/* 4. Tags (Context) */}
        {(item.tags || []).length > 0 && (
          <div className="rs-tags">
            {(item.tags || []).slice(0, 3).map((t, i) => (
              <span key={i} className="rs-tag">{t}</span>
            ))}
          </div>
        )}

        {/* 5. Stats (Lowest visual priority) */}
        <div className="rs-row rs-row--footer">
          <div className="rs-stats">
            {views > 0 && (
              <span className="rs-meta-item"><Eye size={10} />{views}</span>
            )}
            {likes > 0 && (
              <span className="rs-meta-item rs-meta-item--green"><ThumbsUp size={10} />{likes}</span>
            )}
            {savedDate && (
              <span className="rs-meta-item">{savedDate}</span>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons — appear on hover */}
      <div className="rs-actions" onClick={e => e.stopPropagation()}>
        <button
          className={`rs-btn rs-btn--like${liked ? ' active' : ''}`}
          onClick={() => {
            setLiked(true);
            onLike?.(item._id);
            setFeedback({ message: "We’ll show you more like this", type: "like" });
            setTimeout(() => setFeedback(null), 2000);
          }}
          title="Mark useful"
        ><ThumbsUp size={12} /></button>
        <button
          className="rs-btn rs-btn--skip"
          onClick={() => {
            setFeedback({ message: "We’ll show fewer like this", type: "skip" });
            onSkip?.(item._id);
            setTimeout(() => setDismissed(true), 1800);
          }}
          title="Dismiss"
        ><X size={12} /></button>
      </div>

      {/* Interaction Feedback Overlay */}
      {feedback && (
        <div className={`rs-feedback rs-feedback--${feedback.type}`}>
          <div className="rs-feedback-content">
            {feedback.type === 'like' ? <ThumbsUp size={14} /> : <X size={14} />}
            <span>{feedback.message}</span>
          </div>
        </div>
      )}
    </article>
  );
};

/* ─── Section ─────────────────────────────── */
const ResurfaceSection = ({ onItemClick, contextItem }) => {
  const contextTags = useMemo(() => contextItem?.tags || [], [contextItem]);

  const { data: rawItems = [], isLoading } = useQuery({
    queryKey: ["resurface", contextTags],
    queryFn: async () => {
      const res = await getResurfaceItems({ contextTags });
      return Array.isArray(res.items) ? res.items : [];
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30, // v5 rename of cacheTime
    refetchOnWindowFocus: false,
    refetchInterval: 1000 * 60 * 5
  });

  // Internal Mutations
  const likeMutation = useLikeItem();
  const skipMutation = useSkipItem();
  const viewMutation = useViewItem();
  const deleteMutation = useDeleteItem();

  const handleLike = (id) => likeMutation.mutate(id);
  const handleSkip = (id) => skipMutation.mutate(id);
  const handleView = (id) => viewMutation.mutate(id);
  const handleDelete = (id) => {
    if (window.confirm("Delete this memory?")) {
        deleteMutation.mutate(id);
    }
  };

  // Step 5: Group and Limit Items (Internal logic)
  const { timeCapsuleGroup, rediscoverGroup } = React.useMemo(() => {
    // 1. Filter unique items
    const uniqueItems = rawItems.filter((v, i, a) => 
      a.findIndex(t => (t._id === v._id)) === i
    );

    // 2. Separate into groups
    const tc = uniqueItems.filter(i => i.resurfaceReason === 'Time Capsule');
    const rd = uniqueItems.filter(i => i.resurfaceReason !== 'Time Capsule');

    // 3. Take up to 5 Time Capsule items
    const finalTC = tc.slice(0, 5);
    
    // 4. If total < 5, take remaining from Rediscover
    const remainingSlots = 5 - finalTC.length;
    const finalRD = rd.slice(0, remainingSlots);

    return { timeCapsuleGroup: finalTC, rediscoverGroup: finalRD };
  }, [rawItems]);

  if (isLoading) {
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

  // Step 6: Empty State Improvement
  if (timeCapsuleGroup.length === 0 && rediscoverGroup.length === 0) {
    return (
      <section className="rs-section rs-section--empty">
        <header className="rs-header">
            <p className="rs-eyebrow">For You</p>
            <h2 className="rs-heading">Time Capsule</h2>
        </header>
        <div className="rs-empty-content">
            <Clock size={24} className="rs-empty-icon" />
            <p className="rs-empty-text">No memories to resurface right now</p>
        </div>
      </section>
    );
  }

  const totalCount = timeCapsuleGroup.length + rediscoverGroup.length;

  return (
    <div className="rs-container">
      {/* SECTION 1: Time Capsule */}
      {timeCapsuleGroup.length > 0 && (
        <section className="rs-section">
          <header className="rs-header">
            <div>
              <p className="rs-eyebrow">For You</p>
              <h2 className="rs-heading">On This Day</h2>
            </div>
            {rediscoverGroup.length === 0 && (
               <span className="rs-pill">{timeCapsuleGroup.length} resurfaced</span>
            )}
          </header>

          <div className="rs-list">
            {timeCapsuleGroup.map((item, i) => (
              <ResurfaceCard
                key={item._id}
                item={item}
                index={i}
                onItemClick={onItemClick}
                onLike={handleLike}
                onSkip={handleSkip}
                onView={handleView}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </section>
      )}

      {/* SECTION 2: Rediscover */}
      {rediscoverGroup.length > 0 && (
        <section className={`rs-section ${timeCapsuleGroup.length > 0 ? 'rs-section--spaced' : ''}`}>
          <header className={`rs-header ${timeCapsuleGroup.length > 0 ? 'rs-header--sub' : ''}`}>
            <div>
              {timeCapsuleGroup.length === 0 && <p className="rs-eyebrow">For You</p>}
              <h2 className="rs-heading">Rediscover</h2>
            </div>
            <span className="rs-pill">{totalCount} resurfaced</span>
          </header>

          <div className="rs-list">
            {rediscoverGroup.map((item, i) => (
              <ResurfaceCard
                key={item._id}
                item={item}
                index={timeCapsuleGroup.length + i}
                onItemClick={onItemClick}
                onLike={handleLike}
                onSkip={handleSkip}
                onView={handleView}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ResurfaceSection;
