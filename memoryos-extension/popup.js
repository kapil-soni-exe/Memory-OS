document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const titlePreview = document.getElementById("title-preview");
  const urlPreview = document.getElementById("url-preview");
  const saveBtn = document.getElementById("save-btn");
  const statusEl = document.getElementById("status-message");
  const tagsInput = document.getElementById("tags");
  const summaryInput = document.getElementById("summary");

  // Get metadata from content script
  try {
    const [response] = await chrome.tabs.sendMessage(tab.id, { action: "extract-metadata" });
    if (response) {
      titlePreview.textContent = response.title;
      urlPreview.textContent = new URL(response.url).hostname;
      if (response.description) {
        summaryInput.value = response.description;
      }
      if (response.selection) {
        summaryInput.value = `Highlight: "${response.selection}"\n\n${summaryInput.value}`;
      }
    }
  } catch (err) {
    // If content script not loaded (e.g. chrome:// urls)
    titlePreview.textContent = tab.title;
    urlPreview.textContent = new URL(tab.url).hostname;
  }

  saveBtn.addEventListener("click", async () => {
    saveBtn.disabled = true;
    saveBtn.querySelector(".btn-text").textContent = "Capturing...";
    
    const tags = tagsInput.value.split(',').map(t => t.trim()).filter(t => t);
    const summary = summaryInput.value;

    try {
      const resp = await fetch("http://localhost:3000/api/items/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: tab.url,
          title: titlePreview.textContent,
          summary: summary || "Captured via MemoryOS Extension",
          tags: tags.length > 0 ? tags : ["extension-save"],
          source: new URL(tab.url).hostname
        })
      });

      if (resp.ok) {
        statusEl.textContent = "Memory Added Successfully! ✨";
        statusEl.style.color = "#2cb67d";
        saveBtn.querySelector(".btn-text").textContent = "Saved!";
        
        setTimeout(() => window.close(), 1500);
      } else {
        throw new Error("Server rejected save");
      }
    } catch (error) {
      statusEl.textContent = "Error: Galaxy connection failed.";
      statusEl.style.color = "#ef4565";
      saveBtn.disabled = false;
      saveBtn.querySelector(".btn-text").textContent = "Try Again";
    }
  });
});