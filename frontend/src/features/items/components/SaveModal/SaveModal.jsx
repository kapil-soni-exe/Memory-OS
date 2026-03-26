import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2, Search, Brain, Zap, Check } from 'lucide-react';
import SaveForm from '../SaveForm/SaveForm';
import useItems from '../../hooks/useItems';
import './SaveModal.css';

const SaveModal = ({ isOpen, onClose }) => {
  const [view, setView] = useState('input'); // input, processing, review
  const [formData, setFormData] = useState({ input: '' });
  const [processStep, setProcessStep] = useState(0);
  const [savedItem, setSavedItem] = useState(null);
  
  const { addItem, editItem } = useItems();

  const steps = [
    { icon: Search, text: "Nexus is thinking..." },
    { icon: Brain, text: "Classifying your knowledge..." },
    { icon: Zap, text: "Organizing in your galaxy..." }
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
    setSavedItem(null);
  };

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    if (!formData.input && !formData.file) return;
    
    setView('processing');
    try {
      let submitData;
      if (formData.file) {
        submitData = new FormData();
        submitData.append('file', formData.file);
        if (formData.input) submitData.append('input', formData.input);
      } else {
        submitData = formData;
      }

      const item = await addItem(submitData);
      setSavedItem(item);
      // Give time for the animation to look natural
      setTimeout(() => setView('review'), 1000);
    } catch (err) {
      console.error("Save failed:", err);
      setView('input');
      setProcessStep(0);
    }
  };

  const handleRefine = async (e) => {
    e.preventDefault();
    try {
      await editItem(savedItem._id, {
        title: savedItem.title,
        type: savedItem.type
      });
      onClose();
      setTimeout(resetForm, 500);
    } catch (err) {
      console.error("Refinement failed:", err);
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
                {view === 'review' ? 'Review Knowledge' : 'New Knowledge'}
              </h2>
            </div>
            <button className="panel-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          <p className="panel-subtitle">
            {view === 'review' ? 'AI has organized your discovery. Adjust if needed.' : 'Capture information and let AI organize it.'}
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
                <h3 className="processing-title">Nexus is working</h3>
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

          {view === 'review' && savedItem && (
            <div className="refinement-view">
              <div className="refinement-header">
                <div className="success-icon-wrapper">
                  <Check size={32} />
                </div>
                <h3 className="refinement-title">Knowledge Captured</h3>
              </div>

              <form className="refinement-form" onSubmit={handleRefine}>
                <div className="form-field">
                  <label>Title</label>
                  <input 
                    type="text" 
                    className="refinement-input"
                    value={savedItem.title}
                    onChange={(e) => setSavedItem({...savedItem, title: e.target.value})}
                  />
                </div>

                <div className="form-field">
                  <label>Type</label>
                  <select 
                    className="refinement-select"
                    value={savedItem.type}
                    onChange={(e) => setSavedItem({...savedItem, type: e.target.value})}
                  >
                    {["article", "video", "tweet", "pdf", "image", "note", "thought", "book", "task", "quote", "code"].map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div className="refinement-footer">
                  <button type="submit" className="refine-btn">Organize in Galaxy</button>
                  <button type="button" className="cancel-btn" onClick={onClose}>Discard</button>
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
