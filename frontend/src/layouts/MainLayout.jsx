import React, { useState } from 'react';
import Sidebar from '../layouts/Sidebar/Sidebar';
import Topbar from '../layouts/Topbar/Topbar';
import { Outlet } from 'react-router-dom';
import SaveModal from '../modules/items/components/SaveModal/SaveModal';
import './MainLayout.css';

const MainLayout = () => {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-view-container">
        <Topbar onSaveClick={() => setIsSaveModalOpen(true)} />
        <div className="content-view">
          <Outlet />
        </div>
      </div>

      <SaveModal 
        isOpen={isSaveModalOpen} 
        onClose={() => setIsSaveModalOpen(false)} 
      />
    </div>
  );
};

export default MainLayout;
