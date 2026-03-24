import Item from "../models/item.model.js";
import mongoose from "mongoose";

export async function logInteraction(itemId, action) {
  try {
    const update = { lastAccessedAt: new Date() };
    const inc = {};
    if (action === "view")  inc.accessCount = 1;
    if (action === "like")  inc["interactions.likes"] = 1;
    if (action === "skip")  inc["interactions.skips"] = 1;
    await Item.findByIdAndUpdate(itemId, { $set: update, $inc: inc });
  } catch (error) {
    console.error("Failed to log interaction:", error);
  }
}

export async function getResurfaceItems(userId) {
  try {
    const now      = new Date();
    const month    = now.getMonth() + 1;
    const day      = now.getDate();
    const thisYear = now.getFullYear();

    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const uid = new mongoose.Types.ObjectId(userId);
    const fifteenMinsAgo = new Date(now.getTime() - 15 * 60 * 1000);
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
          }
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
        { lastSurfacedAt: { $gt: fifteenMinsAgo } }, // Session stability
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
          $or: [
            { lastSurfacedAt: { $lt: twoHoursAgo } },
            { lastSurfacedAt: { $gt: fifteenMinsAgo } }, // Session stability
            { lastSurfacedAt: null }
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
      const coldBonus   = Math.min(1, daysSinceAccess / 90);

      const likes   = item.interactions?.likes  || 0;
      const skips   = item.interactions?.skips  || 0;
      const views   = item.accessCount || 0;
      const importance = Math.max(0, (likes * 2) + (views * 0.2) - (skips * 2));

      const isOnThisDay = onThisDayIds.has(item._id.toString());
      const dayBonus    = isOnThisDay ? 0.5 : 0;

      const finalScore = (coldBonus * 0.4) + (importance * 0.3) + dayBonus;

      return {
        ...item,
        _score: parseFloat(finalScore.toFixed(3)),
        resurfaceReason: isOnThisDay ? "Time Capsule" : "Rediscovered memory"
      };
    });

    // Sort, deduplicate titles for diversity, take top 5
    // Sort, deduplicate titles for diversity, take top 5
    const sortedByScore = scored.sort((a, b) => b._score - a._score);

    const seenTitles = new Set();
    const finalFeed  = [];
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
          { $match: { user: uid } },
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
