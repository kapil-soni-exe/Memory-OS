document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const titlePreview = document.getElementById("title-preview");
  const urlPreview = document.getElementById("url-preview");
  const saveBtn = document.getElementById("save-btn");
  const discardBtn = document.getElementById("discard-btn");
  const statusEl = document.getElementById("status-message");
  const tagsInput = document.getElementById("tags");
  const summaryInput = document.getElementById("summary");

  let extractedData = null;

  // Initialize UI
  titlePreview.textContent = "Analyzing Memory...";
  urlPreview.textContent = new URL(tab.url).hostname;
  saveBtn.disabled = true;

  // Helper to get auth header from cookies
  const getAuthHeader = async () => {
    try {
      // Get the token cookie for the render domain
      const cookie = await chrome.cookies.get({
        url: "https://memory-os.onrender.com",
        name: "token"
      });
      return cookie ? { "Authorization": `Bearer ${cookie.value}` } : {};
    } catch (e) {
      console.warn("Failed to read cookies:", e);
      return {};
    }
  };

  // 1. PHASE 1: Extraction (Server-side for high fidelity)
  try {
    const authHeader = await getAuthHeader();
    const response = await fetch(`${CONFIG.API_URL}/items/extract`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...authHeader
      },
      credentials: "include",
      body: JSON.stringify({ url: tab.url })
    });

    if (!response.ok) throw new Error("Extraction failed");
    
    extractedData = await response.json();
    
    titlePreview.textContent = extractedData.title;
    summaryInput.value = extractedData.content.slice(0, 200) + "..."; // Show snippet
    saveBtn.disabled = false;
  } catch (err) {
    console.warn("Server extraction failed, falling back to local metadata.");
    titlePreview.textContent = tab.title;
    saveBtn.disabled = false;
  }

  // DISCARD action
  discardBtn.addEventListener("click", () => {
    window.close();
  });

  // SAVE action
  saveBtn.addEventListener("click", async () => {
    saveBtn.disabled = true;
    saveBtn.querySelector(".btn-text").textContent = "Saving...";
    
    const tags = tagsInput.value.split(',').map(t => t.trim()).filter(t => t);
    const summary = summaryInput.value;

    try {
      const authHeader = await getAuthHeader();
      const resp = await fetch(`${CONFIG.API_URL}/items/save`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...authHeader
        },
        credentials: "include",
        body: JSON.stringify({
          url: tab.url,
          title: titlePreview.textContent,
          content: extractedData?.content || "", 
          summary: summary || "Captured via MemoryOS Extension",
          tags: tags.length > 0 ? tags : ["extension-save"],
          image: extractedData?.image,
          author: extractedData?.author,
          type: extractedData?.type || "web",
          source: new URL(tab.url).hostname
        })
      });

      if (resp.status === 401) {
        throw new Error("UNAUTHORIZED");
      }

      if (resp.ok) {
        statusEl.textContent = "Memory Added Successfully! ✨";
        statusEl.style.color = "#2cb67d";
        saveBtn.querySelector(".btn-text").textContent = "Saved!";
        setTimeout(() => window.close(), 1500);
      } else {
        throw new Error("Server rejected save");
      }
    } catch (error) {
      if (error.message === "UNAUTHORIZED") {
        statusEl.textContent = "Error: Please login to Dashboard first.";
      } else {
        statusEl.textContent = "Error: Galaxy connection failed.";
      }
      statusEl.style.color = "#ef4565";
      saveBtn.disabled = false;
      saveBtn.querySelector(".btn-text").textContent = "Try Again";
    }
  });

  // Open Dashboard link
  const dashboardLink = document.getElementById("open-dashboard");
  if (dashboardLink) {
    dashboardLink.addEventListener("click", () => {
      chrome.tabs.create({ url: CONFIG.DASHBOARD_URL });
    });
  }
});