const CONFIG = {
  API_URL: "https://memory-os.onrender.com/api",
  DASHBOARD_URL: "https://memory-os-nine.vercel.app"
};

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
      // 1. Unpartitioned check
      let allCookies = await chrome.cookies.getAll({ name: "token" });
      let cookie = allCookies.find(c => c.domain.includes("onrender") || c.domain.includes("vercel") || c.domain.includes("localhost") || c.domain.includes("127.0.0.1"));
      console.log("1. All token cookies found:", allCookies);

      // 2. Partitioned check explicitly
      if (!cookie) {
        const partCookies = await chrome.cookies.getAll({
          url: "https://memory-os.onrender.com",
          partitionKey: { topLevelSite: "https://memory-os-nine.vercel.app" }
        });
        console.log("2. Partitioned token lookup:", partCookies);
        cookie = partCookies.find(c => c.name === "token");
      }

      // 3. Last fallback checking ANY onrender cookie
      if (!cookie) {
        const renderCookies = await chrome.cookies.getAll({ domain: "memory-os.onrender.com" });
        console.log("3. All OnRender cookies fallback:", renderCookies);
        cookie = renderCookies.find(c => c.name === "token");
      }

      if (cookie?.value) {
        console.log("Token successfully retrieved!");
        return { "Authorization": `Bearer ${cookie.value}` };
      }
      console.warn("Token NOT found anywhere.");
      return {};
    } catch (e) {
      console.warn("Failed to read cookies entirely:", e);
      return {};
    }
  };

  const authHeader = await getAuthHeader();
  const isAuth = !!authHeader.Authorization;

  // UI Status Update based on Auth
  const authStatusEl = document.getElementById("auth-status");
  const pulseDot = document.querySelector(".pulse-dot");
  if (!isAuth) {
    authStatusEl.textContent = "Offline";
    authStatusEl.style.color = "#ef4444";
    if (pulseDot) {
      pulseDot.style.background = "#ef4444";
      pulseDot.style.boxShadow = "0 0 8px #ef4444";
    }
  }

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
    try {
      extractedData = await chrome.tabs.sendMessage(tab.id, { action: "extract-metadata" });
      titlePreview.textContent = extractedData?.title || tab.title;
      const fallbackSummary = extractedData?.selection || extractedData?.description || "";
      if (fallbackSummary) {
        summaryInput.value = fallbackSummary.slice(0, 200) + (fallbackSummary.length > 200 ? "..." : "");
      }
    } catch (fallbackErr) {
      console.warn("Local extraction failed:", fallbackErr);
      titlePreview.textContent = tab.title;
    }
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
        statusEl.style.color = "#10b981";
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
      statusEl.style.color = "#ef4444";
      saveBtn.disabled = false;
      saveBtn.querySelector(".btn-text").textContent = "Try Again";
    }
  });

  // Open Dashboard link
  const dashboardLink = document.getElementById("open-dashboard");
  if (dashboardLink) {
    dashboardLink.addEventListener("click", () => {
      chrome.tabs.create({ url: isAuth ? `${CONFIG.DASHBOARD_URL}/home` : `${CONFIG.DASHBOARD_URL}/login` });
    });
  }
});