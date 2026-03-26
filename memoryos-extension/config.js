const CONFIG = {
  API_URL: "https://memory-os.onrender.com/api",
  DASHBOARD_URL: "https://memory-os-nine.vercel.app"
};

// Use this for local dev:
// const CONFIG = {
//   API_URL: "http://localhost:3000/api"
// };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
} else {
  // For browser
  window.CONFIG = CONFIG;
}
