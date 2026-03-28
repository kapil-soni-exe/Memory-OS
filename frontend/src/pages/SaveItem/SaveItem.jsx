import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';
import Sidebar from '../../layouts/Sidebar/Sidebar';
import SaveForm from '../../modules/items/components/SaveForm/SaveForm';
import { saveItem } from '../../modules/items/services/item.api';
import './SaveItem.css';

const SaveItem = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ input: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.input) return;

    setIsLoading(true);
    try {
      await saveItem(formData);
      navigate('/home');
    } catch (error) {
      console.error("Failed to save item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="save-page-layout">
      <Sidebar />
      <main className="save-page-content">
        <div className="save-page-container">
          <header className="save-page-header">
            <button className="back-btn" onClick={() => navigate('/home')}>
              <ArrowLeft size={18} />
              <span>Back to Knowledge</span>
            </button>
            <div className="save-page-icon">
              <Sparkles size={32} />
            </div>
            <h1 className="save-page-title">Save to MemoryOS</h1>
            <p className="save-page-subtitle">Paste a link and let AI extract the key insights for you.</p>
          </header>

          <div className="save-card shadow-lg">
            <SaveForm 
              onSubmit={handleSubmit}
              isLoading={isLoading}
              formData={formData}
              setFormData={setFormData}
            />
          </div>

          <section className="save-page-tips">
            <h3 className="tips-title">Capture Everything</h3>
            <ul className="tips-list">
              <li>YouTube videos are summarized and key moments extracted.</li>
              <li>PDFs are indexed for semantic search across your brain.</li>
              <li>Articles are cleaned of ads and organized by topic.</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
};

export default SaveItem;
