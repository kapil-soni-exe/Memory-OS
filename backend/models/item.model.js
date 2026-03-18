import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    // Owner of this saved item
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Title of the saved content
    title: String,

    // Original source URL
    url: String,

    // Clean extracted text used for AI processing
    content: String,

    // Type of saved content
    type: {
      type: String,
      enum: ["article", "video", "tweet", "pdf", "image", "note", "thought", "book", "task", "quote", "code"],
      default: "note",
    },

    // Author or creator of the content
    author: String,

    // Thumbnail / preview image
    image: String,

    // AI generated tags
    tags: [String],

    // AI generated summary
    summary: String,

    // Flexible metadata for different platforms
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Similar items detected by the system
    relatedItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
      },
    ],

    // Vector ID stored in Qdrant
    vectorId: {
      type: String,
      default: null,
    },
    // clustering
    clusterId: {
      type: String,
      index: true,
      default: null
    },
    // Explicit topic link
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      index: true,
      default: null
    },
    // AI processing state
    processingStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },

    // Source of the saved item
    source: {
      type: String,
      enum: ["web", "extension", "api", "manual"],
      default: "web",
    },
  },
  { timestamps: true }
);


// Prevent same URL being saved multiple times by the same user
itemSchema.index(
  { user: 1, url: 1 },
  {
    unique: true,
    partialFilterExpression: { url: { $type: "string" } },
  }
);


// Text search index for keyword search
itemSchema.index({
  title: "text",
  content: "text",
  summary: "text",
  tags: "text",
});

// Cluster queries
itemSchema.index({ user: 1, clusterId: 1 });


// Fast tag filtering
itemSchema.index({ tags: 1 });

export default mongoose.model("Item", itemSchema);