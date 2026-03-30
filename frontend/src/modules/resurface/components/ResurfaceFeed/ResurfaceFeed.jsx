import * as React from "react";
import ResurfaceSection from "../ResurfaceSection/ResurfaceSection";

/**
 * ResurfaceFeed - A wrapper for the feature-specific ResurfaceSection
 * 
 * Why this is separate:
 * This acts as a bridge between the Home orchestrator and the Resurface feature UI.
 * It ensures that the Orchestrator doesn't need to know about the internal implementation 
 * details of the feature.
 */
const ResurfaceFeed = ({ 
  searchQuery, 
  onItemClick, 
  onLike, 
  onSkip 
}) => {
  // Logic from original Home.jsx: Only show the resurface feed 
  // when we're NOT actively searching for something else.
  if (searchQuery && searchQuery.length >= 3) return null;

  return (
    <ResurfaceSection
      onItemClick={onItemClick}
      onLike={onLike}
      onSkip={onSkip}
    />
  );
};

export default ResurfaceFeed;
