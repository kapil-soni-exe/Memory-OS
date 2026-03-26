import { Calendar, Clock, Trash2 } from 'lucide-react';
import './ItemCard.css';

const ItemCard = ({ item, onDelete, onClick }) => {
  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm("Delete this memory?")) {
      onDelete(item._id);
    }
  };

  return (
    <div className="item-card glass fade-in" onClick={onClick}>
      <button className="item-delete-btn" onClick={handleDelete} title="Delete memory">
        <Trash2 size={12} />
      </button>
      <div className="item-card-header">
        <span className="source-label">{item.source || item.type}</span>
      </div>

      <div className={`item-card-media ${!item.image ? 'no-image' : ''}`}>
        {item.image && (
          <img src={item.image} alt={item.title} className="item-image" decoding="async" loading="lazy" />
        )}
      </div>

      <div className="item-card-content">
        <h3 className="item-title">{item.title}</h3>
        {item.matchReason && (
          <div className="match-reason">
            {item.matchReason}
          </div>
        )}
        {item.processingStatus === 'completed' || item.summary ? (
          <p className="item-summary">{item.summary}</p>
        ) : item.processingStatus === 'failed' ? (
          <p className="item-summary error">AI processing failed.</p>
        ) : (
          <p className="item-summary processing animate-pulse">AI is analyzing...</p>
        )}
      </div>

      <div className="item-tags">
        {(item.tags && item.tags.length > 0) ? (
          item.tags.map((tag, idx) => (
            <span key={idx} className="item-tag">#{tag}</span>
          ))
        ) : (item.processingStatus === 'pending' || item.processingStatus === 'processing') ? (
          <span className="item-tag processing">Analyzing...</span>
        ) : null}
      </div>

      <div className="item-card-footer">
        <div className="item-date">
          <Calendar size={10} />
          <span>{new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
