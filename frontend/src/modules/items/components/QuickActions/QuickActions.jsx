import * as React from "react";
import { BookOpen, FileText, Link as LinkIcon } from "lucide-react";

/**
 * QuickActions - Primary interaction entry points for saving content
 * 
 * Why this is separate:
 * This component handles the UI for all entry-point interactions. 
 * Decoupling this allows for easy future expansion (e.g., adding "Save PDF", 
 * or "Scan Document") without bloating the Home page logic.
 */
const QuickActions = ({ onSaveClick }) => {
  return (
    <section className="quick-actions-section">
      <div className="quick-actions-grid">
        {/* Save Article Handler */}
        <button className="quick-action-card" onClick={onSaveClick}>
          <div className="action-icon article"><BookOpen size={24} /></div>
          <div className="action-info">
            <h3>Save Article</h3>
            <p>Read later</p>
          </div>
        </button>

        {/* Save Note Handler */}
        <button className="quick-action-card" onClick={onSaveClick}>
          <div className="action-icon note"><FileText size={24} /></div>
          <div className="action-info">
            <h3>Save Note</h3>
            <p>Capture thoughts</p>
          </div>
        </button>

        {/* Paste Link Handler */}
        <button className="quick-action-card" onClick={onSaveClick}>
          <div className="action-icon link"><LinkIcon size={24} /></div>
          <div className="action-info">
            <h3>Paste Link</h3>
            <p>Quick save</p>
          </div>
        </button>
      </div>
    </section>
  );
};

export default QuickActions;
