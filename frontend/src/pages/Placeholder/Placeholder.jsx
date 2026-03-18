import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import '../Home/Home.css';

const PlaceholderPage = ({ title }) => (
  <div className="home-layout">
    <Sidebar />
    <div className="home-main">
      <Topbar />
      <main className="home-content" style={{ padding: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'var(--text-4xl)', marginBottom: '20px' }}>{title}</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>This feature is coming soon to your second brain.</p>
      </main>
    </div>
  </div>
);

export default PlaceholderPage;
