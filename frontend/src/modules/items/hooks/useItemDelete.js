import { useCallback } from 'react';

/**
 * useItemDelete - A hook to manage the synchronization between global state 
 * deletions and local UI snapshots (like search results).
 * 
 * Why this exists:
 * In React, searching often creates a "snapshot" of data. If a user deletes 
 * an item while viewing search results, the global state updates, but the 
 * local search results might still show the stale item. 
 * This hook ensures they stay in sync.
 */
const useItemDelete = (removeItem, searchResults, setSearchResults) => {
  
  /**
   * handleRemoveItem
   * 
   * Transition: 
   * 1. Trigger global deletion (API + Global Store)
   * 2. If we are currently in a search view, manually "snip" the deleted 
   *    item from the results array.
   * 
   * Why manual sync?
   * If we don't do this, the item will disappear from the "All" view but 
   * PERSIST in the search results until the user types a new query. 
   * That feels broken to the user.
   */
  const handleRemoveItem = useCallback(async (id) => {
    try {
      // Step 1: Global removal
      await removeItem(id);

      // Step 2: Local search result coordination
      if (searchResults) {
        /**
         * Edge Case: Search Active vs Not Active
         * We only need to filter if searchResults is currently populated.
         * If it's null, the 'useItemFilter' hook is already using the 
         * global 'items' array, which is already up-to-date.
         */
        setSearchResults(prev => prev ? prev.filter(item => item._id !== id) : null);
      }
    } catch (err) {
      // Senior Note: Always log the error details, but consider 
      // adding a Toast notification here for better UX.
      console.error("Failed to remove item:", err);
      throw err; // Propagate so the caller can handle UI feedback if needed
    }
  }, [removeItem, searchResults, setSearchResults]);

  return { handleRemoveItem };
};

export default useItemDelete;
