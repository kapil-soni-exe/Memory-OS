import { useState, useEffect } from 'react';

/**
 * useItemSearch - A specialized hook for searching through the user's saved items.
 * 
 * Why this exists:
 * We want to keep the SavedItems page focused on layout and composition. 
 * This hook handles the "noisy" parts of searching: debouncing, dynamic 
 * API imports, and error states.
 * 
 * Why NOT use the global useSearch?
 * useSearch is a broader, multi-module search (like the top-bar search). 
 * This hook is scoped specifically to the 'SavedItems' page library context.
 */
const useItemSearch = (searchQuery) => {
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // We only trigger search if the user has typed at least 3 characters.
    // This prevents firing unnecessary requests for very short/common queries.
    if (searchQuery.trim().length > 2) {
      
      /**
       * ⚡ Why Debounce?
       * If we fired an API call for every keystroke, we'd hammer the backend.
       * 300ms is the "sweet spot" where the UI feels responsive but doesn't 
       * trigger until the user has briefly paused their typing.
       */
      const delayDebounceFn = setTimeout(async () => {
        setIsSearching(true);
        try {
          /**
           * 📦 Why Dynamic Import?
           * We only load the search API logic when the user actually starts searching.
           * This keeps the initial page bundle smaller and faster.
           */
          const { searchItems } = await import('../services/search.api');
          const results = await searchItems(searchQuery);
          
          setSearchResults(results.results);
        } catch (err) {
          // Senior Note: In a real prod app, we'd likely pipe this to a 
          // dedicated error tracking service (like Sentry).
          console.error("Search failed:", err);
        } finally {
          setIsSearching(false);
        }
      }, 300);

      // We return a cleanup function to cancel the timeout if the user 
      // types again before the 300ms is up.
      return () => clearTimeout(delayDebounceFn);
    } else {
      // If the query is too short or empty, we clear the results.
      setSearchResults(null);
    }
  }, [searchQuery]);

  return {
    searchResults,
    isSearching,
    setSearchResults // Exposed so the parent can sync UI (e.g. after a delete)
  };
};

export default useItemSearch;
