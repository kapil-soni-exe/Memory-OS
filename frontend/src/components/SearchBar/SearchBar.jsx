import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { searchItems } from "../../services/search.api";
import "./SearchBar.css";

const SearchBar = ({ onSearchResults, items = [] }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleShortcut = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    if (query.trim().length > 2) {
      const delayDebounceFn = setTimeout(async () => {
        setLoading(true);
        try {
          const results = await searchItems(query);
          if (onSearchResults) onSearchResults(results);
        } catch (err) {
          console.error("Search failed:", err);
        } finally {
          setLoading(false);
        }
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    } else {
      if (onSearchResults) onSearchResults(null);
    }
  }, [query, onSearchResults]);

  const handleSearch = (e) => {
    setQuery(e.target.value);
  };

  return (
    <section className="search-section">
      <div className="search-container">
        <h1 className="search-title">Search Your Memory</h1>
        <div className="search-bar-inner">
          {loading ? (
            <Loader2 className="search-icon-large animate-spin" size={22} />
          ) : (
            <Search className="search-icon-large" size={22} />
          )}
          <input
            ref={inputRef}
            type="text"
            placeholder="Search documents, tweets, articles..."
            className="main-search-input"
            value={query}
            onChange={handleSearch}
          />
          <div className="search-hint">
            <kbd>⌘</kbd> + <kbd>K</kbd>
          </div>
        </div>

        {/* Dynamic Tag Chips */}
        <div className="search-filters">
          {[...new Set(items.flatMap(item => item.tags || []))].slice(0, 5).map(tag => (
            <button 
              key={tag} 
              className="filter-chip"
              onClick={() => setQuery(`#${tag}`)}
            >
              #{tag}
            </button>
          ))}
          <button className="filter-chip" onClick={() => setQuery("@recent")}>@recent</button>
        </div>
      </div>
    </section>
  );
};

export default SearchBar;