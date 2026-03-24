import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home as HomeIcon,
  Bookmark,
  Hash,
  Share2,
  Settings,
  LogOut,
  Plus
} from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import './Sidebar.css';

const Sidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { icon: HomeIcon, label: 'Home', path: '/home' },
    { icon: Bookmark, label: 'Saved Items', path: '/saved' },
    { icon: Hash, label: 'Topics', path: '/topics' },
    { icon: Share2, label: 'Knowledge Graph', path: '/graph' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Link to="/home" className="sidebar-brand-link">
          <img src="/logo.png" alt="MemoryOS" className="sidebar-logo" />
        </Link>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </Link>
        ))}
        <Link
          to="/save"
          className={`sidebar-link ${location.pathname === '/save' ? 'active' : ''}`}
        >
          <Plus size={20} />
          <span>Save New</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        <Link to="/settings" className={`sidebar-link ${location.pathname === '/settings' ? 'active' : ''}`}>
          <Settings size={20} />
          <span>Settings</span>
        </Link>
        <button onClick={logout} className="sidebar-link logout-btn">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
