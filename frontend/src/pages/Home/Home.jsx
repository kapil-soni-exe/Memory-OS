import * as React from "react";
import { useState } from "react";
import { Brain } from "lucide-react";
import { motion } from "framer-motion";

// Components
import SearchBar from "../../components/common/SearchBar/SearchBar";
import SaveModal from "../../modules/items/components/SaveModal/SaveModal";
import ItemDetailPanel from "../../modules/items/components/ItemDetailPanel/ItemDetailPanel";
import NexusChat from "../../modules/nexus/components/NexusChat/NexusChat";

// Sections
import StoriesSection from "./sections/StoriesSection";
import SearchSection from "./sections/SearchSection";
import ResurfaceSection from "./sections/ResurfaceSection";
import QuickActionsSection from "./sections/QuickActionsSection";

// Hooks
import useSearch from "../../modules/search/hooks/useSearch";
import { useDeleteItem } from "../../modules/items/hooks/useItemMutation";
import { pageTransition } from "../../styles/animations";

import "./Home.css";

/**
 * Home - The Central Knowledge Orchestrator (Hybrid Architecture)
 */
const Home = () => {
  const deleteItemMutation = useDeleteItem();
  const searchProps = useSearch();
  const { searchQuery } = searchProps;
  const isSearchActive = searchQuery && searchQuery.length >= 3;

  // UI State
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isNexusOpen, setIsNexusOpen] = useState(false);

  return (
    <motion.div
      className="home-content-wrapper"
      {...pageTransition}
    >
      <main className="home-content">
        <div className="main-feed-container">
          <SearchBar
            onSearchResults={searchProps.handleSearchResults}
          />

          <SearchSection
            searchProps={searchProps}
            onItemClick={setSelectedItem}
          />

          <StoriesSection />

          <QuickActionsSection onSaveClick={() => setIsSaveModalOpen(true)} />

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

      <SaveModal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} />
    </motion.div>
  );
};

export default Home;
