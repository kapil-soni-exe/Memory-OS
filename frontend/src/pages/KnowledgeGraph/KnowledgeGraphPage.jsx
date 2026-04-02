import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import KnowledgeGraph from '../../modules/graph/components/KnowledgeGraph';
import SaveModal from '../../modules/items/components/SaveModal/SaveModal';
import { useItemsQuery } from '../../modules/items/hooks/useItemsQuery';
import { useTopicsQuery } from '../../modules/items/hooks/useTopicsQuery';
import useGraphDataBuilder from '../../modules/graph/hooks/useGraphDataBuilder';
import useGraphView from '../../modules/graph/hooks/useGraphView';
import useGraphNavigation from '../../modules/graph/hooks/useGraphNavigation';
import './KnowledgeGraphPage.css';

import { motion } from 'framer-motion';
import { pageTransition } from '../../styles/animations';

const KnowledgeGraphPage = () => {
  const navigate = useNavigate();
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  
  // Step 3: FETCH ITEMS & TOPICS (API directly)
  const { data: items = [], isLoading: itemsLoading } = useItemsQuery();
  const { data: topics = [], isLoading: topicsLoading } = useTopicsQuery();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const highlightId = searchParams.get('highlight');

  /**
   * 🏗️ Hybrid Architecture - Galaxy Implementation: 
   * We've decoupled data construction, view filtering, and navigation 
   * state into specialized hooks. KnowledgeGraphPage.jsx is now 
   * a pure visual orchestrator for the Immersive Galaxy.
   */
  const { 
    level, 
    setLevel, 
    selectedNode, 
    setSelectedNode, 
    handleNodeClick, 
    handleBack 
  } = useGraphNavigation(navigate);

  const loading = itemsLoading || topicsLoading;

  const fullGraphData = useGraphDataBuilder(items, topics, loading);
  const visibleGraph = useGraphView(fullGraphData, level, selectedNode);

  // 🎯 Smart Focus: Identify the most important node for initial focus
  const topImportantNodeId = React.useMemo(() => {
    if (!fullGraphData.nodes || fullGraphData.nodes.length === 0) return null;
    const sorted = [...fullGraphData.nodes].sort((a, b) => b.importanceScore - a.importanceScore);
    return sorted[0]?.id;
  }, [fullGraphData.nodes]);

  const parentTopic = React.useMemo(() => {
    if (level === "entities" && selectedNode?.clusterId) {
      return topics.find(t => t._id === selectedNode.clusterId);
    }
    return null;
  }, [level, selectedNode, topics]);

  return (
    <motion.div 
      className="graph-page-wrapper"
      {...pageTransition}
      style={{ height: '100%', width: '100%', position: 'relative' }}
    >
      {/* Floating Back Button */}
      <button className="graph-back-btn glass" onClick={handleBack}>
        <ArrowLeft size={20} />
      </button>

      <main className="immersive-graph-container">
        {/* Overlay Header */}
        <div className="graph-overlay-header glass">
          <div className="header-text">
            {/* Minimal Breadcrumb Path */}
            <nav className="graph-breadcrumbs">
              <span 
                className={level === "topics" ? "active" : ""} 
                onClick={() => { setLevel("topics"); setSelectedNode(null); }}
              >
                Galaxy
              </span>
              
              {level !== "topics" && (
                <>
                  <span className="separator">/</span>
                  <span 
                    className={level === "items" ? "active" : ""}
                    onClick={() => { if (level === "entities") setLevel("items"); }}
                  >
                    {level === "entities" ? (parentTopic?.topicName || "Topic") : (selectedNode?.name || "Topic")}
                  </span>
                </>
              )}

              {level === "entities" && (
                <>
                  <span className="separator">/</span>
                  <span className="active">Item</span>
                </>
              )}
            </nav>

            <h1 className="page-title">
              {level === "topics" && "Knowledge Galaxy"}
              {level === "items" && (selectedNode?.name || "Topic Explorer")}
              {level === "entities" && (selectedNode?.title || "Item Insights")}
            </h1>
          </div>

          <div className="graph-legend">
            <div className="legend-items">
              <div className="legend-item"><span className="dot topic"></span> Domains</div>
              <div className="legend-item"><span className="dot item"></span> Memories</div>
              <div className="legend-item"><span className="dot entity"></span> Insights</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="graph-loading-overlay">
            <div className="loader-orbit"></div>
            <span>Initialising Galaxy...</span>
          </div>
        ) : (
          <KnowledgeGraph 
            data={visibleGraph} 
            initialSelectedId={highlightId || topImportantNodeId}
            onNodeClick={handleNodeClick}
          />
        )}
      </main>

      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
      />
    </motion.div>
  );
};

export default KnowledgeGraphPage;
