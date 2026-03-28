import * as React from "react";
import { BookOpen, FileText, Link as LinkIcon } from "lucide-react";

/**
 * QuickActionsSection - Entry point for saving new knowledge
 * 
 * Why this is a section:
 * This component manages the visual layout of action triggers. 
 * It coordinates interaction with the global Save Modal through callbacks.
 */
const QuickActionsSection = ({ onSaveClick }) => {
  return (
    <section className="quick-actions-section">
      <div className="quick-actions-grid">
        {/* Save Article Action */}
        <button className="quick-action-card" onClick={onSaveClick}>
          <div className="action-icon article"><BookOpen size={24} /></div>
          <div className="action-info">
            <h3>Save Article</h3>
            <p>Read later</p>
          </div>
        </button>

        {/* Save Note Action */}
        <button className="quick-action-card" onClick={onSaveClick}>
          <div className="action-icon note"><FileText size={24} /></div>
          <div className="action-info">
            <h3>Save Note</h3>
            <p>Capture thoughts</p>
          </div>
        </button>

        {/* Paste Link Action */}
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

export default QuickActionsSection;
