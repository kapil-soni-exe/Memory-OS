import React, { useRef } from 'react';
import { useSourcesQuery } from '../../../../modules/composer/hooks/useSourcesQuery';
import { Book, FileText, Link as LinkIcon, Info, CheckSquare, Square } from 'lucide-react';
import './SourceSidebar.css';

const SourceSidebar = ({ 
  prompt,
  activeSourceId, 
  setActiveSourceId, 
  onSourceClick,
  selectedSourceIds = [],
  onToggleSource
}) => {
  const sidebarRef = useRef(null);

  // Modular Composer Hook
  const { data: sources = [], isLoading } = useSourcesQuery(prompt);

  React.useEffect(() => {
    if (activeSourceId && sidebarRef.current) {
      const activeCard = sidebarRef.current.querySelector(`.source-card[data-id="${activeSourceId}"]`);
      if (activeCard) {
        activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeSourceId]);

  return (
    <div className="source-sidebar" ref={sidebarRef}>
      <div className="sidebar-header">
        <div className="title-group">
          <h3 className="sidebar-title">Memory Sources</h3>
          <span className="source-count">{sources.length} items found</span>
        </div>
        <Info size={14} className="info-icon" title="Select the memories you want the AI to synthesize." />
      </div>

      <div className="source-list">
        {isLoading ? (
          <div className="source-loading-state">
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
          </div>
        ) : sources.length > 0 ? (
          sources.map((source, index) => {
            const isActive = activeSourceId === source.id;
            const isSelected = selectedSourceIds.includes(source.itemId);
            
            return (
              <div 
                key={source.id} 
                data-id={source.id}
                className={`source-card glass animate-in ${isActive ? 'active-card' : ''} ${isSelected ? 'selected' : ''}`} 
                style={{ animationDelay: `${index * 0.1}s` }}
                onMouseEnter={() => setActiveSourceId(source.id)}
                onMouseLeave={() => setActiveSourceId(null)}
              >
                <div className="source-selection-overlay" onClick={() => onToggleSource(source.itemId)}>
                   {isSelected ? <CheckSquare size={16} className="check-icon selected" /> : <Square size={16} className="check-icon" />}
                </div>

                <div className="source-badge">[{source.id}]</div>
                <div className="source-body" onClick={() => onSourceClick({ _id: source.itemId, title: source.title, content: source.text, type: source.source })}>
                  <div className="source-type">
                    {source.source === 'saved docs' ? <Book size={12} /> : 
                     source.source === 'blog post' ? <LinkIcon size={12} /> : 
                     <FileText size={12} />}
                    <span>{source.source}</span>
                  </div>
                  <h4 className="source-card-title">{source.title}</h4>
                  <p className="source-preview">{source.text}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="source-empty-state">
            <p>No sources analyzed yet.</p>
          </div>
        )}
      </div>
      
      {sources.length > 0 && !isLoading && (
        <div className="sidebar-footer">
          <p>This draft is 100% synthesized from your saved knowledge.</p>
        </div>
      )}
    </div>
  );
};

export default SourceSidebar;
