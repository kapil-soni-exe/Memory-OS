import React from 'react';
import './ProductPreview.css';

const sidebarItems = [
  { icon: '🔍', label: 'Search' },
  { icon: '📚', label: 'Saved Items', active: true },
  { icon: '🏷️', label: 'Topics' },
  { icon: '🕸️', label: 'Knowledge Graph' },
];

const savedItems = [
  { icon: '📄', title: 'The Pragmatic Programmer', tag: 'Book', summary: 'Career advice for software developers...', color: '#EEF3FF', date: '2d ago' },
  { icon: '🎬', title: 'How Transformers Work', tag: 'Video', summary: 'Visual explanation of attention mechanisms and...', color: '#FFF0EE', date: '3d ago' },
  { icon: '🐦', title: 'Building in public tips', tag: 'Tweet', summary: 'Key strategies for building an audience while...', color: '#F4F0FF', date: '5d ago' },
  { icon: '📑', title: 'Scaling Laws for Neural LMs', tag: 'PDF', summary: 'Research on how LLMs scale with compute...', color: '#FFF8EE', date: '1w ago' },
  { icon: '📰', title: 'The future of knowledge work', tag: 'Article', summary: 'How AI is changing the way we think and...', color: '#F0FFF4', date: '1w ago' },
];

const ProductPreview = () => {
  return (
    <section className="product-preview" id="preview">
      <div className="container">
        {/* Section header */}
        <div className="section-header">
          <p className="section-label">Product Preview</p>
          <h2 className="section-title">
            Your knowledge,<br />
            <span className="gradient-text">beautifully organized</span>
          </h2>
          <p className="section-subtitle">
            A clean, distraction-free dashboard that surfaces exactly what you need, when you need it.
          </p>
        </div>

        {/* Dashboard */}
        <div className="product-preview__window">
          {/* Browser bar */}
          <div className="product-preview__bar">
            <div className="product-preview__dots">
              <span /><span /><span />
            </div>
            <div className="product-preview__url">app.memoryos.ai — Saved Items</div>
          </div>

          <div className="product-preview__body">
            {/* Sidebar */}
            <aside className="product-preview__sidebar">
              <div className="product-preview__brand">
                <img src="/logo.png" alt="MemoryOS" />
              </div>

              <div className="product-preview__search-mini">
                <span>🔍</span>
                <span>Search…</span>
              </div>

              <nav className="product-preview__nav">
                {sidebarItems.map((item) => (
                  <div key={item.label} className={`product-preview__nav-item${item.active ? ' is-active' : ''}`}>
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </nav>

              <div className="product-preview__sidebar-footer">
                <div className="product-preview__avatar">J</div>
                <div>
                  <div className="product-preview__user-name">John Doe</div>
                  <div className="product-preview__user-plan">Pro Plan</div>
                </div>
              </div>
            </aside>

            {/* Main panel */}
            <main className="product-preview__main">
              <div className="product-preview__header">
                <h3 className="product-preview__page-title">Saved Items</h3>
                <span className="product-preview__count">128 items</span>
              </div>

              <div className="product-preview__items">
                {savedItems.map((item) => (
                  <div className="product-preview__item" key={item.title}>
                    <div className="product-preview__item-icon" style={{ background: item.color }}>
                      {item.icon}
                    </div>
                    <div className="product-preview__item-body">
                      <div className="product-preview__item-top">
                        <span className="product-preview__item-title">{item.title}</span>
                        <div className="product-preview__item-meta">
                          <span className="product-preview__item-tag">{item.tag}</span>
                          <span className="product-preview__item-date">{item.date}</span>
                        </div>
                      </div>
                      <p className="product-preview__item-summary">{item.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </main>
          </div>
        </div>

        {/* Extension strip */}
        <div className="product-preview__extension">
          <div className="product-preview__ext-step">
            <div className="product-preview__ext-num">1</div>
            <div>
              <div className="product-preview__ext-title">Read an article</div>
              <div className="product-preview__ext-sub">Find content anywhere on the web</div>
            </div>
          </div>
          <div className="product-preview__ext-arrow" aria-hidden="true">→</div>
          <div className="product-preview__ext-step">
            <div className="product-preview__ext-num">2</div>
            <div>
              <div className="product-preview__ext-title">Click Save</div>
              <div className="product-preview__ext-sub">One click with our browser extension</div>
            </div>
          </div>
          <div className="product-preview__ext-arrow" aria-hidden="true">→</div>
          <div className="product-preview__ext-step product-preview__ext-step--highlight">
            <div className="product-preview__ext-num product-preview__ext-num--gradient">3</div>
            <div>
              <div className="product-preview__ext-title">Appears in MemoryOS</div>
              <div className="product-preview__ext-sub">Summarized, tagged, and connected</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductPreview;
