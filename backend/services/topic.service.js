import Topic from "../models/topic.model.js";
import Item from "../models/item.model.js";
import generateTopicName from "./ai/generateTopicName.js";
import * as topicDetection from "./ai/topicDetection.service.js";
import qdrant from "../config/qdrant.js";

export async function handleTopic({ userId, clusterId, itemId, tags, embedding }) {
  try {

    // ─────────────────────────────────────────
    // CASE 1: Topic already exists — update karo
    // ─────────────────────────────────────────
    let topic = await Topic.findOne({ user: userId, clusterId });

    if (topic) {
      const oldCount = topic.itemCount; // ✅ Pehle capture karo
      topic.itemCount += 1;

      // Tags update karo
      if (tags?.length > 0) {
        const tagSet = new Set(topic.tags || []);
        tags.forEach(t => tagSet.add(t));
        topic.tags = Array.from(tagSet).slice(0, 15);
      }

      // ✅ Centroid moving average — sahi math
      if (embedding && topic.centroid?.length > 0) {
        topic.centroid = topic.centroid.map((val, i) =>
          (val * oldCount + embedding[i]) / topic.itemCount
        );
      }

      await topic.save();

      // Qdrant sync karo
      if (topic.centroid?.length > 0) {
        await topicDetection.upsertTopicVector(
          topic._id, topic.centroid, topic.topicName, userId, topic.level
        );
      }

      await Item.findByIdAndUpdate(itemId, { topicId: topic._id });
      return topic;
    }

    // ─────────────────────────────────────────
    // CASE 2: Cluster mein abhi koi item nahi — skip
    // ─────────────────────────────────────────
    const itemCount = await Item.countDocuments({ user: userId, clusterId });
    if (itemCount < 1) return null;

    // ─────────────────────────────────────────
    // Naya topic ke liye data prepare karo
    // ─────────────────────────────────────────
    const items = await Item.find({ user: userId, clusterId }).limit(10);
    const topicName = await generateTopicName(items);

    // Cluster ke saare embeddings fetch karo centroid ke liye
    const clusterVectors = await qdrant.scroll("items_vectors", {
      filter: {
        must: [
          { key: "user", match: { value: userId.toString() } },
          { key: "clusterId", match: { value: clusterId } }
        ]
      },
      limit: 100, // ✅ 50 se 100 kiya — zyada accurate centroid
      with_vector: true
    });

    const embeddings = clusterVectors.points.map(p => p.vector).filter(Boolean);
    const initialCentroid = topicDetection.calculateCentroid(embeddings);

    // 🪐 Parent dhundo
    const detection = await topicDetection.findLogicalParent(topicName, initialCentroid, userId);

    console.log(`[TopicEngine] Detection result for "${topicName}":`, detection);

    // ─────────────────────────────────────────
    // CASE 3: Merge — existing topic mein absorb karo
    // ─────────────────────────────────────────
    if (detection.isMergeCandidate && detection.parentTopicId) {
      const existingTopic = await Topic.findById(detection.parentTopicId);

      if (existingTopic) {
        console.log(`[TopicEngine] 🔄 Merging "${topicName}" into "${existingTopic.topicName}"`);

        // Items ko existing topic aur cluster mein move karo
        await Item.updateMany(
          { user: userId, clusterId },
          { $set: { topicId: existingTopic._id, clusterId: existingTopic.clusterId } }
        );

        // ✅ Centroid weighted average — sahi math
        const oldCount = existingTopic.itemCount;
        existingTopic.itemCount += itemCount;

        if (existingTopic.centroid?.length > 0 && initialCentroid) {
          existingTopic.centroid = existingTopic.centroid.map((val, i) =>
            (val * oldCount + initialCentroid[i] * itemCount) / existingTopic.itemCount
          );
        }

        // ✅ Tags bhi merge karo
        const tagSet = new Set(existingTopic.tags || []);
        items.forEach(it => (it.tags || []).forEach(t => tagSet.add(t)));
        existingTopic.tags = Array.from(tagSet).slice(0, 15);

        await existingTopic.save();

        await topicDetection.upsertTopicVector(
          existingTopic._id,
          existingTopic.centroid,
          existingTopic.topicName,
          userId,
          existingTopic.level
        );

        return existingTopic;
      }
    }

    // ─────────────────────────────────────────
    // CASE 4: Naya topic banao
    // (Sub-topic bhi yahi se banega — parentTopicId set hoga)
    // ─────────────────────────────────────────
    const mergedTags = new Set();
    items.forEach(it => (it.tags || []).forEach(t => mergedTags.add(t)));

    topic = await Topic.create({
      user: userId,
      clusterId,
      topicName,
      itemCount,
      parentTopicId: detection.parentTopicId,   // ✅ Parent set hoga agar sub-topic hai
      level: detection.level || 1,               // ✅ Level 2 ya 3 hoga agar child hai
      isMergeCandidate: false,
      confidence: detection.confidence || 0,
      reason: detection.reason || "",
      centroid: initialCentroid,
      tags: Array.from(mergedTags).slice(0, 15)
    });

    // Qdrant mein sync karo
    await topicDetection.upsertTopicVector(
      topic._id, initialCentroid, topicName, userId, topic.level
    );

    // Items link karo
    await Item.updateMany(
      { user: userId, clusterId },
      { $set: { topicId: topic._id } }
    );

    console.log(`[TopicEngine] 🗄️ Created "${topicName}" | Level: ${topic.level} | Parent: ${topic.parentTopicId || 'None'}`);

    return topic;

  } catch (error) {
    console.error("Topic handling error:", error);
    return null;
  }
}