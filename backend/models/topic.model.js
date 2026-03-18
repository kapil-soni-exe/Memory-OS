import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    clusterId: {
      type: String,
      required: true,
      index: true
    },

    topicName: {
      type: String,
      required: true
    },

    itemCount: {
      type: Number,
      default: 1
    },

    keywords: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

const Topic = mongoose.model("Topic", topicSchema);

export default Topic;