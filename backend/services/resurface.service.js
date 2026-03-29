import Item from "../models/item.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

/**
 * Record a user interaction and track topic affinity
 */
export async function logInteraction(itemId, action) {
  try {
    const update = {};
    const inc = {};

    if (action === "view") {
      update.lastAccessedAt = new Date();
      inc.accessCount = 1;
    } else if (action === "like") {
      inc["interactions.likes"] = 1;
    } else if (action === "skip") {
      inc["interactions.skips"] = 1;
    }

    const updateQuery = {};
    if (Object.keys(update).length > 0) updateQuery.$set = update;
    if (Object.keys(inc).length > 0) updateQuery.$inc = inc;

    let updatedItem = null;
    if (Object.keys(updateQuery).length > 0) {
      updatedItem = await Item.findByIdAndUpdate(itemId, updateQuery, { new: true }).select('tags user');
    }

    // 🏷️ TOPIC AFFINITY TRACKING
    if (updatedItem && (action === "view" || action === "like")) {
      const tags = updatedItem.tags || [];
      if (tags.length > 0) {
        const tagUpdates = {};
        tags.forEach(tag => {
          // Increment each tag in the topicAffinity map
          tagUpdates[`topicAffinity.${tag}`] = 1;
        });

        await User.findByIdAndUpdate(updatedItem.user, {
          $inc: tagUpdates
        });
      }
    }
  } catch (error) {
    console.error("Failed to log interaction:", error);
  }
}

/**
 * 🏷️ Helper: Calculate overlap ratio between item tags and context tags
 */
function getTagSimilarity(itemTags = [], contextTags = []) {
  if (!contextTags || contextTags.length === 0) return 0;

  const matches = itemTags.filter(tag =>
    contextTags.includes(tag)
  ).length;

  return matches / contextTags.length; // 0.0 to 1.0
}

/**
 * 🎯 Helper: Calculate long-term affinity based on user tag preferences
 */
function getAffinityScore(itemTags = [], userPreferences = {}) {
  if (!itemTags || !userPreferences) return 0;

  let score = 0;
  itemTags.forEach(tag => {
    if (userPreferences[tag]) {
      score += userPreferences[tag];
    }
  });

  // Normalize: 20+ interactions on a topic = 1.0 (Full interest)
  return Math.min(1, score / 20);
}

export async function getResurfaceItems(userId, options = {}) {
  const { contextTags = [] } = options;
  try {
    // 🧠 Fetch User Preferences
    const user = await User.findById(userId).select('topicAffinity');
    const userPreferences = user?.topicAffinity ? Object.fromEntries(user.topicAffinity) : {};

    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const thisYear = now.getFullYear();

    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const uid = new mongoose.Types.ObjectId(userId);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    // 1. "On This Day" — same day & month, any previous year
    const onThisDayItems = await Item.aggregate([
      {
        $match: {
          user: uid,
          $expr: {
            $and: [
              { $eq: [{ $month: "$createdAt" }, month] },
              { $eq: [{ $dayOfMonth: "$createdAt" }, day] },
              { $lt: [{ $year: "$createdAt" }, thisYear] }
            ]
          },
          $or: [
            { lastAccessedAt: { $lt: oneDayAgo } },
            { lastAccessedAt: null }
          ]
        }
      },
      { $limit: 8 }
    ]);

    // 2. Forgotten/cold items — not accessed in 30+ days
    // We allow these more freely if the user is looking at them now (session stability)
    const forgottenItems = await Item.find({
      user: userId,
      lastAccessedAt: { $lt: oneMonthAgo },
      $or: [
        { lastSurfacedAt: { $lt: sevenDaysAgo } },
        { lastSurfacedAt: null }
      ]
    })
      .sort({ "interactions.likes": -1, accessCount: -1 })
      .limit(10)
      .lean();

    // 3. Random serendipity pick - fallback for small collections
    const randomItems = await Item.aggregate([
      {
        $match: {
          user: uid,
          $and: [
            {
              $or: [
                { lastAccessedAt: { $lt: oneDayAgo } },
                { lastAccessedAt: null }
              ]
            },
            {
              $or: [
                { lastSurfacedAt: { $lt: twoHoursAgo } },
                { lastSurfacedAt: null }
              ]
            }
          ]
        }
      },
      { $sample: { size: 8 } }
    ]);

    // Merge and DEDUPLICATE by string _id
    const seen = new Set();
    const allCandidates = [...onThisDayItems, ...forgottenItems, ...randomItems].filter(item => {
      const id = item._id.toString();
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    // Determine reason
    const onThisDayIds = new Set(onThisDayItems.map(i => i._id.toString()));

    // Scoring
    const scored = allCandidates.map(item => {
      const lastAccess = item.lastAccessedAt
        ? new Date(item.lastAccessedAt)
        : new Date(item.createdAt);
      const daysSinceAccess = (Date.now() - lastAccess.getTime()) / 86400000;
      const coldBonus = Math.min(1, daysSinceAccess / 90);

      const likes = item.interactions?.likes || 0;
      const skips = item.interactions?.skips || 0;
      const views = item.accessCount || 0;
      const importance = Math.max(0, (likes * 2) + (views * 0.2) - (skips * 2));

      const isOnThisDay = onThisDayIds.has(item._id.toString());
      const dayBonus = isOnThisDay ? 0.5 : 0;

      let contextScore = getTagSimilarity(item.tags, contextTags);

      // 🎯 Fix 1: Only meaningful matches count
      if (contextScore < 0.3) {
        contextScore = 0;
      }

      // 🧠 Calculate Long-term Affinity Score
      const affinityScore = getAffinityScore(item.tags, userPreferences);

      // Rebalanced weightings (25% each)
      const finalScore =
        (coldBonus * 0.25) +
        (importance * 0.25) +
        (contextScore * 0.25) +
        (affinityScore * 0.25) +
        dayBonus;

      // 🎯 Fix 3: Explainability
      let reason = "Rediscovered memory";
      if (isOnThisDay) {
        reason = "Time Capsule";
      } else if (contextScore >= 0.3) {
        reason = "Related to your focus";
      }

      return {
        ...item,
        _score: parseFloat(finalScore.toFixed(3)),
        resurfaceReason: reason
      };
    });

    // Sort, deduplicate titles for diversity, take top 5
    // Sort, deduplicate titles for diversity, take top 5
    const sortedByScore = scored.sort((a, b) => b._score - a._score);

    const seenTitles = new Set();
    const finalFeed = [];
    for (const item of sortedByScore) {
      if (finalFeed.length >= 5) break;
      const titleKey = item.title?.toLowerCase().trim();
      if (seenTitles.has(titleKey)) continue;
      seenTitles.add(titleKey);
      finalFeed.push(item);
    }

    // 🚀 Fallback for small collections (like yours!)
    if (finalFeed.length === 0) {
      const allItemsCount = await Item.countDocuments({ user: uid });
      if (allItemsCount > 0) {
        const fallbackItems = await Item.aggregate([
          {
            $match: {
              user: uid,
              $or: [
                { lastAccessedAt: { $lt: oneDayAgo } },
                { lastAccessedAt: null }
              ]
            }
          },
          { $sample: { size: 5 } }
        ]);

        finalFeed.push(...fallbackItems.map(item => ({
          ...item,
          _score: 0.1,
          resurfaceReason: "Memory Lane"
        })));
      }
    }

    // Fire-and-forget: mark as surfaced
    if (finalFeed.length > 0) {
      Item.updateMany(
        { _id: { $in: finalFeed.map(i => i._id) } },
        { $set: { lastSurfacedAt: new Date() } }
      ).catch(e => console.error("Failed to update lastSurfacedAt:", e));
    }

    return finalFeed;

  } catch (error) {
    console.error("Resurface service error:", error);
    throw error;
  }
}
