import { useState, useMemo } from 'react';

/**
 * useItemFilter - A specialized hook for managing the filtering of items 
 * in the user's library, accounting for active search results.
 * 
 * Why this exists:
 * Filtering logic can get messy when combined with search. By pulling this 
 * into a hook, we keep the UI components focused on "how things look" 
 * while this hook handles the "which things to show" math.
 */
const useItemFilter = (items, searchResults) => {
  const [activeFilter, setActiveFilter] = useState('All');

  /**
   * 🏗️ Dynamic Type Extraction:
   * Instead of hardcoding categories (like "Article", "Video"), we derive them 
   * directly from the data. This means if the user saves a new type of item 
   * (e.g., "Podcast"), the UI automatically supports a "Podcast" filter chip 
   * without a single line of code change.
   */
  const filters = useMemo(() => {
    const types = items ? [...new Set(items.map(item => item.type).filter(Boolean))] : [];
    // We normalize the names to Start-case for the UI.
    return ['All', ...types.map(t => t.charAt(0).toUpperCase() + t.slice(1))];
  }, [items]);

  /**
   * 🔍 Search vs. Local Filter Coordination:
   * If searchResults exist, they take priority as the "base list". 
   * This is because the user's intent to search overrides their general 
   * browse view.
   */
  const filteredItems = useMemo(() => {
    const baseItems = searchResults || items || [];
    
    // If 'All' is selected, we show everything in the current base list.
    if (activeFilter === 'All') return baseItems;

    // Otherwise, we filter by the selected type (case-insensitive for safety).
    return baseItems.filter(item => 
      item.type?.toLowerCase() === activeFilter.toLowerCase()
    );
  }, [items, searchResults, activeFilter]);

  return {
    activeFilter,
    setActiveFilter,
    filters,
    filteredItems
  };
};

export default useItemFilter;
