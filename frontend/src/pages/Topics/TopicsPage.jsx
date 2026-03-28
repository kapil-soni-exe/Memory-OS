import * as React from "react";
import { Search, Plus, Brain, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import Sidebar from '../../layouts/Sidebar/Sidebar';
import Topbar from '../../layouts/Topbar/Topbar';
import TopicCard from '../../modules/items/components/TopicCard/TopicCard';
import SaveModal from '../../modules/items/components/SaveModal/SaveModal';
import { getTopics } from '../../modules/items/services/topic.api';
import { useDeleteTopic } from '../../modules/items/hooks/useTopicMutation';
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
    <div className="topics-layout">
      <Sidebar />

      <div className="topics-main">
        <Topbar onSaveClick={() => setIsSaveModalOpen(true)} />

        <main className="topics-content">

          {/* ── Header ── */}
          <header className="page-header">
            <div className="header-left">
              <div className="header-eyebrow">
                <div className="header-eyebrow-dot" />
                Knowledge Galaxy
              </div>
              <h1 className="page-title">Your Second Brain</h1>
              <p className="page-subtitle">
                AI-organized topics, auto-structured into hierarchies
              </p>
            </div>

            <div className="header-right">
              {/* Stats — only show when data is loaded */}
              {!isLoading && !error && (
                <div className="header-stats">
                  <div className="stat-block">
                    <span className="stat-num">{rootTopics.length}</span>
                    <span className="stat-label">Root Topics</span>
                  </div>
                  <div className="stat-block">
                    <span className="stat-num">{totalMemories}</span>
                    <span className="stat-label">Memories</span>
                  </div>
                </div>
              )}

              <button
                className="create-topic-btn"
                onClick={() => setIsSaveModalOpen(true)}
              >
                <Plus size={16} />
                Save Item
              </button>
            </div>
          </header>

          {/* ── Search ── */}
          <div className="search-controls">
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
          </div>

          {/* ── Section Label ── */}
          {!isLoading && !error && filteredTopics.length > 0 && (
            <div className="topics-section-label">
              {searchQuery
                ? `${filteredTopics.length} result${filteredTopics.length !== 1 ? 's' : ''} found`
                : 'Root Topics'
              }
            </div>
          )}

          {/* ── Grid ── */}
          <div className="topics-grid">
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
          </div>

        </main>
      </div>

      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
      />
    </div>
  );
};

export default TopicsPage;