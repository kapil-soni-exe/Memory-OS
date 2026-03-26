import React from 'react';
import { MousePointerClick, Sparkles, CheckCircle2 } from 'lucide-react';
import './BrowserExtension.css';

const STEPS = [
  {
    Icon:        MousePointerClick,
    title:       'Download Extension',
    description: 'Click the button below to download the MemoryOS extension zip.',
  },
  {
    Icon:        Sparkles,
    title:       'Enable Developer Mode',
    description: 'Open chrome://extensions, toggle Developer Mode on, click "Load unpacked".',
  },
  {
    Icon:        CheckCircle2,
    title:       'Select the folder',
    description: 'Unzip the file and select the extracted folder. Extension is ready!',
  },
];

const BrowserExtension = () => (
  <section className="ext" id="extension">
    <div className="container">
      <div className="ext__inner">

        {/* Left: copy */}
        <div className="ext__copy">
          <span className="section-eyebrow">Browser Extension</span>
          <h2 className="ext__heading">
            Save from anywhere<br />
            <span className="gradient-text">in one click</span>
          </h2>
          <p className="ext__subtext">
            Our lightweight browser extension works on Chrome, Firefox, Edge,
            and Arc. Clip anything from the web without ever leaving the page.
          </p>

          {/* Steps */}
          <div className="ext__steps">
            {STEPS.map(({ Icon, title, description }, i) => (
              <div className="ext__step" key={title}>
                <div className="ext__step-num">{i + 1}</div>
                <div className="ext__step-body">
                  <span className="ext__step-title">{title}</span>
                  <span className="ext__step-desc">{description}</span>
                </div>
              </div>
            ))}
          </div>

          <a
            href="/memoryos-extension.zip"
            download="memoryos-extension.zip"
            className="ext__cta"
          >
            <MousePointerClick size={16} strokeWidth={2} />
            Download Extension — free
          </a>
        </div>

        {/* Right: extension popup mockup */}
        <div className="ext__visual">
          {/* Browser outline */}
          <div className="ext__browser">
            <div className="ext__browser-chrome">
              <div className="ext__browser-dots">
                <span /><span /><span />
              </div>
              <div className="ext__browser-bar">medium.com/future-of-ai</div>
              {/* Extension icon in toolbar */}
              <div className="ext__toolbar-icon" title="MemoryOS Extension">
                <img src="/logo.png" alt="" />
              </div>
            </div>
            <div className="ext__browser-body">
              {/* Fake article */}
              <div className="ext__article-preview">
                <div className="ext__article-tag">Article · Medium</div>
                <div className="ext__article-title">
                  The Future of AI Agents: How Autonomous Systems Will Change Work
                </div>
                <div className="ext__article-lines">
                  <span /><span /><span /><span style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Extension popup */}
          <div className="ext__popup">
            <div className="ext__popup-header">
              <img src="/logo.png" alt="MemoryOS" className="ext__popup-logo" />
              <span className="ext__popup-name">Memo<span className="gradient-text">ryOS</span></span>
            </div>

            <div className="ext__popup-title">
              The Future of AI Agents…
            </div>

            <div className="ext__popup-row">
              <span className="ext__popup-label">Type</span>
              <span className="ext__popup-value">Article</span>
            </div>
            <div className="ext__popup-row">
              <span className="ext__popup-label">Tags</span>
              <div className="ext__popup-tags">
                <span>AI</span><span>Agents</span><span>Future</span>
              </div>
            </div>

            <button className="ext__popup-save">
              <Sparkles size={14} />
              Save to MemoryOS
            </button>

            <div className="ext__popup-saved">
              <CheckCircle2 size={13} />
              Saved & summarized
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>
);

export default BrowserExtension;
