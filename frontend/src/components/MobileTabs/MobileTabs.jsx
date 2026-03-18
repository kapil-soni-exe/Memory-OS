import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Bookmark, Hash, Settings } from 'lucide-react';
import './MobileTabs.css';

const MobileTabs = () => {
  const location = useLocation();

  const tabs = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: Bookmark, label: 'Saved', path: '/saved' },
    { icon: Hash, label: 'Topics', path: '/topics' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <nav className="mobile-tabs">
      {tabs.map((tab, index) => {
        const Icon = tab.icon;
        const isActive = location.pathname === tab.path;
        
        return (
          <Link 
            key={index} 
            to={tab.path} 
            className={`mobile-tab-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileTabs;
