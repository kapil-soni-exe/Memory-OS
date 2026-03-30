import { useMemo } from 'react';

/**
 * useGraphView - A specialized hook for computing the "Visible" slice 
 * of the Knowledge Galaxy based on the user's current zoom/drill-down level.
 * 
 * Why this exists:
 * In a large Knowledge Graph, showing every single node (Topics + Items + Entities) 
 * at once leads to a "hairball" UI and massive performance lag.
 * This hook acts as a logical filter that only lets through the nodes and 
 * links relevant to the user's current focus.
 */
const useGraphView = (fullGraphData, level, selectedNode) => {
  return useMemo(() => {
    // If the data builder hasn't finished yet, we show an empty graph.
    if (!fullGraphData || !fullGraphData.nodes) return { nodes: [], links: [] };

    // --- 🌌 LEVEL 1: TOPICS (Overview) ---
    // At the highest level, we only show the main "Topic" clusters.
    // This gives the user a clean "Global View" of their knowledge domains.
    if (level === "topics") {
      return {
        nodes: fullGraphData.nodes.filter(n => n.type === "Topic"),
        links: fullGraphData.links.filter(l => l.type === "topic-hierarchy-link") // Show the hierarchical gravity links!
      };
    }

    // --- 📁 LEVEL 2: ITEMS (Drill-down) ---
    // When a user clicks a Topic, we show that Topic + its directly connected Items.
    if (level === "items" && selectedNode) {
      let filteredNodes = fullGraphData.nodes.filter(n => 
        n.id === selectedNode.id || 
        (n.type === "Item" && fullGraphData.links.some(l => 
          (l.source === selectedNode.id && l.target === n.id) || 
          (l.target === selectedNode.id && l.source === n.id)
        ))
      );

      /**
       * 🚀 Density Guard: Item Limit (35)
       * Why? Even within a topic, showing 100+ items creates visual noise.
       * We sort by 'degree' (connection count) to ensure the most relevant 
       * memories are shown first.
       */
      if (filteredNodes.length > 36) {
        const parent = filteredNodes.find(n => n.id === selectedNode.id);
        const children = filteredNodes.filter(n => n.id !== selectedNode.id)
          .sort((a, b) => (b.degree || 0) - (a.degree || 0))
          .slice(0, 35);
        filteredNodes = [parent, ...children];
      }

      // We must also filter links to only include those between our visible nodes.
      const nodeIds = new Set(filteredNodes.map(n => n.id));
      const filteredLinks = fullGraphData.links.filter(l => 
        nodeIds.has(l.source.id || l.source) && nodeIds.has(l.target.id || l.target)
      );

      return { nodes: filteredNodes, links: filteredLinks };
    }

    // --- 🧠 LEVEL 3: ENTITIES (Deep Insights) ---
    // The deepest level: showing a specific Item + its AI-extracted entities.
    if (level === "entities" && selectedNode) {
      let filteredNodes = fullGraphData.nodes.filter(n => 
        n.id === selectedNode.id || 
        (n.type === "Entity" && fullGraphData.links.some(l => 
          (l.source === selectedNode.id && l.target === n.id) || 
          (l.target === selectedNode.id && l.source === n.id)
        ))
      );

      /**
       * 🚀 Density Guard: Entity Limit (45)
       * Entity graphs get complex quickly. 45 is our threshold for 
       * maintaining a smooth 60fps interaction on mobile and low-end devices.
       */
      if (filteredNodes.length > 46) {
        const parent = filteredNodes.find(n => n.id === selectedNode.id);
        const children = filteredNodes.filter(n => n.id !== selectedNode.id)
          .sort((a, b) => (b.degree || 0) - (a.degree || 0))
          .slice(0, 45);
        filteredNodes = [parent, ...children];
      }

      const nodeIds = new Set(filteredNodes.map(n => n.id));
      const filteredLinks = fullGraphData.links.filter(l => 
        nodeIds.has(l.source.id || l.source) && nodeIds.has(l.target.id || l.target)
      );

      return { nodes: filteredNodes, links: filteredLinks };
    }

    // Default: Return the full dataset if level logic doesn't match
    return fullGraphData;
  }, [fullGraphData, level, selectedNode]);
};

export default useGraphView;
