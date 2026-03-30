import { useState, useCallback } from "react";

/**
 * useSearch - Logic for managing search states
 * 
 * Why this exists: 
 * Home.jsx was getting cluttered with search results, queries, and error handling.
 * By isolating search logic here, we make it reusable and easier to test.
 * 
 * Handles:
 * - Real-time query updates
 * - API result synchronization 
 * - Error propagation from search services
 */
const useSearch = () => {
  const [searchResults, setSearchResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState(null);

  const handleSearchResults = useCallback((results, query, error) => {
    setSearchResults(results);
    setSearchQuery(query || "");
    setSearchError(error);
    
    if (error) {
      // In a production app, we might send this to Sentry or a logging service
      console.error(`[Search Engine Error] ${error}`);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults(null);
    setSearchQuery("");
    setSearchError(null);
  }, []);

  // We expose setSearchResults so parent components (like Home) 
  // can sync state when an item is deleted globally.
  return {
    searchResults,
    setSearchResults,
    searchQuery,
    setSearchQuery,
    searchError,
    handleSearchResults,
    clearSearch
  };
};

export default useSearch;
