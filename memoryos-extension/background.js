// background.js - config.js import HATAO, directly define karo
console.log("Background loaded");
const CONFIG = {
  API_URL: "https://memory-os.onrender.com/api"
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-to-galaxy",
    title: "Add to Knowledge Galaxy",
    contexts: ["selection", "page"]
  });
});

// ✅ 1. Listen for Token from the Web Dashboard (Cookie-free Auth)
// A. External Sync (From external connectable web app)
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (message.action === "ACTION_SET_TOKEN") {
    chrome.storage.local.set({ "token": message.token }, () => {
      console.log("✅ Token successfully synced from external web dashboard.");
      sendResponse({ success: true, message: "Galaxy connected!" });
    });
    return true;
  }
});

// B. Internal Sync (From content.js silent capture)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "ACTION_SET_TOKEN") {
    chrome.storage.local.set({ "token": message.token }, () => {
      console.log("🚀 [MemoryOS] Automatic Internal Sync Success!");
      sendResponse({ success: true });
    });
    return true;
  }
});

// Helper to get auth header (Checks Storage first, then Cookies)
const getAuthHeader = async () => {
  try {
    // A. Check chrome.storage.local first (The New Standard)
    const stored = await chrome.storage.local.get("token");
    if (stored.token) {
      console.log("✅ Using token from Storage.");
      return { "Authorization": `Bearer ${stored.token}` };
    }

    // B. Fallback to Cookies (Legacy)
    const allCookies = await chrome.cookies.getAll({ name: "token" });
    const cookie = allCookies.find(c => c.domain.includes("onrender.com") || c.domain.includes("vercel.app") || c.domain.includes("localhost") || c.domain.includes("127.0.0.1"));
    
    if (cookie?.value) {
      console.log("⚠️ Using token from Cookies (Fallback).");
      return { "Authorization": `Bearer ${cookie.value}` };
    }

    return {};
  } catch (err) {
    console.error("Failed to get auth header:", err);
    return {};
  }
};

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "save-to-galaxy") return;

  const content = info.selectionText || "";
  const url = tab.url;
  const title = tab.title;

  // Uses the new unified auth header helper
  const authHeader = await getAuthHeader();

  try {
    const response = await fetch(`${CONFIG.API_URL}/items/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader
      },
      credentials: "include",
      body: JSON.stringify({
        url,
        title,
        summary: content || "Quick capture from context menu.",
        tags: ["quick-capture"],
        source: new URL(url).hostname
      })
    });

    if (response.ok) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon128.png",
        title: "Memory Captured!",
        message: "Saved to your Knowledge Galaxy."
      });
    } else {
      // Response status dekho console mein
      console.error("Save failed - status:", response.status, await response.text());
    }

  } catch (error) {
    console.error("Network error:", error);
  }
});