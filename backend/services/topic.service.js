import Topic from "../models/topic.model.js";
import Item from "../models/item.model.js";
import generateTopicName from "./ai/generateTopicName.js";

export async function handleTopic({ userId, clusterId, itemId, tags }) {
  try {

    let topic = await Topic.findOne({
      user: userId,
      clusterId
    });

    if (topic) {
      topic.itemCount += 1;
      await topic.save();
      await Item.findByIdAndUpdate(itemId, { topicId: topic._id });
      return topic;
    }

    const itemCount = await Item.countDocuments({ user: userId, clusterId });

    if (itemCount < 2) {
      return null;
    }

    const items = await Item.find({ user: userId, clusterId }).limit(5);
    const topicName = await generateTopicName(items);

    topic = await Topic.create({
      user: userId,
      clusterId,
      topicName,
      itemCount
    });

    // link cluster items to topic
    await Item.updateMany(
      { user: userId, clusterId },
      { $set: { topicId: topic._id } }
    );

    return topic;

    return topic;

  } catch (error) {
    console.error("Topic handling error:", error);
    return null;
  }
}