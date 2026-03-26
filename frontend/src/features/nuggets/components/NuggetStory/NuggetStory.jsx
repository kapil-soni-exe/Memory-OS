import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { getNuggetFeed } from '../../services/nugget.api';
import NuggetStoryOverlay from './NuggetStoryOverlay';
import './NuggetStory.css';

const NuggetStory = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const data = await getNuggetFeed();
        setStories(data.stories || []);
      } catch (err) {
        console.error("Failed to fetch stories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  if (loading || stories.length === 0) return null;

  return (
    <div className="nugget-stories-wrapper">
      <div className="stories-container">
        {stories.map((story, index) => (
          <div 
            key={story.itemId} 
            className="story-circle-wrapper"
            onClick={() => setActiveStoryIndex(index)}
          >
            <div className="story-ring">
              <div className="story-circle">
                <div className="story-ai-badge">
                  <Sparkles size={10} />
                </div>
                {story.image ? (
                  <img src={story.image} alt="" />
                ) : (
                  <div className="story-placeholder">
                    {story.title.charAt(0)}
                  </div>
                )}
              </div>
            </div>
            <span className="story-label">{story.title}</span>
          </div>
        ))}
      </div>

      {activeStoryIndex !== null && (
        <NuggetStoryOverlay 
          stories={stories}
          initialIndex={activeStoryIndex}
          onClose={() => setActiveStoryIndex(null)}
        />
      )}
    </div>
  );
};

export default NuggetStory;
