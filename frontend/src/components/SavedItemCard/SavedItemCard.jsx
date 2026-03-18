import { Calendar, Trash2 } from 'lucide-react';
import './SavedItemCard.css';

const SavedItemCard = ({ item, onDelete }) => {
  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm("Delete this memory?")) {
      onDelete(item._id);
    }
  };

  return (
    <div className="saved-item-card glass fade-in">
      <button className="item-delete-btn" onClick={handleDelete} title="Delete memory">
        <Trash2 size={12} />
      </button>
      <div className="card-header">
        <span className="source-label">{item.source || item.type}</span>
      </div>

      <div className={`card-media ${!item.image ? 'no-image' : ''}`}>
        {item.image && (
          <img src={item.image} alt={item.title} className="card-image" decoding="async" loading="lazy" />
        )}
      </div>

      <div className="card-content">
        <h3 className="item-title">{item.title}</h3>
        <p className="item-summary">{item.summary}</p>
      </div>

      <div className="item-tags">
        {item.tags.map((tag, idx) => (
          <span key={idx} className="item-tag">#{tag}</span>
        ))}
      </div>
    </div>
  );
};

export default SavedItemCard;
