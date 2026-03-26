import * as React from "react";
import { useState } from "react";
import { BookOpen, FileText, Link as LinkIcon, Brain, Search, Sparkles, SearchX } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../layouts/Sidebar/Sidebar";
import Topbar from "../../layouts/Topbar/Topbar";
import SearchBar from "../../components/common/SearchBar/SearchBar";
import ItemCard from "../../components/common/ItemCard/ItemCard";
import SaveModal from "../../features/items/components/SaveModal/SaveModal";
import ItemDetailPanel from "../../features/items/components/ItemDetailPanel/ItemDetailPanel";

import useItems from "../../features/items/hooks/useItems";
import useResurface from "../../features/resurface/hooks/useResurface";
import { interactWithItem } from "../../features/items/services/item.api";
import ResurfaceSection from "../../features/resurface/components/ResurfaceSection/ResurfaceSection";
import NexusChat from "../../features/nexus/components/NexusChat/NexusChat";
import NuggetStory from "../../features/nuggets/components/NuggetStory/NuggetStory";

import "./Home.css";

const Home = () => {

const navigate = useNavigate();
const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

const { items: allItems, loading, addItem, removeItem } = useItems();
const { items: resurfaceItems, loading: resurfaceLoading, removeItem: removeResurfaceItem } = useResurface();

const [searchResults, setSearchResults] = useState(null);
const [searchQuery, setSearchQuery] = useState("");
const [searchError, setSearchError] = useState(null);
const [selectedItem, setSelectedItem] = useState(null);
const [isNexusOpen, setIsNexusOpen] = useState(false);

const handleResurfaceDelete = async (id) => {
  await removeItem(id); // Global DB delete
  removeResurfaceItem(id); // Local resurface state update
  // ✅ Sync Search Results: Remove deleted item from active search
  if (searchResults) {
    setSearchResults(prev => prev.filter(item => item._id !== id));
  }
};

const handleResurfaceLike = (id) => {
  interactWithItem(id, "like").catch(console.error);
};

const handleResurfaceSkip = (id) => {
  interactWithItem(id, "skip").catch(console.error);
  removeResurfaceItem(id); // Remove from local UI immediately
};

// 1. Correct data handling: searchResults is already an array
const displayItems = Array.isArray(searchResults) 
  ? searchResults 
  : (Array.isArray(allItems) ? allItems : []);

const handleSearchResults = (results, query, error) => {

  setSearchResults(results);
  setSearchQuery(query || "");
  setSearchError(error);
  
  if (error) console.error(`[UI Search Error] ${error}`);

};

  return (
    <div className="home-layout">
      <Sidebar />

      <div className="home-main">
        <Topbar onSaveClick={() => setIsSaveModalOpen(true)} />

        <main className="home-content">
          <div className="main-feed-container">
            {/* Search */}
            <SearchBar onSearchResults={handleSearchResults} items={allItems} />

            {/* Neural Stories (MemoryOS Feed) */}
            <section className="stories-section fade-in">
              <div className="section-header stories-header">
                <div className="ai-badge-pill">
                  <Sparkles size={12} />
                  <span>AI Generated Feed</span>
                </div>
                <h2 className="section-title premium-title">
                  Neural Stories
                </h2>
                <p className="section-subtitle">Distilling your recent memories into bite-sized insights</p>
              </div>
              <NuggetStory />
            </section>

            {/* Quick Actions */}
            <section className="quick-actions-section">
              <div className="quick-actions-grid">
                <button className="quick-action-card" onClick={() => setIsSaveModalOpen(true)}>
                  <div className="action-icon article"><BookOpen size={24} /></div>
                  <div className="action-info">
                    <h3>Save Article</h3>
                    <p>Read later</p>
                  </div>
                </button>

                <button className="quick-action-card" onClick={() => setIsSaveModalOpen(true)}>
                  <div className="action-icon note"><FileText size={24} /></div>
                  <div className="action-info">
                    <h3>Save Note</h3>
                    <p>Capture thoughts</p>
                  </div>
                </button>

                <button className="quick-action-card" onClick={() => setIsSaveModalOpen(true)}>
                  <div className="action-icon link"><LinkIcon size={24} /></div>
                  <div className="action-info">
                    <h3>Paste Link</h3>
                    <p>Quick save</p>
                  </div>
                </button>
              </div>
            </section>

            {/* Enhanced visibility: Show Resurface until a real search is active */}
            {(!searchQuery || searchQuery.length < 3) && (
              <ResurfaceSection
                items={resurfaceItems}
                loading={resurfaceLoading}
                onItemClick={setSelectedItem}
                onLike={handleResurfaceLike}
                onSkip={handleResurfaceSkip}
              />
            )}

            {/* Search Results */}
            {searchResults && searchQuery && searchQuery.length >= 3 && (
              <div className="search-results-section fade-in">
                <div className="section-header">
                  <h2 className="section-title">
                    <Search size={18} />
                    {searchQuery ? `Results for "${searchQuery}"` : "Search Results"}
                    <span className="results-count">{searchResults.length}</span>
                  </h2>
                  <button
                    className="view-all-link"
                    onClick={() => {
                      setSearchResults(null);
                      setSearchQuery("");
                    }}
                  >
                    Clear Search
                  </button>
                </div>

                {displayItems.length > 0 && (
                  <div className="best-match-section glass">
                    <div className="best-match-header">
                      <Sparkles size={14} className="sparkle-icon" />
                      <h3 className="best-match-label">Best Match</h3>
                    </div>
                    <div className="best-match-card-wrapper">
                      <ItemCard
                        item={displayItems[0]}
                        onDelete={() => removeItem(displayItems[0]._id)}
                        onClick={() => setSelectedItem(displayItems[0])}
                        className="featured-match-card"
                      />
                    </div>
                  </div>
                )}

                {searchError && (
                  <div className="search-empty-state error-state">
                    <div className="empty-state-icon">
                      <Sparkles size={32} className="error-sparkle" />
                    </div>
                    <h3>Oops! {searchError}</h3>
                    <p>Voyage AI is cooling down. Please wait a moment.</p>
                  </div>
                )}

                <div className="recent-saves-grid">
                  {displayItems.length <= 1 ? (
                    searchResults && displayItems.length === 0 && !searchError && (
                      <div className="search-empty-state">
                        <div className="empty-state-icon"><SearchX size={32} /></div>
                        <h3>No results found</h3>
                        <p>Try different keywords or tags</p>
                      </div>
                    )
                  ) : (
                    displayItems.slice(1).map((item) => (
                      <ItemCard
                        key={item._id}
                        item={item}
                        onDelete={() => removeItem(item._id)}
                        onClick={() => setSelectedItem(item)}
                      />
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <ItemDetailPanel
            item={selectedItem}
            isOpen={!!selectedItem}
            onClose={() => setSelectedItem(null)}
            onDelete={removeItem}
          />
        </main>

        {/* Floating Nexus Bot */}
        <NexusChat
          isOpen={isNexusOpen}
          onClose={() => setIsNexusOpen(false)}
          onSourceClick={setSelectedItem}
        />

        <button
          className={`nexus-trigger-btn ${isNexusOpen ? "active" : ""}`}
          onClick={() => setIsNexusOpen(!isNexusOpen)}
          title="Query the Nexus"
        >
          <Brain size={24} />
        </button>
      </div>

      <SaveModal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} />
    </div>
  );

};

export default Home;
