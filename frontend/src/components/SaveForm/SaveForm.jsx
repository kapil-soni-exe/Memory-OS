import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import './SaveForm.css';

const SaveForm = ({ onSubmit, isLoading, formData, setFormData }) => {
  return (
    <form onSubmit={onSubmit} className="save-form">
      <div className="form-group fade-in">
        <label className="form-label">Nexus Capture</label>
        <div className="form-input-wrapper textarea-wrapper">
          <Sparkles className="input-icon" size={18} />
          <textarea 
            placeholder="Paste a link, or type a thought... AI will handle the rest." 
            className="form-textarea magic-input"
            required
            value={formData.input || ''}
            onChange={(e) => setFormData({ ...formData, input: e.target.value })}
            disabled={isLoading}
          ></textarea>
        </div>
        <p className="form-help">Pasting a URL? Writing a goal? Just type it here.</p>
      </div>

      <button 
        type="submit" 
        className={`save-submit-btn ${isLoading ? 'loading' : ''}`}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            <span>Analyzing Galaxy...</span>
          </>
        ) : (
          <>
            <Sparkles size={18} />
            <span>Capture to MemoryOS</span>
          </>
        )}
      </button>
    </form>
  );
};

export default SaveForm;
