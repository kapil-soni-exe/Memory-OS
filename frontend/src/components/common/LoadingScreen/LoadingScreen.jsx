import React from 'react';
import { Sparkles } from 'lucide-react';
import './LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="galaxy-container">
        <div className="galaxy-pulse"></div>
        <div className="galaxy-pulse middle"></div>
        <div className="galaxy-pulse inner"></div>
        
        <div className="logo-container">
          <Sparkles className="loading-logo" size={48} />
        </div>
      </div>
      
      <div className="loading-text-group">
        <h1 className="loading-title">MemoryOS</h1>
        <p className="loading-subtitle">Awakening your knowledge galaxy...</p>
      </div>
      
      <div className="loading-bar-container">
        <div className="loading-bar-fill"></div>
      </div>
    </div>
  );
};

export default LoadingScreen;
