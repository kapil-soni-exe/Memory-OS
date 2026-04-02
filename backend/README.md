# 🌌 MemoryOS: Backend (Node.js + Express)

The powerhouse of [MemoryOS](file:///../README.md), your immersive knowledge galaxy.

## 🚀 Dev Stack
- **Express 5** (High-performance Node.js framework)
- **MongoDB Atlas + Mongoose** for document storage.
- **Upstash Redis + BullMQ** for background workers (Scraping, OCR, AI synthesis).
- **Qdrant** for semantic vector search.

## 🏁 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Setup Env**:
   Populate the `.env` file with your credentials (MongoDB, OpenAI, Cohere, Redis, etc.).
3. **Run Dev**:
   ```bash
   npm run dev 
   ```

## 🏗️ Architecture
- **Controllers**: Thin handlers for frontend requests.
- **Services**: Business logic (AI synthesis, knowledge graph builders).
- **Workers**: BullMQ workers for background jobs (Video parsing, OCR).
- **Middleware**: Security (Helmet), Rate-limiting, and Auth (JWT).
