// MemoryOS Background Service Worker
importScripts('config.js');

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-to-galaxy",
    title: "Add to Knowledge Galaxy",
    contexts: ["selection", "page"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "save-to-galaxy") {
    const content = info.selectionText || "";
    const url = tab.url;
    const title = tab.title;

    // Send to background for processing
    try {
      const response = await fetch(`${CONFIG.API_URL}/items/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
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
      }
    } catch (error) {
      console.error("Save failed:", error);
    }
  }
});
