import * as React from "react";
import { Search, Sparkles, SearchX } from "lucide-react";
import ItemCard from "../../../components/common/ItemCard/ItemCard";
import { useSearchQuery } from "../../../modules/items/hooks/useSearchQuery";
import { useDeleteItem } from "../../../modules/items/hooks/useItemMutation";

/**
 * SearchSection - Composition layer for knowledge discovery results
 */
const SearchSection = ({ searchProps, onItemClick }) => {
  const { searchQuery, clearSearch } = searchProps;

  // Step 3: USE QUERY
  const { data: searchResults = [], isLoading, error } = useSearchQuery(searchQuery);
  const deleteMutation = useDeleteItem();

  // Visibility logic
  const isSearchActive = searchQuery && searchQuery.length >= 3;

  if (isLoading && isSearchActive) return <div className="search-loading">Searching Knowledge Galaxy...</div>;
  if (!isSearchActive || !searchResults) return null;

  return (
    <div className="search-results-section fade-in">
      <div className="section-header">
        <h2 className="section-title">
          <Search size={18} />
          {searchQuery ? `Results for "${searchQuery}"` : "Search Results"}
          <span className="results-count">{searchResults.length}</span>
        </h2>
        <button className="view-all-link" onClick={clearSearch}>
          Clear Search
        </button>
      </div>

      {/* AI-powered Best Match highlight */}
      {searchResults.length > 0 && (
        <div className="best-match-section glass">
          <div className="best-match-header">
            <Sparkles size={14} className="sparkle-icon" />
            <h3 className="best-match-label">Best Match</h3>
          </div>
          <div className="best-match-card-wrapper">
            <ItemCard
              item={searchResults[0]}
              onDelete={() => deleteMutation.mutate(searchResults[0]._id)}
              onClick={() => onItemClick(searchResults[0])}
              className="featured-match-card"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="search-empty-state error-state">
          <div className="empty-state-icon"><Sparkles size={32} /></div>
          <h3>Oops! {error.message || "Search failed"}</h3>
          <p>Voyage AI is cooling down. Please wait a moment.</p>
        </div>
      )}

      <div className="recent-saves-grid">
        {searchResults.length <= 1 ? (
          searchResults.length === 0 && !error && (
            <div className="search-empty-state">
              <div className="empty-state-icon"><SearchX size={32} /></div>
              <h3>No results found</h3>
              <p>Try different keywords or tags</p>
            </div>
          )
        ) : (
          searchResults.slice(1).map((item) => (
            <ItemCard
              key={item._id}
              item={item}
              onDelete={() => deleteMutation.mutate(item._id)}
              onClick={() => onItemClick(item)}
            />
          ))
        )}
      </div>
    </div>
  );
};


export default SearchSection;
