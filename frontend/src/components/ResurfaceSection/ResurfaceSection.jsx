import React from 'react';
import { Sparkles, Calendar, RotateCcw } from 'lucide-react';
import ItemCard from '../ItemCard/ItemCard';
import './ResurfaceSection.css';

const ResurfaceSection = ({ items, loading, onItemClick, onDelete }) => {
  if (loading) {
    return (
      <div className="resurface-section loading">
        <div className="resurface-loader"></div>
      </div>
    );
  }

  if (!items || items.length === 0) return null;

  return (
    <section className="resurface-section fade-in">
      <div className="section-header">
        <div className="header-title-area">
          <div className="header-icon-box">
             <Calendar size={18} className="time-capsule-icon" />
          </div>
          <h2 className="section-title">Time Capsule</h2>
          <span className="resurface-tag">
            <Sparkles size={12} />
            On this day
          </span>
        </div>
      </div>

      <div className="resurface-grid">
        {items.map((item) => (
          <div key={item._id} className="resurface-card-wrapper">
             <ItemCard 
               item={item}
               onClick={() => onItemClick(item)}
               onDelete={() => onDelete(item._id)}
             />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ResurfaceSection;
