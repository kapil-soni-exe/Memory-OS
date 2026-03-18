import Item from "../models/item.model.js";
import mongoose from "mongoose";

/**
 * Resurfaces items for a specific user based on the current date,
 * or falls back to random items if none are found for "On This Day".
 * 
 * @param {string} userId - The ID of the user
 * @returns {Promise<Array>} - Array of resurfaced items
 */
export async function getResurfaceItems(userId) {
  try {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // getMonth is 0-indexed
    const currentDay = today.getDate();

    // 1. Try to find items saved on the same day and month in previous years
    let items = await Item.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          $expr: {
            $and: [
              { $eq: [{ $month: "$createdAt" }, currentMonth] },
              { $eq: [{ $dayOfMonth: "$createdAt" }, currentDay] },
              { $lt: [{ $year: "$createdAt" }, today.getFullYear()] } // Previous years only
            ]
          }
        }
      },
      { $limit: 5 },
      {
        $project: {
          _id: 1,
          id: "$_id",
          title: 1,
          summary: 1,
          createdAt: 1,
          tags: 1,
          url: 1,
          type: 1,
          image: 1,
          source: 1
        }
      }
    ]);

    // 2. If no "On This Day" items, fallback to random older items
    if (!items || items.length === 0) {
      console.log("No 'On This Day' items found. Falling back to random resurfacing.");
      
      items = await Item.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(userId)
          }
        },
        { $sample: { size: 5 } },
        {
          $project: {
            _id: 1,
            id: "$_id",
            title: 1,
            summary: 1,
            createdAt: 1,
            tags: 1,
            url: 1,
            type: 1,
            image: 1,
            source: 1
          }
        }
      ]);
    }

    return items;
  } catch (error) {
    console.error("Resurface service error:", error);
    throw error;
  }
}
