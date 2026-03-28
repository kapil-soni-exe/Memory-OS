import * as React from "react";
import ResurfaceSection from "../../../modules/resurface/components/ResurfaceSection/ResurfaceSection";

/**
 * ResurfaceSection - Home page section for reappearing knowledge
 * 
 * Why this is a section:
 * This coordinates the "Memory Resurface" experience. 
 * Now fully self-contained via TanStack Query.
 */
const ResurfaceSectionContainer = ({ isSearchActive, onItemClick, contextItem }) => {
  // Business Rule: Resurface feed is hidden when user is actively searching.
  if (isSearchActive) return null;

  return (
    <ResurfaceSection
      onItemClick={onItemClick}
      contextItem={contextItem}
    />
  );
};

export default ResurfaceSectionContainer;
