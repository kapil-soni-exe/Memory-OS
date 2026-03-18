import * as React from "react";
import { Search, Plus, Cpu, Brain, Database, Palette, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import TopicCard from '../../components/TopicCard/TopicCard';
import SaveModal from '../../components/SaveModal/SaveModal';
import useTopics from '../../hooks/useTopics';
import './TopicsPage.css';
import { useState } from 'react';

const TopicsPage = () => {
  const navigate = useNavigate();
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { topics, loading, error, removeTopic } = useTopics();

  const filteredTopics = topics.filter(topic => 
    (topic.topicName || topic.name)?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTopicClick = (topicId) => {
    navigate(`/topics/${topicId}`);
  };

  return (
    <div className="topics-layout">
      <Sidebar />
      
      <div className="topics-main">
        <Topbar onSaveClick={() => setIsSaveModalOpen(true)} />
        
        <main className="topics-content">
          <header className="page-header">
            <div className="header-text">
              <h1 className="page-title">Topics</h1>
              <p className="page-subtitle">Organize and explore your knowledge by topics.</p>
            </div>
            <button className="create-topic-btn">
              <Plus size={18} />
              <span>Create Topic</span>
            </button>
          </header>

          <section className="search-controls">
            <div className="search-box-wrapper">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search topics..." 
                className="topic-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </section>

          <div className="topics-grid">
            {loading ? (
              <p>Loading topics...</p>
            ) : filteredTopics.length === 0 ? (
              <p>No topics found.</p>
            ) : (
              filteredTopics.map((topic) => (
                <TopicCard 
                  key={topic._id} 
                  topic={topic} 
                  onClick={() => handleTopicClick(topic._id)}
                  onDelete={removeTopic}
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
