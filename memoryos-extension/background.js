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

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "save-to-galaxy") return;

  const content = info.selectionText || "";
  const url = tab.url;
  const title = tab.title;

  // Cookie fetch
  let authHeader = {};
  try {
    const allCookies = await chrome.cookies.getAll({ name: "token" });
    const cookie = allCookies.find(c => c.domain.includes("onrender.com") || c.domain.includes("vercel.app") || c.domain.includes("localhost") || c.domain.includes("127.0.0.1"));
    
    if (cookie?.value) {
      authHeader = { "Authorization": `Bearer ${cookie.value}` };
    }
  } catch (err) {
    console.error("Failed to get cookie:", err);
  }

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