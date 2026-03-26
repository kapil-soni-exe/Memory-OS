import { ChevronRight, Brain, Trash2 } from 'lucide-react';
import './TopicCard.css';

const TopicCard = ({ topic, onClick, onDelete }) => {
  const Icon = topic.icon || Brain;

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${topic.topicName || topic.name}" topic and all its contents?`)) {
      onDelete(topic._id);
    }
  };
  
  return (
    <div className="topic-card glass" onClick={onClick}>
      <button className="topic-delete-btn" onClick={handleDelete} title="Delete Topic">
        <Trash2 size={14} />
      </button>
      <div className="topic-card-body">
        <div className="topic-icon-wrapper">
          <Icon size={24} />
        </div>
        
        <div className="topic-content">
          <h3 className="topic-name">{topic.topicName || topic.name}</h3>
          <p className="topic-item-count">{topic.itemCount || topic.count} memories</p>
        </div>

        <div className="topic-preview-tags">
          {topic.keywords && topic.keywords.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="preview-tag">#{tag}</span>
          ))}
          {topic.keywords && topic.keywords.length > 3 && (
            <span className="preview-tag-more">+{topic.keywords.length - 3}</span>
          )}
        </div>
      </div>

      <div className="topic-card-footer">
        <span className="explore-text">Explore Topic</span>
        <ChevronRight size={16} />
      </div>
    </div>
  );
};

export default TopicCard;
