import dotenv from "dotenv";
dotenv.config();

import qdrant from "./config/qdrant.js";


await qdrant.createPayloadIndex("items_vectors", {
  field_name: "user",
  field_schema: "keyword"
});

await qdrant.createPayloadIndex("items_vectors", {
  field_name: "clusterId",
  field_schema: "keyword"
});


console.log("Collection and indexes created successfully"); 