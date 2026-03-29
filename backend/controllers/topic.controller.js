import Topic from "../models/topic.model.js";
import Item from "../models/item.model.js";

// Get All Topics
export const getAllTopics = async (req, res) => {
  try {
    const topics = await Topic.find({ user: req.user }).sort({ updatedAt: -1 });
    res.status(200).json(topics);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Single Topic with Items
export const getTopicById = async (req, res) => {
  try {
    const topicId = req.params.id;

    // 1. Fetch topic (with parent info), items, and sub-topics in parallel
    const [topic, items, subTopics] = await Promise.all([
      Topic.findOne({ _id: topicId, user: req.user }).populate("parentTopicId", "topicName").lean(),
      Item.find({ user: req.user, topicId }).sort({ createdAt: -1 }).lean(),
      Topic.find({ user: req.user, parentTopicId: topicId }).sort({ topicName: 1 }).lean()
    ]);

    // 2. Security/Existence check
    if (!topic) {
      return res.status(404).json({
        message: "Topic not found",
      });
    }

    // 3. Fallback for items that might only have clusterId (legacy compatibility)
    let finalItems = items;
    if (items.length === 0 && topic.clusterId && subTopics.length === 0) {
      finalItems = await Item.find({ 
        user: req.user, 
        clusterId: topic.clusterId
      }).sort({ createdAt: -1 }).lean();
    }

    res.status(200).json({
      topic,
      items: finalItems,
      subTopics // New field for hierarchical UI
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// Delete Topic and all associated Items
export const deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findOne({ _id: req.params.id, user: req.user });

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    const { clusterId } = topic;

    // 1. Find all items in this cluster
    const items = await Item.find({ user: req.user, clusterId });
    const vectorIds = items.map(i => i.vectorId).filter(id => !!id);

    // 3. Delete from items_vectors
    if (vectorIds.length > 0) {
      const qdrant = (await import("../config/qdrant.js")).default;
      try {
        await qdrant.delete("items_vectors", {
          points: vectorIds,
        });
      } catch (qError) {
        console.error("Qdrant items bulk delete failed:", qError.message);
      }
    }

    // 4. Delete the topic vector itself from topics_vectors
    const qdrant = (await import("../config/qdrant.js")).default;
    const { v5: uuidv5 } = await import("uuid");
    const TOPIC_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    const topicVectorId = uuidv5(topic._id.toString(), TOPIC_NAMESPACE);

    try {
      await qdrant.delete("topics_vectors", {
        points: [topicVectorId],
      });
      console.log(`[TopicEngine] Deleted topic vector ${topicVectorId} from Qdrant`);
    } catch (qError) {
      console.error("Qdrant topic vector delete failed:", qError.message);
    }

    // 5. Delete items from DB
    await Item.deleteMany({ user: req.user, clusterId });

    // 6. Delete the topic itself from MongoDB
    await Topic.findByIdAndDelete(topic._id);

    res.json({ message: "Topic and all associated memories deleted from DB and Galaxy" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
