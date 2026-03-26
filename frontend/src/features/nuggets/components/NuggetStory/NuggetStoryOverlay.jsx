import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import './NuggetStoryOverlay.css';

const STORY_DURATION = 5000; // 5 seconds per nugget

const NuggetStoryOverlay = ({ stories, initialIndex, onClose }) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialIndex);
  const [currentNuggetIndex, setCurrentNuggetIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const activeStory = stories[currentStoryIndex];
  const activeNuggets = activeStory.nuggets;
  const currentNugget = activeNuggets[currentNuggetIndex];

  const nextNugget = () => {
    if (currentNuggetIndex < activeNuggets.length - 1) {
      setCurrentNuggetIndex(prev => prev + 1);
      setProgress(0);
    } else if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setCurrentNuggetIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const prevNugget = () => {
    if (currentNuggetIndex > 0) {
      setCurrentNuggetIndex(prev => prev - 1);
      setProgress(0);
    } else if (currentStoryIndex > 0) {
      const prevStory = stories[currentStoryIndex - 1];
      setCurrentStoryIndex(prev => prev - 1);
      setCurrentNuggetIndex(prevStory.nuggets.length - 1);
      setProgress(0);
    }
  };

  useEffect(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = (elapsed / STORY_DURATION) * 100;
      
      if (newProgress >= 100) {
        nextNugget();
      } else {
        setProgress(newProgress);
      }
    }, 50);

    return () => clearInterval(timerRef.current);
  }, [currentStoryIndex, currentNuggetIndex]);

  return ReactDOM.createPortal(
    <div className="story-overlay">
      <div className="story-overlay-backdrop" onClick={onClose} />
      
      <div className="story-content-container">
        {/* Progress Bars */}
        <div className="story-progress-container">
          {activeNuggets.map((_, index) => (
            <div key={index} className="progress-bar-bg">
              <div 
                className="progress-bar-fill" 
                style={{ 
                  width: index === currentNuggetIndex ? `${progress}%` : index < currentNuggetIndex ? '100%' : '0%' 
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="story-header">
          <div className="story-user-info">
            <div className="story-mini-avatar">
              {activeStory.title.charAt(0)}
            </div>
            <div className="story-meta">
              <span className="story-title">{activeStory.title}</span>
              <span className="story-category">{currentNugget.category}</span>
            </div>
          </div>
          <button className="story-close-btn" onClick={onClose}><X size={24} /></button>
        </div>

        {/* The Nugget Body */}
        <div className="story-body">
          <span className="quote-mark">“</span>
          <div className="story-text">
             {currentNugget.text}
          </div>
        </div>

        {/* Navigation Areas (Invisible) */}
        <div className="story-nav-prev" onClick={(e) => { e.stopPropagation(); prevNugget(); }} />
        <div className="story-nav-next" onClick={(e) => { e.stopPropagation(); nextNugget(); }} />
      </div>
    </div>,
    document.body
  );
};

export default NuggetStoryOverlay;
