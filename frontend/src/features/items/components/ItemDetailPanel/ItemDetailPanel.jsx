import { X, ExternalLink, Calendar, Hash, Share2, Trash2, ArrowRight, Network } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getItemById, interactWithItem } from '../../services/item.api';
import './ItemDetailPanel.css';

const ItemDetailPanel = ({ item: initialItem, isOpen, onClose, onDelete }) => {
  const [item, setItem] = useState(initialItem);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (initialItem && isOpen) {
      setItem(initialItem);
      fetchFullDetails(initialItem._id);
    }
  }, [initialItem, isOpen]);

  const fetchFullDetails = async (id) => {
    try {
      setLoading(true);
      const data = await getItemById(id);
      setItem(data);
      // Log interaction for the resurfacing scoring engine
      await interactWithItem(id, "view").catch(console.error);
    } catch (error) {
      console.error("Failed to fetch item details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!initialItem) return null;

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this memory? It will be removed from your galaxy and semantic search forever.")) {
      onDelete(item._id);
      onClose();
    }
  };

  const handleRelatedClick = (relatedItem) => {
    setItem(relatedItem);
    fetchFullDetails(relatedItem._id);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.summary,
          url: item.url || window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(item.url || window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleOpenSource = () => {
    if (item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    } else {
      alert("No source URL available for this memory.");
    }
  };

  const handleShowInGraph = () => {
    // Navigate to graph page with the item ID to highlight it
    // Assuming KnowledgeGraphPage handles ?highlight=id or similar
    onClose();
    navigate(`/graph?highlight=${item._id}`);
  };

  return (
    <div className={`detail-panel-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <aside className={`item-detail-panel ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
          <div className="panel-actions">
            <button className="action-btn-circle danger" onClick={handleDelete} title="Delete memory">
              <Trash2 size={18} />
            </button>
            <button className="action-btn-circle" onClick={handleShowInGraph} title="Show in Knowledge Galaxy">
              <Network size={18} />
            </button>
            <button className="action-btn-circle" onClick={handleShare} title="Share memory">
              <Share2 size={18} />
            </button>
            <button className="action-btn-primary" onClick={handleOpenSource}>
              <ExternalLink size={16} />
              <span>Open Source</span>
            </button>
          </div>
        </div>

        <div className="panel-content">
          {loading && <div className="panel-loader">Updating intelligence...</div>}
          
          <div className="panel-meta">
            <span className="source-badge">{item?.source || item?.type}</span>
            <div className="meta-row">
              <div className="meta-item">
                <Calendar size={14} />
                <span>{item ? new Date(item.createdAt).toLocaleDateString() : ''}</span>
              </div>
              <div className="meta-item">
                <Hash size={14} />
                <span>{item?.type || 'Article'}</span>
              </div>
            </div>
          </div>

          <h1 className="panel-title">{item?.title}</h1>

          {/* Video Player Section */}
          {item?.type === 'video' && item?.url && (
            <div className="panel-video-container">
              {(() => {
                const getYoutubeId = (url) => {
                  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                  const match = url.match(regExp);
                  return (match && match[2].length === 11) ? match[2] : null;
                };
                const videoId = getYoutubeId(item.url);
                
                if (!videoId) return <p className="panel-error">Invalid YouTube URL</p>;
                
                return (
                  <iframe
                    id="panel-youtube-player"
                    width="100%"
                    height="225"
                    src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                );
              })()}
            </div>
          )}

          <div className="panel-section">
            <h3 className="section-label">AI Nuggets</h3>
            <div className="panel-nuggets">
              {item?.nuggets?.map((nugget, idx) => (
                <div key={idx} className="panel-nugget-card">
                  <div className="nugget-badge-group">
                    <span className="nugget-category">{nugget.category}</span>
                  </div>
                  <p className="nugget-text">"{nugget.text}"</p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel-section">
            <h3 className="section-label">Summary</h3>
            {item?.processingStatus === 'completed' || item?.summary ? (
              <p className="panel-summary">{item?.summary}</p>
            ) : item?.processingStatus === 'failed' ? (
              <p className="panel-summary error">Failed to generate AI summary.</p>
            ) : (
              <p className="panel-summary processing animate-pulse">Generating AI insight...</p>
            )}
          </div>

          <div className="panel-section">
            <h3 className="section-label">Tags</h3>
            <div className="panel-tags">
              {(item?.tags && item?.tags?.length > 0) ? (
                item?.tags?.map((tag, idx) => (
                  <span key={idx} className="panel-tag">#{tag}</span>
                ))
              ) : (item?.processingStatus === 'pending' || item?.processingStatus === 'processing') ? (
                <span className="panel-tag processing">Analyzing...</span>
              ) : null}
            </div>
          </div>

          {/* Related Items Section */}
          {item?.relatedItems && item.relatedItems.length > 0 && typeof item.relatedItems[0] === 'object' && (
            <div className="panel-section">
              <h3 className="section-label">Related Memories</h3>
              <div className="related-items-list">
                {item.relatedItems.map((related) => (
                  <div 
                    key={related._id} 
                    className="related-item-card"
                    onClick={() => handleRelatedClick(related)}
                  >
                    <div className="related-item-info">
                      <span className="related-item-type">{related.type}</span>
                      <h4 className="related-item-title">{related.title}</h4>
                    </div>
                    <ArrowRight size={16} className="related-arrow" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="panel-section info-box">
            <div className="info-row">
              <strong>Added on:</strong>
              <span>{item ? new Date(item.createdAt).toLocaleString() : ''}</span>
            </div>
            <div className="info-row">
              <strong>URL:</strong>
              <span className="truncate">
                {item?.url ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.url}
                  </a>
                ) : (
                  'No source URL'
                )}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default ItemDetailPanel;
