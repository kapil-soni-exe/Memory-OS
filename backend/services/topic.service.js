import Topic from "../models/topic.model.js";
import Item from "../models/item.model.js";
import generateTopicName from "./ai/generateTopicName.js";

export async function handleTopic({ userId, clusterId, itemId, tags }) {
  try {

    console.log("handleTopic triggered:", clusterId);

    let topic = await Topic.findOne({
      user: userId,
      clusterId
    });

    // topic already exists
    if (topic) {

      topic.itemCount += 1;

      await topic.save();

      // link item to topic
      await Item.findByIdAndUpdate(itemId, {
        topicId: topic._id
      });

      return topic;
    }

    const itemCount = await Item.countDocuments({
      user: userId,
      clusterId
    });

    if (itemCount < 2) {
      console.log(`Not enough items for cluster ${clusterId} to form a topic (Count: ${itemCount})`);
      return null;
    }

    const items = await Item.find({
      user: userId,
      clusterId
    }).limit(5);

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

    console.log("Topic created:", topicName);

    return topic;

  } catch (error) {
    console.error("Topic handling error:", error);
    return null;
  }
}