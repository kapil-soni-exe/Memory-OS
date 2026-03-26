import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { getNuggetFeed } from '../../services/nugget.api';
import NuggetCard from '../NuggetCard/NuggetCard';
import './NuggetFeed.css';

const NuggetFeed = () => {
  const [nuggets, setNuggets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const data = await getNuggetFeed();
      setNuggets(data.nuggets);
    } catch (err) {
      console.error("Failed to load nuggets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  if (loading) {
    return (
      <div className="nugget-feed-status">
        <Sparkles className="animate-pulse" />
        <p>Distilling your memories...</p>
      </div>
    );
  }

  if (nuggets.length === 0) {
    return (
      <div className="nugget-feed-empty">
        <p>Save more items to see your knowledge feed come alive!</p>
      </div>
    );
  }

  return (
    <div className="nugget-feed-container">
      <div className="nugget-feed-header">
        <div className="nugget-feed-title-area">
          <Sparkles size={20} className="text-purple-500" />
          <h2 className="nugget-feed-title">Neural Feed</h2>
        </div>
        <button onClick={fetchFeed} className="feed-refresh-btn" title="Refresh Insights">
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="nugget-feed-scroll">
        {nuggets.map((nugget, index) => (
          <div key={`${nugget.itemId}-${index}`} className="nugget-card-wrapper">
            <NuggetCard nugget={nugget} />
          </div>
        ))}
        
        <div className="nugget-feed-end">
          <p>You're all caught up on your insights!</p>
        </div>
      </div>
    </div>
  );
};

export default NuggetFeed;
