import React, { useState } from 'react';
import { Search } from 'lucide-react';
import Sidebar from '../../layouts/Sidebar/Sidebar';
import Topbar from '../../layouts/Topbar/Topbar';
import SavedItemCard from '../../features/items/components/SavedItemCard/SavedItemCard';
import ItemDetailPanel from '../../features/items/components/ItemDetailPanel/ItemDetailPanel';
import SaveModal from '../../features/items/components/SaveModal/SaveModal';
import useItems from '../../features/items/hooks/useItems';
import MobileNav from '../../layouts/MobileNav/MobileNav';
import './SavedItems.css';

const SavedItems = () => {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const { items, loading, error, addItem, removeItem } = useItems();
  const [isSearching, setIsSearching] = useState(false);

  // Sync deletion with search results
  const handleRemoveItem = async (id) => {
    try {
      await removeItem(id);
      if (searchResults) {
        setSearchResults(prev => prev ? prev.filter(item => item._id !== id) : null);
      }
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  };

  // Debounced Search Logic
  React.useEffect(() => {
    if (searchQuery.trim().length > 2) {
      const delayDebounceFn = setTimeout(async () => {
        setIsSearching(true);
        try {
          const { searchItems } = await import('../../features/items/services/search.api');
          const results = await searchItems(searchQuery);
          setSearchResults(results.results);
        } catch (err) {
          console.error("Search failed:", err);
        } finally {
          setIsSearching(false);
        }
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults(null);
    }
  }, [searchQuery]);

  // Dynamically derive filters from existing types
  const types = items ? [...new Set(items.map(item => item.type).filter(Boolean))] : [];
  const filters = ['All', ...types.map(t => t.charAt(0).toUpperCase() + t.slice(1))];

  // Combine Search and Filter
  const baseItems = searchResults || items || [];
  const filteredItems = activeFilter === 'All' 
    ? baseItems 
    : baseItems.filter(item => item.type?.toLowerCase() === activeFilter.toLowerCase());

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
    <div className="saved-items-layout">
      <Sidebar />
      
      <div className="saved-items-main">
        <Topbar onSaveClick={() => setIsSaveModalOpen(true)} />
        
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
      </div>

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
    </div>
  );
};

export default SavedItems;
