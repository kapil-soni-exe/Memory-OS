import React, { useState } from 'react';
import { Search } from 'lucide-react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import SavedItemCard from '../../components/SavedItemCard/SavedItemCard';
import ItemDetailPanel from '../../components/ItemDetailPanel/ItemDetailPanel';
import SaveModal from '../../components/SaveModal/SaveModal';
import useItems from '../../hooks/useItems';
import './SavedItems.css';

const SavedItems = () => {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const { items, loading, error, addItem, removeItem } = useItems();

  // Debounced Search Logic
  React.useEffect(() => {
    if (searchQuery.trim().length > 2) {
      const delayDebounceFn = setTimeout(async () => {
        setIsSearching(true);
        try {
          const { searchItems } = await import('../../services/search.api');
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
  const baseItems = searchResults || items;
  const filteredItems = activeFilter === 'All' 
    ? baseItems 
    : baseItems.filter(item => item.type?.toLowerCase() === activeFilter.toLowerCase());

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
              <p>Loading items...</p>
            ) : filteredItems.length === 0 ? (
              <p>No items found.</p>
            ) : (
              filteredItems.map((item) => (
                <div key={item._id} onClick={() => setSelectedItem(item)} className="card-clickable-wrapper">
                  <SavedItemCard item={item} onDelete={removeItem} />
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
        onDelete={removeItem}
      />

      <SaveModal 
        isOpen={isSaveModalOpen} 
        onClose={() => setIsSaveModalOpen(false)} 
      />
    </div>
  );
};

export default SavedItems;
