import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import KnowledgeGraph from '../../features/graph/components/KnowledgeGraph/KnowledgeGraph';
import SaveModal from '../../features/items/components/SaveModal/SaveModal';
import useItems from '../../features/items/hooks/useItems';
import useTopics from '../../features/items/hooks/useTopics';
import './KnowledgeGraphPage.css';

const KnowledgeGraphPage = () => {
  const navigate = useNavigate();
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
    // Find main topic (highest itemCount) for centering
    const mainTopic = [...topics].sort((a, b) => b.itemCount - a.itemCount)[0];

    // Add Topic Nodes
    topics.forEach(t => {
      const isMain = mainTopic && t._id === mainTopic._id;
      graphData.nodes.push({
        id: t._id,
        name: t.topicName,
        type: "Topic",
        isMain,
        size: isMain ? 45 : 30,
        haloSize: isMain ? 55 : 38,
        degree: t.itemCount * 0.5,
        summary: `Cluster of ${t.itemCount} memories`,
        // Fix main topic at center
        fx: isMain ? 0 : undefined,
        fy: isMain ? 0 : undefined,
      });
    });

    // Add Item Nodes
    items.forEach(i => {
      graphData.nodes.push({
        id: i._id,
        title: i.title,
        type: "Item",
        size: 10,
        haloSize: 16,
        source: i.source,
        degree: 1,
        date: new Date(i.createdAt).toLocaleDateString(),
        summary: i.summary
      });

      // Link Item → Topic (topic-link)
      if (i.topicId) {
        graphData.links.push({
          source: i.topicId,
          target: i._id,
          type: "topic-link"
        });
      }

      // Add Tag Nodes and links (temporarily disabled)
      /* (i.tags || []).forEach(tag => {
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
      }); */

      // 🔥 Semantic Links (Item → Item, top 2 only)
      if (i.relatedItems) {
        i.relatedItems.slice(0, 2).forEach(related => {
          const relatedId = typeof related === 'object' ? related._id : related;
          if (items.some(item => item._id === relatedId)) {
            graphData.links.push({
              source: i._id,
              target: relatedId,
              type: "semantic-link"
            });
          }
        });
      }

      // 🧠 AI-Extracted Entities
      (i.entities || []).forEach(entity => {
        const entityId = `entity-${entity.toLowerCase()}`;
        if (!graphData.nodes.find(n => n.id === entityId)) {
          graphData.nodes.push({
            id: entityId,
            name: entity,
            type: "Entity",
            size: 8,
            haloSize: 12,
            degree: 1
          });
        }

        // Link Item → Entity
        graphData.links.push({
          source: i._id,
          target: entityId,
          type: "item-entity-link"
        });
      });

      // 🔗 Explicit Relationships (Entity → Entity)
      (i.relationships || []).forEach(rel => {
        const sourceId = `entity-${rel.source.toLowerCase()}`;
        const targetId = `entity-${rel.target.toLowerCase()}`;

        // Only add link if both entities exist in our node list
        // (They should, as they usually come from the item's entities list)
        if (graphData.nodes.find(n => n.id === sourceId) && graphData.nodes.find(n => n.id === targetId)) {
          graphData.links.push({
            source: sourceId,
            target: targetId,
            type: "relationship-link",
            label: rel.relation
          });
        }
      });
    });

    // Final security check: remove links pointing to missing nodes
    const validNodeIds = new Set(graphData.nodes.map(n => n.id));
    graphData.links = graphData.links.filter(link =>
      validNodeIds.has(typeof link.source === 'object' ? link.source.id : link.source) &&
      validNodeIds.has(typeof link.target === 'object' ? link.target.id : link.target)
    );

    // Update node degrees based on links
    graphData.links.forEach(link => {
      const sourceNode = graphData.nodes.find(n => n.id === (typeof link.source === 'object' ? link.source.id : link.source));
      const targetNode = graphData.nodes.find(n => n.id === (typeof link.target === 'object' ? link.target.id : link.target));
      if (sourceNode) sourceNode.degree = (sourceNode.degree || 0) + 1;
      if (targetNode) targetNode.degree = (targetNode.degree || 0) + 1;
    });
  }

  return (
    <div className="graph-page-fullscreen">
      {/* Floating Back Button */}
      <button className="graph-back-btn glass" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
      </button>

      <main className="immersive-graph-container">
        {/* Overlay Header */}
        <div className="graph-overlay-header glass">
          <div className="header-text">
            <h1 className="page-title">Knowledge Galaxy</h1>
            <p className="page-subtitle">Visualize connections across your second brain.</p>
          </div>
          <div className="graph-legend">
            <div className="legend-item"><span className="dot topic"></span> Topics</div>
            <div className="legend-item"><span className="dot item"></span> Items</div>
            <div className="legend-item"><span className="dot entity"></span> Entities</div>
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
      </main>

      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={addItem}
      />
    </div>
  );
};

export default KnowledgeGraphPage;
