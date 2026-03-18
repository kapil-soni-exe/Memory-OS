// MemoryOS Content Script
// Extract metadata from the page
function getMetaContent(name) {
  const meta = document.querySelector(`meta[property="${name}"], meta[name="${name}"]`);
  return meta ? meta.getAttribute('content') : '';
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extract-metadata") {
    const metadata = {
      title: document.title,
      description: getMetaContent('description') || getMetaContent('og:description'),
      image: getMetaContent('og:image'),
      url: window.location.href,
      selection: window.getSelection().toString()
    };
    sendResponse(metadata);
  }
});
