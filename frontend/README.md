# 🪐 MemoryOS: Frontend (Vite + React)

The frontend for [MemoryOS](file:///../README.md), your immersive knowledge galaxy.

## 🚀 Dev Stack
- **React 19** with Vite 8 (Ultra-fast HMR)
- **TanStack Query v5** for robust data fetching.
- **D3.js** for the Knowledge Galaxy visualization.
- **Framer Motion** for premium interface animations.
- **Lucide React** for modern icons.

## 🏁 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Setup Env**:
   Create a `.env` file based on your project configuration (Vite prefix required, e.g., `VITE_API_URL`).
3. **Run Dev**:
   ```bash
   npm run dev
   ```

## 🏗️ Architecture
We follow a modular feature-based architecture located in `src/modules/` (Auth, Composer, Items, Nexus). Layouts are separated between the `MainLayout` and the `SecondDraft` studio.
