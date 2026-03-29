import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    clusterId: {
      type: String,
      required: true,
      index: true
    },

    topicName: {
      type: String,
      required: true,
      trim: true
    },

    parentTopicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      default: null,
      index: true
    },

    level: {
      type: Number,
      default: 1,
      max: 3 // Avoid runaway nesting
    },

    confidence: {
      type: Number,
      default: 0
    },

    reason: {
      type: String,
      default: ""
    },

    isMerged: {
      type: Boolean,
      default: false
    },

    centroid: {
      type: [Number],
      default: []
    },

    tags: {
      type: [String],
      default: []
    },

    itemCount: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
);

//  PREVENT DUPLICATE TOPICS (VERY IMPORTANT)
topicSchema.index({ user: 1, clusterId: 1 }, { unique: true });

// Unified index for user-specific hierarchical lookups
topicSchema.index({ user: 1, parentTopicId: 1 });

const Topic = mongoose.model("Topic", topicSchema);

export default Topic;