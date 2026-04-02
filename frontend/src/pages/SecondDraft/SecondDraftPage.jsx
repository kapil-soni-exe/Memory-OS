import React, { useState, useEffect } from 'react';
import Sidebar from '../../layouts/Sidebar/Sidebar';
import Topbar from '../../layouts/Topbar/Topbar';
import SecondDraftEditor from '../../features/composer/components/SecondDraftEditor/SecondDraftEditor';
import SourceSidebar from '../../features/composer/components/SourceSidebar/SourceSidebar';
import ItemDetailPanel from '../../modules/items/components/ItemDetailPanel/ItemDetailPanel';
import './SecondDraftPage.css';

import { motion } from 'framer-motion';
import { pageTransition } from '../../styles/animations';

const SecondDraftPage = () => {
  const [prompt, setPrompt] = useState('');
  const [lastAnalyzedPrompt, setLastAnalyzedPrompt] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeSourceId, setActiveSourceId] = useState(null);
  const [selectedSourceIds, setSelectedSourceIds] = useState([]);

  // Sources are fetched via the editor's pre-fetch logic based on user prompt.
  // We no longer populate all items initially.

  const toggleSource = (id) => {
    setSelectedSourceIds(prev =>
      prev.includes(id)
        ? prev.filter(sid => sid !== id)
        : [...prev, id]
    );
  };

  return (
    <motion.div 
      className="second-draft-content-wrapper"
      {...pageTransition}
    >
      <main className="second-draft-content">
        <div className="composer-container">
          <div className="composer-workspace">

            {/* ✅ Editor */}
            <div className="editor-region">
              <SecondDraftEditor
                prompt={prompt}
                setPrompt={setPrompt}
                lastAnalyzedPrompt={lastAnalyzedPrompt}
                setLastAnalyzedPrompt={setLastAnalyzedPrompt}
                activeSourceId={activeSourceId}
                setActiveSourceId={setActiveSourceId}
                selectedSourceIds={selectedSourceIds}
                setSelectedSourceIds={setSelectedSourceIds}
              />
            </div>

            {/* ✅ Right Sidebar */}
            <aside className="source-region">
              <SourceSidebar
                prompt={lastAnalyzedPrompt}
                activeSourceId={activeSourceId}
                setActiveSourceId={setActiveSourceId}
                onSourceClick={(item) => setSelectedItem(item)}
                selectedSourceIds={selectedSourceIds}
                onToggleSource={toggleSource}
              />
            </aside>

          </div>
        </div>
      </main>

      {/* ✅ Slide Panel */}
      <ItemDetailPanel
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </motion.div>
  );
};

export default SecondDraftPage;