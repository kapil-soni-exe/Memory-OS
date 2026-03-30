import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import { getNuggetFeed } from '../../services/nugget.api';
import NuggetStoryOverlay from './NuggetStoryOverlay';
import './NuggetStory.css';

const NuggetStory = () => {
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);

  // Step 4: USE QUERY
  const { data, isLoading } = useQuery({
    queryKey: ["nuggets"],
    queryFn: getNuggetFeed,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: (query) => {
      const stories = query.state.data?.stories || [];
      const hasPending = stories.some(s => 
        s.processingStatus === 'pending' || s.processingStatus === 'processing'
      );
      return hasPending ? 3000 : false;
    },
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
  });

  // Step 5: DERIVE STORIES
  const stories = data?.stories || [];

  if (isLoading || stories.length === 0) return null;

  return (
    <div className="nugget-stories-wrapper">
      <div className="stories-container">
        {stories.map((story, index) => {
          const isProcessing = story.processingStatus === 'pending' || story.processingStatus === 'processing';
          const hasNuggets = story.nuggets && story.nuggets.length > 0;
          
          return (
            <div 
              key={story.itemId} 
              className={`story-circle-wrapper ${isProcessing ? 'processing' : ''} ${!hasNuggets ? 'empty' : ''}`}
              onClick={() => hasNuggets && setActiveStoryIndex(index)}
              style={{ cursor: hasNuggets ? 'pointer' : 'default' }}
            >
              <div className="story-ring">
                <div className="story-circle">
                  <div className={`story-ai-badge ${isProcessing ? 'spinning' : ''}`}>
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
              <span className="story-label">
                {isProcessing ? 'Creating...' : story.title}
              </span>
            </div>
          );
        })}
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
