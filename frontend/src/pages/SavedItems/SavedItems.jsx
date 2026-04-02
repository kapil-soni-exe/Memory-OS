import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import SavedItemCard from '../../modules/items/components/SavedItemCard/SavedItemCard';
import ItemDetailPanel from '../../modules/items/components/ItemDetailPanel/ItemDetailPanel';
import SaveModal from '../../modules/items/components/SaveModal/SaveModal';
import { useItemsQuery } from '../../modules/items/hooks/useItemsQuery';
import { useDeleteItem } from '../../modules/items/hooks/useItemMutation';
import { useSearchQuery } from '../../modules/items/hooks/useSearchQuery';
import { pageTransition } from '../../styles/animations';

import useItemFilter from '../../modules/items/hooks/useItemFilter';
import './SavedItems.css';

const SavedItems = () => {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: queryItems, isLoading: queryLoading, isError: queryError, error: qError } = useItemsQuery();
  
  const deleteMutation = useDeleteItem();

  const { data: searchResults, isLoading: isSearching } = useSearchQuery(searchQuery);
  
  // Adapt data for consumption
  const items = queryItems || [];
  const loading = queryLoading;
  const error = queryError ? qError : null;
  
  /**
   * 🧩 Hybrid Architecture - Logic Layer: 
   * Search results now come from TanStack Query (debounced & cached).
   * Filtering logic handles the "which things to show" math.
   */
  const { activeFilter, setActiveFilter, filters, filteredItems } = useItemFilter(items, searchResults);
  
  const handleRemoveItem = (id) => {
    if (window.confirm("Delete this memory forever?")) {
      deleteMutation.mutate(id);
    }
  };

  // Determine which empty state to show
  const getEmptyMessage = () => {
    if (searchQuery.trim().length > 0) {
      return `No results found for "${searchQuery}"`;
    }
    if (activeFilter !== 'All') {
      return `No ${activeFilter.toLowerCase()} items found.`;
    }
    return "No memories saved yet. Click the + button to add one!";
  };

  return (
    <motion.div 
      className="saved-items-content-wrapper"
      {...pageTransition}
    >
      <main className="saved-items-content">
        <header className="page-header">
          <h1 className="page-title">Saved Items</h1>
        </header>

        <section className="search-filter-controls">
          <div className="search-box-wrapper">
            <Search size={18} className={`search-icon ${isSearching ? 'animate-pulse' : ''}`} />
            <input 
              type="text" 
              placeholder="Search saved memories..." 
              className="saved-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="filter-chips-row">
            {filters.map((filter) => (
              <button 
                key={filter}
                className={`filter-chip ${activeFilter === filter ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        <div className="saved-items-grid">
          {loading ? (
            <div className="status-message">
              <p>Loading your memory library...</p>
            </div>
          ) : isSearching ? (
            <div className="status-message">
              <p>Searching through your memories...</p>
            </div>
          ) : error ? (
            <div className="status-message error">
              <p>⚠️ Failed to load memories: {error.message || "Unauthorized"}</p>
              <button onClick={() => window.location.reload()} className="retry-btn">Retry</button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="status-message">
              <p>{getEmptyMessage()}</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item._id} onClick={() => setSelectedItem(item)} className="card-clickable-wrapper">
                <SavedItemCard item={item} onDelete={handleRemoveItem} />
              </div>
            ))
          )}
        </div>
      </main>

      <ItemDetailPanel 
        item={selectedItem} 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        onDelete={handleRemoveItem}
      />

      <SaveModal 
        isOpen={isSaveModalOpen} 
        onClose={() => setIsSaveModalOpen(false)} 
      />
    </motion.div>
  );
};

export default SavedItems;
