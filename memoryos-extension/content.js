// ✅ 1. Robust Automatic Direct Sync (Poll every 3 seconds)
console.log("🚀 [MemoryOS] Galaxy Content Script Active - Domain:", window.location.hostname);

let lastSyncedToken = null;

const startAutoSync = () => {
  // Catch all possible variants of the dashboard domain
  const isDashboard = window.location.hostname.includes("memory-os") || 
                      window.location.hostname.includes("localhost") ||
                      window.location.hostname.includes("127.0.0.1") ||
                      window.location.hostname.includes("vercel.app");

  if (!isDashboard) {
    console.log("ℹ️ [MemoryOS] Skipping sync - Not a dashboard domain.");
    return;
  }

  console.log("🔍 [MemoryOS] Dashboard detected! Starting Token Poller...");

  setInterval(() => {
    const token = localStorage.getItem("token");
    
    if (token && token !== lastSyncedToken) {
      console.log("💎 [MemoryOS] New token found in LocalStorage! Syncing now...");
      
      chrome.runtime.sendMessage({ action: "ACTION_SET_TOKEN", token }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn("⚠️ [MemoryOS] Sync Messaging Error:", chrome.runtime.lastError.message);
        } else if (response?.success) {
          lastSyncedToken = token;
          console.log("✅ [MemoryOS] Galaxy Extension Synced Successfully! You are now ONLINE.");
        }
      });
    }
  }, 3000);
};

// Start the search
startAutoSync();

// ✅ 2. Metadata Extraction
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
