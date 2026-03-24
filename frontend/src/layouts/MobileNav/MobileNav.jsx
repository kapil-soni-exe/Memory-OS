import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home as HomeIcon,
  Bookmark,
  Hash,
  Share2,
  Plus
} from 'lucide-react';
import './MobileNav.css';

const MobileNav = ({ onSaveClick }) => {
  const location = useLocation();

  const navItems = [
    { icon: HomeIcon, label: 'Home', path: '/home' },
    { icon: Bookmark, label: 'Saved', path: '/saved' },
    { icon: Hash, label: 'Topics', path: '/topics' },
    { icon: Share2, label: 'Graph', path: '/graph' },
  ];

  return (
    <nav className="mobile-nav">
      <div className="mobile-nav-items">
        {navItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`mobile-nav-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </Link>
        ))}
        <button className="mobile-nav-link add-btn" onClick={onSaveClick}>
          <div className="plus-icon-wrapper">
             <Plus size={20} />
          </div>
          <span>Save</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileNav;
