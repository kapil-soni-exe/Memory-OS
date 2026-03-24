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

    // 1. Fetch topic and items in parallel for performance
    // Use .lean() for faster execution as these are read-only
    const [topic, items] = await Promise.all([
      Topic.findOne({ _id: topicId, user: req.user }).lean(),
      Item.find({ user: req.user, topicId }).sort({ createdAt: -1 }).lean()
    ]);

    // 2. Security/Existence check
    if (!topic) {
      return res.status(404).json({
        message: "Topic not found",
      });
    }

    // 3. Fallback for items that might only have clusterId
    let finalItems = items;
    if (items.length === 0 && topic.clusterId) {
      finalItems = await Item.find({ 
        user: req.user, 
        clusterId: topic.clusterId
      }).sort({ createdAt: -1 }).lean();
    }

    res.status(200).json({
      topic,
      items: finalItems
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

    // 2. Delete vectors from Qdrant
    if (vectorIds.length > 0) {
      const qdrant = (await import("../config/qdrant.js")).default;
      try {
        await qdrant.delete("items_vectors", {
          points: vectorIds,
        });
      } catch (qError) {
        console.error("Qdrant bulk delete failed:", qError.message);
      }
    }

    // 3. Delete items from DB
    await Item.deleteMany({ user: req.user, clusterId });

    // 4. Delete the topic itself
    await Topic.findByIdAndDelete(topic._id);

    res.json({ message: "Topic and all associated memories deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
