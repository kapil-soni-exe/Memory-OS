import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MoreHorizontal, Trash2,
  ChevronRight, Sparkles, Folder, Filter
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import SavedItemCard from '../../modules/items/components/SavedItemCard/SavedItemCard';
import ItemDetailPanel from '../../modules/items/components/ItemDetailPanel/ItemDetailPanel';
import SaveModal from '../../modules/items/components/SaveModal/SaveModal';
import { getTopicById } from '../../modules/items/services/topic.api';
import { useDeleteItem } from '../../modules/items/hooks/useItemMutation';
import { useDeleteTopic } from '../../modules/items/hooks/useTopicMutation';
import { pageTransition } from '../../styles/animations';
import './TopicDetail.css';

const LEVEL_COLORS = {
  1: 'var(--feature-purple)',
  2: 'var(--feature-blue)',
  3: 'var(--feature-green)',
};

const TopicDetail = () => {
  const { topicName: topicId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['topic', topicId],
    queryFn: () => getTopicById(topicId),
    enabled: !!topicId,
    staleTime: 1000 * 60 * 2,
  });

  const deleteItemMutation = useDeleteItem();
  const deleteTopicMutation = useDeleteTopic();

  const topic = data?.topic;
  const items = data?.items || [];
  const subTopics = data?.subTopics || [];

  const accentColor = LEVEL_COLORS[topic?.level] || 'var(--feature-purple)';

  const handleDeleteTopic = () => {
    if (window.confirm(`Delete "${topic?.topicName}" and all its memories permanently?`)) {
      deleteTopicMutation.mutate(topicId, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['items'] });
          queryClient.invalidateQueries({ queryKey: ['topics'] });
          queryClient.invalidateQueries({ queryKey: ['topic'] });
          navigate('/topics');
        }
      });
    }
  };

  const handleDeleteItem = (id) => {
    deleteItemMutation.mutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['items'] });
        queryClient.invalidateQueries({ queryKey: ['topic', topicId] });
      }
    });
  };

  // ── Loading State ──
  if (isLoading) {
    return (
      <motion.div className="td-content-wrapper" {...pageTransition}>
        <main className="td-content">
          <div className="td-loading">
            <div className="td-loading-icon">
              <Folder size={24} />
            </div>
            <p>Loading topic...</p>
          </div>
        </main>
      </motion.div>
    );
  }

  // ── Error State ──
  if (error || !topic) {
    return (
      <motion.div className="td-content-wrapper" {...pageTransition}>
        <main className="td-content">
          <button className="td-back-btn" onClick={() => navigate('/topics')}>
            <ArrowLeft size={16} />
            <span>Explorer</span>
          </button>
          <div className="td-loading">
            <p>Topic not found.</p>
          </div>
        </main>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="td-content-wrapper"
      {...pageTransition}
    >
      <main className="td-content">
        <button className="td-back-btn" onClick={() => navigate('/topics')}>
          <ArrowLeft size={16} />
          <span>Explorer</span>
        </button>

        <header className="td-header" style={{ '--accent': accentColor }}>
          <div className="td-header-inner">
            <div className="td-icon-wrap" style={{ background: `color-mix(in srgb, ${accentColor} 12%, transparent)`, color: accentColor }}>
              <Folder size={24} />
            </div>

            <div className="td-header-text">
              {topic.level > 1 && topic.parentTopicId && (
                <div className="td-breadcrumb">
                  <span onClick={() => navigate(`/topics/${topic.parentTopicId}`)}>
                    Parent Topic
                  </span>
                  <ChevronRight size={12} />
                  <span className="td-breadcrumb-current">Current</span>
                </div>
              )}

              <h1 className="td-title">{topic.topicName}</h1>
              <p className="td-stats">
                {items.length} {items.length === 1 ? 'memory' : 'memories'}
                {subTopics.length > 0 && ` · ${subTopics.length} sub-folders`}
              </p>
            </div>
          </div>

          <div className="td-actions">
            <button
              className="td-action-btn danger"
              onClick={handleDeleteTopic}
              disabled={deleteTopicMutation.isPending}
              title="Delete topic"
            >
              <Trash2 size={16} />
            </button>
            <button className="td-action-btn" title="Filter">
              <Filter size={16} />
            </button>
            <button className="td-action-btn" title="More options">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </header>

        {topic.reason && (
          <div className="td-reason-badge">
            <Sparkles size={13} />
            <span>{topic.reason}</span>
          </div>
        )}

        <div className="td-level-row">
          <span
            className="td-level-badge"
            style={{
              background: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
              color: accentColor,
              borderColor: `color-mix(in srgb, ${accentColor} 25%, transparent)`,
            }}
          >
            Level {topic.level} Topic
          </span>

          {topic.confidence > 0 && (
            <span className="td-confidence">
              {Math.round(topic.confidence * 100)}% confidence
            </span>
          )}
        </div>

        {subTopics.length > 0 && (
          <section className="td-section">
            <h2 className="td-section-title">Sub-Folders</h2>
            <div className="td-sub-grid">
              {subTopics.map(sub => (
                <div
                  key={sub._id}
                  className="td-sub-chip"
                  onClick={() => navigate(`/topics/${sub._id}`)}
                >
                  <div className="td-sub-icon">
                    <Folder size={16} />
                  </div>
                  <div className="td-sub-info">
                    <h3>{sub.topicName}</h3>
                    <span>{sub.itemCount} items</span>
                  </div>
                  <ChevronRight size={14} className="td-sub-chevron" />
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="td-section">
          <h2 className="td-section-title">Curated Memories</h2>
          <div className="td-items-grid">
            {items.length === 0 ? (
              <div className="td-empty">
                <p>No memories in this topic yet.</p>
              </div>
            ) : (
              items.map(item => (
                <div
                  key={item._id}
                  className="td-card-wrapper"
                  onClick={() => setSelectedItem(item)}
                >
                  <SavedItemCard
                    item={item}
                    onDelete={handleDeleteItem}
                  />
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <ItemDetailPanel
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onDelete={handleDeleteItem}
      />

      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
      />
    </motion.div>
  );
};

export default TopicDetail;