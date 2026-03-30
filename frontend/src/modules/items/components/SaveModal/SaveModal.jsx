import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2, Search, Brain, Zap, Check } from 'lucide-react';
import SaveForm from '../SaveForm/SaveForm';
import { useAddItem } from '../../hooks/useItemMutation';
import { extractContent } from '../../services/item.api';
import './SaveModal.css';

const SaveModal = ({ isOpen, onClose }) => {
  const [view, setView] = useState('input'); // input, processing, review
  const [formData, setFormData] = useState({ input: '' });
  const [processStep, setProcessStep] = useState(0);
  const addItemMutation = useAddItem();
  const [previewItem, setPreviewItem] = useState(null);
  
  const steps = [
    { icon: Search, text: "Nexus is scanning..." },
    { icon: Brain, text: "Extracting intelligence..." },
    { icon: Zap, text: "Preparing your preview..." }
  ];

  // Sync process steps during loading
  useEffect(() => {
    let interval;
    if (view === 'processing' && processStep < steps.length - 1) {
      interval = setInterval(() => {
        setProcessStep(prev => prev + 1);
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [view, processStep, steps.length]);

  const resetForm = () => {
    setView('input');
    setProcessStep(0);
    setFormData({ input: '' });
    setPreviewItem(null);
  };

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    if (!formData.input && !formData.file) return;
    
    setView('processing');
    try {
      let data;
      if (formData.file) {
        // For files, we still use addItem directly (as standard upload flow)
        // because we don't have a dedicated "file extract" preview yet
        const item = await addItemMutation.mutateAsync(formData);
        setPreviewItem(item);
        setTimeout(() => setView('review'), 1000);
      } else {
        // For URLs and text, we use the NEW extraction flow
        const result = await extractContent({ 
          url: formData.input.startsWith('http') ? formData.input : undefined,
          content: !formData.input.startsWith('http') ? formData.input : undefined
        });
        
        setPreviewItem({
          ...result,
          title: result.title,
          type: result.type,
          content: result.content,
          url: formData.input.startsWith('http') ? formData.input : undefined
        });
        
        setTimeout(() => setView('review'), 1200);
      }
    } catch (err) {
      console.error("Extraction failed:", err);
      setView('input');
      setProcessStep(0);
    }
  };

  const handleRefine = async (e) => {
    e.preventDefault();
    try {
      // If it's already saved (file upload flow), we update
      if (previewItem._id) {
        // file logic: item already exists in DB
        onClose();
        setTimeout(resetForm, 500);
      } else {
        // preview logic: item NOT in DB yet
        await addItemMutation.mutateAsync(previewItem);
        onClose();
        setTimeout(resetForm, 500);
      }
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`save-panel-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className={`save-panel-container ${isOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="save-panel-header">
          <div className="save-panel-header-top">
            <div className="brand-group">
              <Sparkles className="brand-icon" size={20} />
              <h2 className="panel-title">
                {view === 'review' ? 'Preview Memory' : 'New Memory'}
              </h2>
            </div>
            <button className="panel-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          <p className="panel-subtitle">
            {view === 'review' ? 'Nexus has extracted the essence. Customize before saving.' : 'Add a URL or note to your digital consciousness.'}
          </p>
        </div>

        <div className="save-panel-content">
          {view === 'processing' && (
            <div className="processing-state fade-in">
              <div className="processing-visual">
                <div className="pulse-ring"></div>
                <div className="active-step-icon">
                  {React.createElement(steps[processStep].icon, { size: 32 })}
                </div>
              </div>
              <div className="processing-details">
                <h3 className="processing-title">Nexus is scanning</h3>
                <p className="processing-step-text">{steps[processStep].text}</p>
                <div className="process-progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${((processStep + 1) / steps.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {view === 'input' && (
            <SaveForm
              onSubmit={handleInitialSubmit}
              isLoading={false}
              formData={formData}
              setFormData={setFormData}
            />
          )}

          {view === 'review' && previewItem && (
            <div className="refinement-view">
              <div className="refinement-header">
                <div className="success-icon-wrapper">
                  <Check size={32} />
                </div>
                <h3 className="refinement-title">Preview Extracted</h3>
              </div>

              <form className="refinement-form" onSubmit={handleRefine}>
                <div className="form-field">
                  <label>Title</label>
                  <input 
                    type="text" 
                    className="refinement-input"
                    value={previewItem.title}
                    onChange={(e) => setPreviewItem({...previewItem, title: e.target.value})}
                    placeholder="Enter title"
                  />
                </div>

                <div className="form-field">
                  <label>Type</label>
                  <select 
                    className="refinement-select"
                    value={previewItem.type}
                    onChange={(e) => setPreviewItem({...previewItem, type: e.target.value})}
                  >
                    {["article", "video", "tweet", "pdf", "image", "note", "thought", "book", "task", "quote", "code"].map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div className="preview-snippet">
                   <label>Content Preview</label>
                   <p>{previewItem.content?.slice(0, 200)}...</p>
                </div>

                <div className="refinement-footer">
                  <button type="submit" className="refine-btn">Confirm & Save</button>
                  <button type="button" className="cancel-btn" onClick={() => {
                     onClose();
                     setTimeout(resetForm, 500);
                  }}>Discard</button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="save-panel-footer">
          <div className="privacy-badge">
            <CheckCircle2 size={12} />
            <span>AI powered classification and extraction</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveModal;
