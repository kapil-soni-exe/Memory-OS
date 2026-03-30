import { useMemo } from 'react';

/**
 * useGraphDataBuilder - A specialized hook for transforming raw items and topics 
 * into a structured graph dataset (nodes & links).
 * 
 * Why this exists:
 * Modern Knowledge Graphs are complex. We deal with Topics, Items, and AI-extracted 
 * Entities. Separating this builder from the UI allows the component to focus 
 * entirely on "Immersive Galaxy" rendering, while this hook handles the 
 * data-intensive heavy lifting.
 * 
 * Scalability Note:
 * For graphs exceeding 5,000+ nodes, we should consider moving this 
 * entire builder into a Web Worker to keep the main UI thread at 60fps.
 */
const useGraphDataBuilder = (items, topics, loading) => {
  return useMemo(() => {
    // Initial structure for our Knowledge Galaxy
    const fullGraphData = {
      nodes: [],
      links: []
    };

    if (loading) return fullGraphData;

    // --- 🪐 TOPIC NODES ---
    // Find main topic (highest itemCount among level 1 topics) for centering the galaxy
    const rootTopics = topics.filter(t => !t.parentTopicId || t.level === 1);
    const sortedRoots = [...rootTopics].sort((a, b) => (b.itemCount || 0) - (a.itemCount || 0));
    const mainTopic = sortedRoots[0] || [...topics].sort((a, b) => (b.itemCount || 0) - (a.itemCount || 0))[0];

    topics.forEach(t => {
      const isMain = mainTopic && t._id === mainTopic._id;
      
      // Determine size based on AI topic hierarchy level
      let baseSize = 30;
      let haloSize = 38;
      
      if (t.level === 1 || !t.parentTopicId) { 
        baseSize = 42; haloSize = 58; // Root Domains
      } else if (t.level === 2) { 
        baseSize = 30; haloSize = 42; // Sub-domains
      } else { 
        baseSize = 22; haloSize = 32; // Deep niches
      }

      if (isMain) {
        baseSize += 8;
        haloSize += 10;
      }

      fullGraphData.nodes.push({
        id: t._id,
        name: t.topicName,
        type: "Topic",
        clusterId: t.parentTopicId || t._id, // Group by parent
        isMain,
        level: t.level || 1,
        size: baseSize,
        haloSize: haloSize,
        degree: (t.itemCount || 0) * 0.5,
        summary: `Cluster of ${t.itemCount || 0} memories`,
        // Fix main topic at the center of the viewport
        fx: isMain ? 0 : undefined,
        fy: isMain ? 0 : undefined,
      });

      // 🔗 🌌 HIERARCHICAL GALAXY LINKS (Parent -> Child)
      if (t.parentTopicId) {
        const parentId = typeof t.parentTopicId === 'object' ? t.parentTopicId._id : t.parentTopicId;
        fullGraphData.links.push({
          source: parentId,
          target: t._id,
          type: "topic-hierarchy-link" // Special CSS class for this
        });
      }
    });

    // --- 📁 ITEM NODES ---
    items.forEach(i => {
      // 🚀 ID Normalization: Extract string ID whether topicId is populated or not
      const tid = (i.topicId && typeof i.topicId === 'object') ? i.topicId._id : i.topicId;

      fullGraphData.nodes.push({
        id: i._id,
        title: i.title,
        type: "Item",
        clusterId: tid,
        size: 10,
        haloSize: 16,
        source: i.source,
        degree: 1,
        date: new Date(i.createdAt).toLocaleDateString(),
        summary: i.summary
      });

      // Link Item → Topic (the primary spatial relationship)
      if (tid) {
        fullGraphData.links.push({
          source: tid,
          target: i._id,
          type: "topic-link"
        });
      }

      // --- 🔥 SEMANTIC LINKS (Item → Item) ---
      // We only show the top 2 related items to prevent a "hairball" graph
      if (i.relatedItems) {
        i.relatedItems.slice(0, 2).forEach(related => {
          const relatedId = typeof related === 'object' ? related._id : related;
          if (items.some(item => item._id === relatedId)) {
            fullGraphData.links.push({
              source: i._id,
              target: relatedId,
              type: "semantic-link"
            });
          }
        });
      }

      // --- 🧠 AI-EXTRACTED ENTITIES ---
      // Deep insights extracted from the text itself
      (i.entities || []).slice(0, 5).forEach(entity => {
        const entityId = `entity-${entity.toLowerCase()}`;
        if (!fullGraphData.nodes.find(n => n.id === entityId)) {
          fullGraphData.nodes.push({
            id: entityId,
            name: entity,
            type: "Entity",
            clusterId: i._id,
            size: 8,
            haloSize: 12,
            degree: 1
          });
        }

        // Link Item → Entity (Concept discovery)
        fullGraphData.links.push({
          source: i._id,
          target: entityId,
          type: "item-entity-link"
        });
      });

      // --- 🔗 EXPLICIT RELATIONSHIPS (Entity → Entity) ---
      (i.relationships || []).forEach(rel => {
        const sourceId = `entity-${rel.source.toLowerCase()}`;
        const targetId = `entity-${rel.target.toLowerCase()}`;

        // Only add link if both entities exist in our current visible set
        if (fullGraphData.nodes.find(n => n.id === sourceId) && fullGraphData.nodes.find(n => n.id === targetId)) {
          fullGraphData.links.push({
            source: sourceId,
            target: targetId,
            type: "relationship-link",
            label: rel.relation
          });
        }
      });
    });

    // --- 🛡️ SECURITY CHECK ---
    // Final link validation: remove any links pointing to missing nodes 
    // to prevent d3-force library crashes.
    const validNodeIds = new Set(fullGraphData.nodes.map(n => n.id));
    fullGraphData.links = fullGraphData.links.filter(link =>
      validNodeIds.has(typeof link.source === 'object' ? link.source.id : link.source) &&
      validNodeIds.has(typeof link.target === 'object' ? link.target.id : link.target)
    );

    // --- 🚀 DATA INTELLIGENCE: Importance Scoring ---
    /**
     * Why Importance Score?
     * The graph needs context. A Topic is more important than an Item, 
     * which is more important than a single Entity. Node degree (connections) 
     * also adds weight.
     */
    const typeWeights = { Topic: 30, Item: 20, Entity: 10 };
    
    fullGraphData.nodes.forEach(node => {
      const typeWeight = typeWeights[node.type] || 0;
      const degree = node.degree || 0;
      node.importanceScore = typeWeight + degree;
    });

    // Mark top 2 nodes as "Important" for initial visual focus
    const sortedByImportance = [...fullGraphData.nodes].sort((a, b) => b.importanceScore - a.importanceScore);
    if (sortedByImportance.length > 0) sortedByImportance[0].isImportant = true;
    if (sortedByImportance.length > 1) sortedByImportance[1].isImportant = true;

    return fullGraphData;
  }, [items, topics, loading]); // Recalculate only when core data changes
};

export default useGraphDataBuilder;
