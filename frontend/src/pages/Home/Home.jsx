import * as React from "react";
import { useState } from "react";
import { BookOpen, FileText, Link as LinkIcon, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/Sidebar/Sidebar";
import Topbar from "../../components/Topbar/Topbar";
import SearchBar from "../../components/SearchBar/SearchBar";
import ItemCard from "../../components/ItemCard/ItemCard";
import SaveModal from "../../components/SaveModal/SaveModal";
import ItemDetailPanel from "../../components/ItemDetailPanel/ItemDetailPanel";

import useItems from "../../hooks/useItems";
import useResurface from "../../hooks/useResurface";
import ResurfaceSection from "../../components/ResurfaceSection/ResurfaceSection";
import NexusChat from "../../components/NexusChat/NexusChat";

import "./Home.css";

const Home = () => {

const navigate = useNavigate();
const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

const { items: allItems, loading, addItem, removeItem } = useItems();
const { items: resurfaceItems, loading: resurfaceLoading, removeItem: removeResurfaceItem } = useResurface();
const [searchResults, setSearchResults] = useState(null);
const [selectedItem, setSelectedItem] = useState(null);
const [isNexusOpen, setIsNexusOpen] = useState(false);

const handleResurfaceDelete = async (id) => {
  await removeItem(id); // Global DB delete
  removeResurfaceItem(id); // Local resurface state update
};

// Defensively ensure displayItems is an array
const displayItems = Array.isArray(searchResults?.results) 
  ? searchResults.results 
  : (Array.isArray(allItems) ? allItems : []);

return (


<div className="home-layout">

  <Sidebar />

  <div className="home-main">

    <Topbar onSaveClick={() => setIsSaveModalOpen(true)} />

    <main className="home-content">

      {/* Search */}
      <SearchBar onSearchResults={setSearchResults} items={allItems} />

      {/* Quick Actions */}

      <section className="quick-actions-section">

        <div className="quick-actions-grid">

          <button
            className="quick-action-card"
            onClick={() => setIsSaveModalOpen(true)}
          >

            <div className="action-icon article">
              <BookOpen size={24} />
            </div>

            <div className="action-info">
              <h3>Save Article</h3>
              <p>Read later</p>
            </div>

          </button>

          <button
            className="quick-action-card"
            onClick={() => setIsSaveModalOpen(true)}
          >

            <div className="action-icon note">
              <FileText size={24} />
            </div>

            <div className="action-info">
              <h3>Save Note</h3>
              <p>Capture thoughts</p>
            </div>

          </button>

          <button
            className="quick-action-card"
            onClick={() => setIsSaveModalOpen(true)}
          >

            <div className="action-icon link">
              <LinkIcon size={24} />
            </div>

            <div className="action-info">
              <h3>Paste Link</h3>
              <p>Quick save</p>
            </div>

          </button>

        </div>

      </section>

      {!searchResults && (
        <ResurfaceSection 
          items={resurfaceItems} 
          loading={resurfaceLoading}
          onItemClick={setSelectedItem}
          onDelete={handleResurfaceDelete}
        />
      )}

      {/* Floating Nexus Bot */}
      <NexusChat 
        isOpen={isNexusOpen} 
        onClose={() => setIsNexusOpen(false)}
        onSourceClick={setSelectedItem}
      />
      
      <button 
        className={`nexus-trigger-btn ${isNexusOpen ? 'active' : ''}`}
        onClick={() => setIsNexusOpen(!isNexusOpen)}
        title="Query the Nexus"
      >
        <Brain size={24} />
      </button>

      {/* Search Results */}
      {searchResults && (
        <div className="search-results-section fade-in">
          <div className="section-header">
            <h2 className="section-title">Search Results</h2>
            <button className="view-all-link" onClick={() => setSearchResults(null)}>Clear Search</button>
          </div>
          
          <div className="recent-saves-grid">
            {displayItems.length === 0 ? (
              <p>No search results match your query.</p>
            ) : (
              displayItems.map((item) => (
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

      <ItemDetailPanel 
        item={selectedItem} 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        onDelete={removeItem}
      />

    </main>

  </div>

  <SaveModal
    isOpen={isSaveModalOpen}
    onClose={() => setIsSaveModalOpen(false)}
  />

</div>


);
};

export default Home;
