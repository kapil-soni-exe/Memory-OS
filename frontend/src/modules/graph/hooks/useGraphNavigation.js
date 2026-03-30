import { useState } from 'react';

/**
 * useGraphNavigation - A hook to manage the hierarchical navigation state 
 * of the Knowledge Galaxy (drill-down and back-navigation).
 * 
 * Why this exists:
 * The Knowledge Galaxy uses a 3-tier navigation system: 
 * Galaxy (topics) -> Topic Explorer (items) -> Item Insights (entities).
 * Centralizing this state logic here prevents the main page component 
 * from becoming a bloated "State Manager" and makes the navigation 
 * flow more predictable and easier to test.
 */
const useGraphNavigation = (navigate) => {
  // Navigation level: "topics", "items", or "entities"
  const [level, setLevel] = useState('topics');
  
  // The specific node (Topic or Item) that the user has drilled into.
  const [selectedNode, setSelectedNode] = useState(null);

  /**
   * handleNodeClick
   * Orchestrates the "Drill-Down" experience.
   * - Clicking a Topic node zooms into its Items.
   * - Clicking an Item node zooms into its AI-extracted Entities.
   */
  const handleNodeClick = (node) => {
    if (node.type === "Topic") {
      setSelectedNode(node);
      setLevel("items");
    } else if (node.type === "Item") {
      setSelectedNode(node);
      setLevel("entities");
    }
  };

  /**
   * handleBack
   * Orchestrates the "Step-Back" experience.
   * Unlike standard browser 'back', this follows the logical hierarchy 
   * of the knowledge galaxy. If we're at the root (Galaxy), we use 
   * the standard router to go back to the previous page.
   */
  const handleBack = () => {
    if (level === "entities") {
      // Step back from Entities view to the Item grid
      setLevel("items");
    } else if (level === "items") {
      // Step back from Items view to the Galaxy overview
      setLevel("topics");
      setSelectedNode(null);
    } else {
      // We are at the root level, so we exit the graph entirely.
      navigate(-1);
    }
  };

  return {
    level,
    setLevel,
    selectedNode,
    setSelectedNode,
    handleNodeClick,
    handleBack
  };
};

export default useGraphNavigation;
