import dotenv from "dotenv";
dotenv.config();

import qdrant from "./config/qdrant.js";

await qdrant.createPayloadIndex("items_vectors", {
  field_name: "itemId",
  field_schema: "keyword"
});

console.log("✅ itemId index created");