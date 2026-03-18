import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import KnowledgeGraph from '../../components/KnowledgeGraph/KnowledgeGraph';
import SaveModal from '../../components/SaveModal/SaveModal';
import useItems from '../../hooks/useItems';
import useTopics from '../../hooks/useTopics';
import './KnowledgeGraphPage.css';

const KnowledgeGraphPage = () => {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const { items, loading: itemsLoading, addItem } = useItems();
  const { topics, loading: topicsLoading } = useTopics();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const highlightId = searchParams.get('highlight');

  const loading = itemsLoading || topicsLoading;

  // ... (rest of the logic remains same)
  // [Lines 24-70]
  
  // (Adding the data processing back for context to ensure I don't break it)
  // Construct graph data from real items and topics
  const graphData = {
    nodes: [],
    links: []
  };

  if (!loading) {
    // Add Topic Nodes
    topics.forEach(t => {
      graphData.nodes.push({
        id: t._id,
        name: t.topicName,
        type: "Topic",
        degree: t.itemCount * 0.5, // Initial weighting
        summary: `Cluster of ${t.itemCount} memories`
      });
    });

    // Add Item Nodes
    items.forEach(i => {
      graphData.nodes.push({
        id: i._id,
        title: i.title,
        type: "Item",
        source: i.source,
        degree: 1, // Base degree
        date: new Date(i.createdAt).toLocaleDateString(),
        summary: i.summary
      });

      // Link Item to Topic if it exists
      if (i.topicId) {
        graphData.links.push({
          source: i.topicId,
          target: i._id,
          type: "Hard"
        });
      }

      // Add Tag Nodes and links
      i.tags.forEach(tag => {
        const tagId = `tag-${tag}`;
        if (!graphData.nodes.find(n => n.id === tagId)) {
          graphData.nodes.push({
            id: tagId,
            name: tag,
            type: "Tag",
            degree: 1
          });
        }
        graphData.links.push({
          source: i._id,
          target: tagId,
          type: "Hard"
        });
      });

      // 🔥 Semantic Links (Related items)
      if (i.relatedItems) {
        i.relatedItems.forEach(related => {
          // Only link if the related item exists in our nodes
          const relatedId = typeof related === 'object' ? related._id : related;
          if (items.some(item => item._id === relatedId)) {
            graphData.links.push({
              source: i._id,
              target: relatedId,
              type: "Semantic"
            });
          }
        });
      }
    });

    // Update node degrees based on links for dynamic sizing
    graphData.links.forEach(link => {
      const sourceNode = graphData.nodes.find(n => n.id === (typeof link.source === 'object' ? link.source.id : link.source));
      const targetNode = graphData.nodes.find(n => n.id === (typeof link.target === 'object' ? link.target.id : link.target));
      if (sourceNode) sourceNode.degree = (sourceNode.degree || 0) + 1;
      if (targetNode) targetNode.degree = (targetNode.degree || 0) + 1;
    });
  }

  return (
    <div className="graph-page-layout">
      <Sidebar />
      <div className="graph-page-main">
        <Topbar onSaveClick={() => setIsSaveModalOpen(true)} />
        
        <main className="graph-page-content">
          <div className="immersive-graph-container">
            {/* Overlay Header */}
            <div className="graph-overlay-header glass">
              <div className="header-text">
                <h1 className="page-title">Knowledge Galaxy</h1>
                <p className="page-subtitle">Visualize connections across your second brain.</p>
              </div>
              <div className="graph-legend">
                <div className="legend-item"><span className="dot topic"></span> Topics</div>
                <div className="legend-item"><span className="dot item"></span> Items</div>
                <div className="legend-item"><span className="dot tag"></span> Tags</div>
              </div>
            </div>

            {loading ? (
              <div className="graph-loading-overlay">
                <div className="loader-orbit"></div>
                <span>Initialising Galaxy...</span>
              </div>
            ) : (
              <KnowledgeGraph data={graphData} initialSelectedId={highlightId} />
            )}
          </div>
        </main>
      </div>

      <SaveModal 
        isOpen={isSaveModalOpen} 
        onClose={() => setIsSaveModalOpen(false)} 
        onSave={addItem}
      />
    </div>
  );
};

export default KnowledgeGraphPage;
