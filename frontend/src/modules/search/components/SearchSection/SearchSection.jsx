import * as React from "react";
import { Search, Sparkles, SearchX } from "lucide-react";
import ItemCard from "../../../../components/common/ItemCard/ItemCard";

/**
 * SearchSection - Purely presentational component for search results
 * 
 * Why this is separate:
 * Search logic and its corresponding UI are highly coupled. 
 * Decoupling this from the Home page makes the Orchestrator cleaner 
 * and allows for focused styling and UX tweaks.
 */
const SearchSection = ({ 
  searchQuery, 
  searchResults, 
  searchError, 
  onClearSearch, 
  onItemClick, 
  onDeleteItem 
}) => {
  // Logic from original Home.jsx: Only show search results when we have 
  // both active results AND a query of at least 3 characters.
  if (!searchResults || !searchQuery || searchQuery.length < 3) return null;

  return (
    <div className="search-results-section fade-in">
      <div className="section-header">
        <h2 className="section-title">
          <Search size={18} />
          {searchQuery ? `Results for "${searchQuery}"` : "Search Results"}
          <span className="results-count">{searchResults.length}</span>
        </h2>
        <button
          className="view-all-link"
          onClick={onClearSearch}
          aria-label="Clear Search Results"
        >
          Clear Search
        </button>
      </div>

      {/* 
          Feature: Best Match 
          Always highlight the top result from our AI-ranked search results.
      */}
      {searchResults.length > 0 && (
        <div className="best-match-section glass">
          <div className="best-match-header">
            <Sparkles size={14} className="sparkle-icon" />
            <h3 className="best-match-label">Best Match</h3>
          </div>
          <div className="best-match-card-wrapper">
            <ItemCard
              item={searchResults[0]}
              onDelete={() => onDeleteItem(searchResults[0]._id)}
              onClick={() => onItemClick(searchResults[0])}
              className="featured-match-card"
            />
          </div>
        </div>
      )}

      {/* Error handling for the Search AI service */}
      {searchError && (
        <div className="search-empty-state error-state">
          <div className="empty-state-icon">
            <Sparkles size={32} className="error-sparkle" />
          </div>
          <h3>Oops! {searchError}</h3>
          <p>Voyage AI is cooling down. Please wait a moment.</p>
        </div>
      )}

      {/* Results grid */}
      <div className="recent-saves-grid">
        {searchResults.length <= 1 ? (
          // Edge Case: 0 results or only 1 (already shown in Best Match)
          searchResults.length === 0 && !searchError && (
            <div className="search-empty-state">
              <div className="empty-state-icon"><SearchX size={32} /></div>
              <h3>No results found</h3>
              <p>Try different keywords or tags</p>
            </div>
          )
        ) : (
          // All subsequent results
          searchResults.slice(1).map((item) => (
            <ItemCard
              key={item._id}
              item={item}
              onDelete={() => onDeleteItem(item._id)}
              onClick={() => onItemClick(item)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SearchSection;
