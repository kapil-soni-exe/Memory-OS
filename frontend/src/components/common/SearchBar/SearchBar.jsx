import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { searchItems } from "../../../features/items/services/search.api";
import "./SearchBar.css";

const SearchBar = ({ onSearchResults, items = [] }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const inputRef = useRef(null);
  const latestQueryRef = useRef(""); // 🔥 race condition fix
  const lastExecutedQueryRef = useRef(""); // 🚀 prevent duplicate calls

  // ⌘ + K shortcut
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

  // 🔍 Search logic with debounce + race condition fix
  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 3) {
      if (onSearchResults) onSearchResults([], trimmedQuery, null); // ✅ empty array, not null
      lastExecutedQueryRef.current = ""; // Reset on short query
      return;
    }

    // 🚀 Prevent duplicate API calls for same query
    if (trimmedQuery === lastExecutedQueryRef.current) {
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      latestQueryRef.current = trimmedQuery;



      try {
        const data = await searchItems(trimmedQuery);


        // ✅ Only update if latest query
        if (latestQueryRef.current === trimmedQuery) {
          lastExecutedQueryRef.current = trimmedQuery; // Mark as executed
          
          if (onSearchResults) {
            const results = Array.isArray(data?.results) ? data.results : [];
            onSearchResults(results, trimmedQuery, null);
          }
        }

      } catch (err) {
        console.error("Search failed:", err);
        const status = err.response?.status;
        const errorMsg = status === 429
          ? "Searching too fast! Wait 20s or upgrade."
          : "Search failed. Check your connection.";

        if (onSearchResults) {
          onSearchResults([], trimmedQuery, errorMsg);
        }
      } finally {
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);

  }, [query]);

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

        {/* 🏷️ Dynamic Tag Chips */}
        <div className="search-filters">
          {[...new Set(items.flatMap(item => item.tags || []))]
            .slice(0, 5)
            .map(tag => (
              <button
                key={tag}
                className="filter-chip"
                onClick={() => setQuery(prev => (prev ? prev + " " + tag : tag))}
              >
                #{tag}
              </button>
            ))}

          <button
            className="filter-chip"
            onClick={() => setQuery("@recent")}
          >
            @recent
          </button>
        </div>
      </div>
    </section>
  );
};

export default SearchBar;