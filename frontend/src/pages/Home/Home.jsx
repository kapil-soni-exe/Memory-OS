import * as React from "react";
import { useState } from "react";
import { Brain } from "lucide-react";

// Layout & Common
import Sidebar from "../../layouts/Sidebar/Sidebar";
import Topbar from "../../layouts/Topbar/Topbar";
import SearchBar from "../../components/common/SearchBar/SearchBar";
import SaveModal from "../../modules/items/components/SaveModal/SaveModal";
import ItemDetailPanel from "../../modules/items/components/ItemDetailPanel/ItemDetailPanel";

// Core Features
import { useDeleteItem } from "../../modules/items/hooks/useItemMutation";
import NexusChat from "../../modules/nexus/components/NexusChat/NexusChat";

// Hybrid Sections (Page Composition Layer)
import StoriesSection from "./sections/StoriesSection";
import SearchSection from "./sections/SearchSection";
import ResurfaceSection from "./sections/ResurfaceSection";
import QuickActionsSection from "./sections/QuickActionsSection";

// Modules (Logic Layer)
import useSearch from "../../modules/search/hooks/useSearch";

import "./Home.css";

/**
 * Home - The Central Knowledge Orchestrator (Hybrid Architecture)
 */
const Home = () => {
  // Step 6: Item Delete Flow (via React Query)
  const deleteItemMutation = useDeleteItem();

  /**
   * 🧠 Single Source of Truth:
   * We lift useSearch here so that sibling sections (Search & Resurface)
   * can stay perfectly in sync without fragmented states.
   */
  const searchProps = useSearch();
  const { searchQuery } = searchProps;
  const isSearchActive = searchQuery && searchQuery.length >= 3;

  // Shared UI-only State
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isNexusOpen, setIsNexusOpen] = useState(false);

  return (
    <div className="home-layout">
      <Sidebar />

      <div className="home-main">
        <Topbar onSaveClick={() => setIsSaveModalOpen(true)} />

        <main className="home-content">
          <div className="main-feed-container">
            
            {/* 
                🔍 Stable SearchBar: 
                Keeping this at the top level of the feed ensures it doesn't 
                unmount when searchResults change, preserving input focus.
            */}
            <SearchBar 
              onSearchResults={searchProps.handleSearchResults} 
            />

            {/* 🔎 Discovery Section: Composition layer for results */}
            <SearchSection 
              searchProps={searchProps}
              onItemClick={setSelectedItem} 
            />

            {/* AI Insight Section */}
            <StoriesSection />

            {/* ⚡ Quick Entry Section */}
            <QuickActionsSection onSaveClick={() => setIsSaveModalOpen(true)} />

            {/* 🔄 Recall Section: Orchestrated visibility */}
            <ResurfaceSection
              isSearchActive={isSearchActive}
              onItemClick={setSelectedItem}
              contextItem={selectedItem}
            />
          </div>

          <ItemDetailPanel
            item={selectedItem}
            isOpen={!!selectedItem}
            onClose={() => setSelectedItem(null)}
            onDelete={(id) => deleteItemMutation.mutate(id)}
          />
        </main>

        <NexusChat
          isOpen={isNexusOpen}
          onClose={() => setIsNexusOpen(false)}
          onSourceClick={setSelectedItem}
        />

        <button
          className={`nexus-trigger-btn ${isNexusOpen ? "active" : ""}`}
          onClick={() => setIsNexusOpen(!isNexusOpen)}
          title="Query the Nexus"
          aria-label={isNexusOpen ? "Close Nexus" : "Open Nexus"}
        >
          <Brain size={24} />
        </button>
      </div>

      <SaveModal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} />
    </div>
  );
};

export default Home;



