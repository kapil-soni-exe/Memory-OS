import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreHorizontal, Filter, Trash2 } from 'lucide-react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import SavedItemCard from '../../components/SavedItemCard/SavedItemCard';
import ItemDetailPanel from '../../components/ItemDetailPanel/ItemDetailPanel';
import SaveModal from '../../components/SaveModal/SaveModal';
import { getTopicById } from '../../services/topic.api';
import useTopics from '../../hooks/useTopics';
import useItems from '../../hooks/useItems';
import './TopicDetail.css';

const TopicDetail = () => {
  const { topicName: topicId } = useParams();
  const navigate = useNavigate();
  const { removeTopic } = useTopics();
  const { removeItem } = useItems();
  
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [topic, setTopic] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleDeleteTopic = async () => {
    if (window.confirm("Are you sure you want to delete this entire Topic? All associated memories will be permanently removed from your galaxy.")) {
      try {
        await removeTopic(topicId);
        navigate('/topics');
      } catch (err) {
        alert("Failed to delete topic");
      }
    }
  };

  useEffect(() => {
    const fetchTopicData = async () => {
      try {
        setLoading(true);
        const data = await getTopicById(topicId);
        setTopic(data.topic);
        setItems(data.items);
      } catch (err) {
        console.error("Failed to fetch topic detail:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (topicId) fetchTopicData();
  }, [topicId]);

  if (loading) {
    return (
        <div className="topic-detail-layout">
            <Sidebar />
            <div className="topic-detail-main">
                <Topbar onSaveClick={() => setIsSaveModalOpen(true)} />
                <main className="topic-detail-content">
                    <p>Loading topic...</p>
                </main>
            </div>
        </div>
    );
  }

  if (error || !topic) {
    return (
        <div className="topic-detail-layout">
            <Sidebar />
            <div className="topic-detail-main">
                <Topbar onSaveClick={() => setIsSaveModalOpen(true)} />
                <main className="topic-detail-content">
                    <button className="back-btn" onClick={() => navigate('/topics')}>
                        <ArrowLeft size={18} />
                        <span>Back to Topics</span>
                    </button>
                    <p>Error: Topic not found.</p>
                </main>
            </div>
        </div>
    );
  }

  return (
    <div className="topic-detail-layout">
      <Sidebar />
      
      <div className="topic-detail-main">
        <Topbar onSaveClick={() => setIsSaveModalOpen(true)} />
        
        <main className="topic-detail-content">
          <button className="back-btn" onClick={() => navigate('/topics')}>
            <ArrowLeft size={18} />
            <span>Back to Topics</span>
          </button>
          <header className="topic-header">
            <div className="topic-headline-row">
              <h1 className="topic-title">{topic.topicName}</h1>
              <div className="header-actions">
                <button className="icon-action-btn danger" onClick={handleDeleteTopic} title="Delete Topic and all its memories">
                  <Trash2 size={18} />
                </button>
                <button className="icon-action-btn"><Filter size={18} /></button>
                <button className="icon-action-btn"><MoreHorizontal size={18} /></button>
              </div>
            </div>
            <p className="topic-stats">{items.length} items collected in this category</p>
          </header>

          <div className="topic-grid">
            {items.length === 0 ? (
                <p>No items in this topic yet.</p>
            ) : (
                items.map((item) => (
                    <div key={item._id} onClick={() => setSelectedItem(item)} className="card-clickable-wrapper">
                      <SavedItemCard 
                        item={item} 
                        onDelete={(id) => {
                          removeItem(id);
                          setItems(prev => prev.filter(i => i._id !== id));
                        }} 
                      />
                    </div>
                  ))
            )}
          </div>
        </main>
      </div>

      <ItemDetailPanel 
        item={selectedItem} 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        onDelete={(id) => {
          removeItem(id);
          setItems(prev => prev.filter(i => i._id !== id));
        }}
      />

      <SaveModal 
        isOpen={isSaveModalOpen} 
        onClose={() => setIsSaveModalOpen(false)} 
      />
    </div>
  );
};

export default TopicDetail;
