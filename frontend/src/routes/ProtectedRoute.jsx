import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import MobileTabs from '../components/MobileTabs/MobileTabs';

const ProtectedRoute = () => {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--color-bg)',
        color: 'var(--color-text-primary)'
      }}>
        Loading...
      </div>
    );
  }

  return authenticated ? (
    <>
      <Outlet />
      <MobileTabs />
    </>
  ) : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
