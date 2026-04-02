import * as React from "react";
import { Search, Brain, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import TopicCard from '../../modules/items/components/TopicCard/TopicCard';
import SaveModal from '../../modules/items/components/SaveModal/SaveModal';
import { getTopics } from '../../modules/items/services/topic.api';
import { useDeleteTopic } from '../../modules/items/hooks/useTopicMutation';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, pageTransition } from '../../styles/animations';
import './TopicsPage.css';

const TopicsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: topics = [], isLoading, error } = useQuery({
    queryKey: ["topics"],
    queryFn: getTopics,
    staleTime: 1000 * 60 * 5,
  });

  const deleteTopicMutation = useDeleteTopic();

  const rootTopics = useMemo(() => {
    return topics.filter(t => !t.parentTopicId || t.level === 1);
  }, [topics]);

  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return rootTopics;
    return rootTopics.filter(t =>
      t.topicName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rootTopics, searchQuery]);

  const totalMemories = useMemo(() => {
    return rootTopics.reduce((sum, t) => sum + (t.itemCount || 0), 0);
  }, [rootTopics]);

  const handleTopicClick = (topicId) => navigate(`/topics/${topicId}`);

  const handleDeleteTopic = (topicId) => {
    deleteTopicMutation.mutate(topicId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["topics"] });
      }
    });
  };

  return (
    <motion.div 
      className="topics-content-wrapper"
      {...pageTransition}
    >
      <main className="topics-content">

        {/* ── Header ── */}
        <motion.header 
          className="page-header"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <div className="header-left">
            <motion.div variants={fadeInUp} className="header-eyebrow">
              <div className="header-eyebrow-dot" />
              Knowledge Galaxy
            </motion.div>
            <motion.h1 variants={fadeInUp} className="page-title">Your Second Brain</motion.h1>
            <motion.p variants={fadeInUp} className="page-subtitle">
              AI-organized topics, auto-structured into hierarchies
            </motion.p>
          </div>

          <div className="header-right">
            {!isLoading && !error && (
              <motion.div variants={fadeInUp} className="header-stats">
                <div className="stat-block">
                  <span className="stat-num">{rootTopics.length}</span>
                  <span className="stat-label">Root Topics</span>
                </div>
                <div className="stat-block">
                  <span className="stat-num">{totalMemories}</span>
                  <span className="stat-label">Memories</span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.header>

        {/* ── Search ── */}
        <motion.div 
          className="search-controls"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
        >
          <div className="search-row">
            <div className="search-box-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                className="topic-search-input"
                placeholder="Search root topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="filter-btn">
              <SlidersHorizontal size={14} />
              Filter
            </button>
          </div>
        </motion.div>

        {/* ── Section Label ── */}
        {!isLoading && !error && filteredTopics.length > 0 && (
          <motion.div 
            className="topics-section-label"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {searchQuery
              ? `${filteredTopics.length} result${filteredTopics.length !== 1 ? 's' : ''} found`
              : 'Root Topics'
            }
          </motion.div>
        )}

        {/* ── Grid ── */}
        <motion.div 
          className="topics-grid"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          layout // Enable layout animations for smooth reordering
        >
          {isLoading ? (
            <div className="loading-state">
              <div className="empty-icon-wrap">
                <Brain size={28} />
              </div>
              <p>Synthesizing neural map...</p>
            </div>

          ) : error ? (
            <div className="error-state">
              <p>Error loading topics. Please try again.</p>
            </div>

          ) : filteredTopics.length === 0 ? (
            <div className="empty-state-simple">
              <div className="empty-icon-wrap">
                <Brain size={28} />
              </div>
              <p>
                {searchQuery
                  ? `No topics matching "${searchQuery}"`
                  : 'No root topics yet. Save an item to begin!'
                }
              </p>
            </div>

          ) : (
            filteredTopics.map((topic) => (
              <TopicCard
                key={topic._id}
                topic={topic}
                onClick={() => handleTopicClick(topic._id)}
                onDelete={handleDeleteTopic}
              />
            ))
          )}
        </motion.div>

      </main>

      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
      />
    </motion.div>
  );
};

export default TopicsPage;