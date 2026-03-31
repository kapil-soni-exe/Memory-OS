import React, { useState } from 'react';
import { User, Palette, LogOut } from 'lucide-react';
import Sidebar from '../../layouts/Sidebar/Sidebar';
import Topbar from '../../layouts/Topbar/Topbar';
import { useAuth } from '../../modules/auth/hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import './SettingsPage.css';
import '../Home/Home.css';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="home-layout">
      <Sidebar />
      <div className="home-main">
        <Topbar />
        
        <main className="settings-container">
          <div className="settings-header">
            <h1>Settings</h1>
            <p>Manage your account settings and preferences.</p>
          </div>

          <div className="settings-layout">
            
            {/* Sidebar Tabs */}
            <div className="settings-sidebar">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
                </button>
              ))}
              
              <div className="settings-divider"></div>

              <button className="settings-tab text-danger" onClick={logout}>
                <LogOut size={18} />
                <span>Log Out</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="settings-content">
              
              {activeTab === 'profile' && (
                <div className="settings-panel animate-fade-in">
                  <h2>My Profile</h2>
                  <p className="panel-desc">Your personal information and account details.</p>
                  
                  <div className="settings-card">
                    <div className="form-group">
                      <label>Name</label>
                      <input type="text" value={user?.name || ''} disabled className="form-input" />
                    </div>
                    
                    <div className="form-group mt-4">
                      <label>Email Address</label>
                      <input type="email" value={user?.email || ''} disabled className="form-input" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="settings-panel animate-fade-in">
                  <h2>Appearance</h2>
                  <p className="panel-desc">Customize how MemoryOS looks on your device.</p>
                  
                  <div className="settings-card flex-between">
                    <div>
                      <h3>Theme Mode</h3>
                      <p className="panel-desc">Toggle between light and dark modes.</p>
                    </div>
                    
                    <button 
                      className={`simple-theme-toggle ${theme === 'dark' ? 'dark' : 'light'}`}
                      onClick={toggleTheme}
                    >
                      <div className="toggle-switch"></div>
                    </button>
                  </div>
                </div>
              )}



            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
