import * as React from "react";
import { Sparkles } from "lucide-react";
import NuggetStory from "../../../modules/nuggets/components/NuggetStory/NuggetStory";

/**
 * StoriesSection - Page-specific composition for Neural Stories
 * 
 * Why this is a section:
 * This orchestrates the presentation of the AI-generated feed. 
 * While NuggetStory is a reusable feature, how it appears on the Home page 
 * (headers, AI pills, etc.) is a layout decision that belongs here.
 */
const StoriesSection = () => {
  return (
    <section className="stories-section fade-in">
      <div className="section-header stories-header">
        <div className="ai-badge-pill">
          <Sparkles size={12} />
          <span>AI Generated Feed</span>
        </div>
        <h2 className="section-title premium-title">Neural Stories</h2>
        <p className="section-subtitle">Distilling your recent memories into bite-sized insights</p>
      </div>
      <NuggetStory />
    </section>
  );
};

export default StoriesSection;
