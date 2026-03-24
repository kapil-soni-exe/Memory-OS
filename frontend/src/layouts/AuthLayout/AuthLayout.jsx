import React from 'react';
import { Link } from 'react-router-dom';
import './AuthLayout.css';

const AuthLayout = ({ children, title, subtitle, footer }) => {
  return (
    <div className="auth-layout">
      {/* Background Glows */}
      <div className="auth-bg-glow auth-bg-glow--1" />
      <div className="auth-bg-glow auth-bg-glow--2" />
      
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <img src="/logo.png" alt="MemoryOS Logo" />
            </Link>
            <h1 className="auth-title">{title}</h1>
            <p className="auth-subtitle">{subtitle}</p>
          </div>
          
          <div className="auth-content">
            {children}
          </div>

          {footer && (
            <div className="auth-footer-container">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
