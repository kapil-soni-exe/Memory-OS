import React, { useRef } from 'react';
import { Sparkles, Loader2, Paperclip, X } from 'lucide-react';
import './SaveForm.css';

const SaveForm = ({ onSubmit, isLoading, formData, setFormData }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, file });
    }
  };

  const removeFile = () => {
    setFormData({ ...formData, file: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <form onSubmit={onSubmit} className="save-form">
      <div className="form-group fade-in">
        <label className="form-label">Nexus Capture</label>
        <div className="form-input-wrapper textarea-wrapper">
          <Sparkles className="input-icon" size={18} />
          <textarea 
            placeholder="Paste a link, or type a thought... AI will handle the rest." 
            className="form-textarea magic-input"
            required={!formData.file}
            value={formData.input || ''}
            onChange={(e) => setFormData({ ...formData, input: e.target.value })}
            disabled={isLoading}
          ></textarea>
        </div>
        
        <div 
          className={`file-upload-section ${formData.file ? 'has-file' : ''}`}
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('dragging'); }}
          onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('dragging'); }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove('dragging');
            const file = e.dataTransfer.files[0];
            if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
              setFormData({ ...formData, file });
            }
          }}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept="image/*,application/pdf"
          />
          
          {!formData.file ? (
            <div 
              className="upload-dropzone"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-icon-wrapper">
                <Paperclip size={24} />
              </div>
              <div className="upload-text-group">
                <span className="upload-main-text">Upload Image or PDF</span>
                <span className="upload-sub-text">or drag and drop here</span>
              </div>
            </div>
          ) : (
            <div className="selected-file-card">
              <div className="file-info-header">
                <Paperclip size={18} />
                <span className="file-name">{formData.file.name}</span>
                <button type="button" className="remove-file-btn" onClick={removeFile}>
                  <X size={16} />
                </button>
              </div>
              <div className="file-status-tag">Ready for Nexus extraction</div>
            </div>
          )}
        </div>

        <p className="form-help">Pasting a URL? Writing a goal? Or just upload a file for AI extraction.</p>
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
