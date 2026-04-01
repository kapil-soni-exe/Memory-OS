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
// Delete Topic and all associated Items (Hierarchical/Recursive)
export const deleteTopic = async (req, res) => {
  try {
    const targetTopicId = req.params.id;
    const userId = req.user.toString();

    // 1. Fetch the entire hierarchy (Max Level 3)
    const level1 = await Topic.findOne({ _id: targetTopicId, user: req.user });
    if (!level1) return res.status(404).json({ message: "Topic not found" });

    const level2 = await Topic.find({ parentTopicId: targetTopicId, user: req.user });
    const level2Ids = level2.map(t => t._id);
    
    const level3 = await Topic.find({ parentTopicId: { $in: level2Ids }, user: req.user });

    const allTopics = [level1, ...level2, ...level3];
    const topicIds = allTopics.map(t => t._id.toString());
    const clusterIds = allTopics.map(t => t.clusterId).filter(id => !!id);

    console.log(`[TopicEngine] 🧨 Deep Purging Topic Tree: ${level1.topicName} (${topicIds.length} topics, ${clusterIds.length} clusters)`);

    // 2. Robust Vector Cleanup (Search & Destroy)
    const qdrant = (await import("../config/qdrant.js")).default;

    try {
      // A. Delete all topic vectors in the tree
      await qdrant.delete("topics_vectors", {
        filter: {
          must: [
            {
              key: "user",
              match: { value: userId }
            },
            {
              key: "topicId",
              match: { any: topicIds }
            }
          ]
        }
      });
      console.log(`   ✅ All ${topicIds.length} topic vectors purged from topics_vectors`);

      // B. Delete all item vectors for all clusters in the tree
      await qdrant.delete("items_vectors", {
        filter: {
          must: [
            {
              key: "user",
              match: { value: userId }
            },
            {
              key: "clusterId",
              match: { any: clusterIds }
            }
          ]
        }
      });
      console.log(`   ✅ All items vectors for ${clusterIds.length} clusters purged from items_vectors`);

    } catch (qError) {
      console.error(`[TopicEngine] ❌ Qdrant sync failure: ${qError.message}`);
    }

    // 3. Delete from MongoDB
    const deleteItemsResult = await Item.deleteMany({ user: req.user, clusterId: { $in: clusterIds } });
    const deleteTopicsResult = await Topic.deleteMany({ _id: { $in: topicIds }, user: req.user });

    console.log(`[TopicEngine] 🗑️  MongoDB: Deleted ${deleteTopicsResult.deletedCount} topics and ${deleteItemsResult.deletedCount} items.`);

    res.json({ 
      message: `Topic tree '${level1.topicName}' and all associated contents deleted.`,
      deletedTopics: deleteTopicsResult.deletedCount,
      deletedItems: deleteItemsResult.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
