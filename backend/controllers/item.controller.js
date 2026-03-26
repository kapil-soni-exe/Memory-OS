import Item from "../models/item.model.js";
import { extractContentFromUrl } from "../services/contentExtractor.js";
import { cleanContent } from "../utils/contentCleaner.js";
import qdrant from "../config/qdrant.js"
import { detectContentType } from "../services/contentTypeDetector.js";

import { classifyNexusCapture } from "../services/ai/nexusCaptureService.js";
import { itemQueue } from "../config/queue.js";
import { extractImage } from "../services/extractors/imageExtractor.js";
import { extractPDF } from "../services/extractors/pdfExtractor.js";

// Create Item (Magic Capture)
/**
 * Magic Capture: Creates a new memory item.
 * Decides whether the input is a URL (Web Capture) or raw text (Nexus Capture).
 * Offloads heavy AI Tasks (Summary, Tags, Embeddings) to BullMQ.
 */
export const extractItem = async (req, res) => {
  try {
    const { url, content, type } = req.body;
    const input = (url || content || "").trim();

    if (!input) {
      return res.status(400).json({ message: "Content or URL is required" });
    }

    const isUrl = input.startsWith("http") ||
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9](?:\/.*)?$/i.test(input);

    if (isUrl) {
      const cleanUrl = input.startsWith("http") ? input : `https://${input}`;
      const tempType = detectContentType(cleanUrl, type);
      const extractData = await extractContentFromUrl(cleanUrl, tempType);

      return res.status(200).json({
        ...extractData,
        content: cleanContent(extractData?.content || ""),
        type: detectContentType(cleanUrl, type, extractData?.content)
      });
    } else {
      // Manual/Nexus Capture
      const nexusData = await classifyNexusCapture(input);
      return res.status(200).json({
        ...nexusData,
        content: input
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const saveItem = async (req, res) => {
  try {
    const { 
      url: providedUrl, 
      content: providedContent, 
      title: providedTitle, 
      type: providedType, 
      tags: providedTags,
      summary: providedSummary,
      image: providedImage,
      author: providedAuthor,
      source: providedSource,
      relatedItems 
    } = req.body;

    let finalItemData = {
      user: req.user,
      relatedItems,
      processingStatus: "processing"
    };

    // 1. If user provided pre-extracted data (Confirmed Save from Preview)
    if (providedTitle && (providedUrl || providedContent)) {
      finalItemData = {
        ...finalItemData,
        title: providedTitle,
        url: providedUrl,
        content: cleanContent(providedContent || ""),
        type: providedType || "note",
        tags: providedTags || [],
        summary: providedSummary,
        image: providedImage,
        author: providedAuthor,
        source: providedSource || "manual"
      };
    } 
    // 2. Handle File Upload
    else if (req.file) {
      const filePath = req.file.path;
      const fileUrl = `/uploads/${req.file.filename}`;
      const mimeType = req.file.mimetype;

      let extractedData = null;

      if (mimeType.startsWith("image/")) {
        extractedData = await extractImage(filePath);
        finalItemData = {
          ...finalItemData,
          title: extractedData.title,
          content: extractedData.content,
          type: "image",
          image: fileUrl,
          source: "manual"
        };
      } else if (mimeType === "application/pdf") {
        extractedData = await extractPDF(filePath);
        finalItemData = {
          ...finalItemData,
          title: extractedData.title,
          content: extractedData.content,
          type: "pdf",
          url: fileUrl,
          author: extractedData.metadata?.author,
          metadata: extractedData.metadata,
          source: "manual"
        };
      }
    } 
    // 3. Fallback: Quick Save (direct capture without explicit preview)
    else {
      const input = (providedUrl || providedContent || "").trim();
      if (!input) {
        return res.status(400).json({ message: "Content or URL is required" });
      }

      const isUrl = input.startsWith("http") ||
        /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9](?:\/.*)?$/i.test(input);

      if (isUrl) {
        const cleanUrl = input.startsWith("http") ? input : `https://${input}`;
        const tempType = detectContentType(cleanUrl, providedType);
        const extractData = await extractContentFromUrl(cleanUrl, tempType);

        finalItemData = {
          ...finalItemData,
          title: extractData?.title || "Untitled",
          url: cleanUrl,
          content: cleanContent(extractData?.content || ""),
          type: detectContentType(cleanUrl, providedType, extractData?.content),
          author: extractData?.author,
          image: extractData?.image,
          source: "web"
        };
      } else {
        const nexusData = await classifyNexusCapture(input);
        finalItemData = {
          ...finalItemData,
          title: nexusData.title,
          content: input,
          type: nexusData.type,
          source: "manual"
        };
      }
    }

    // Initial Save to MongoDB
    const item = await Item.create(finalItemData);

    // Offload AI Enrichment & Vector Indexing to the Background Queue (BullMQ)
    // This provides an instant response to the user.
    await itemQueue.add('item-processing', {
      itemId: item._id,
      userId: req.user.toString()
    });

    console.log(`[API] ➕ Added to processing queue: "${item.title}" (ID: ${item._id})`);

    res.status(201).json({
      message: "Memory saved! Processing in background...",
      item
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/**
 * Retrieves all items for the authenticated user.
 */
export const getAllItems = async (req, res) => {
  try {
    // Optimization: Exclude large 'content' field for list view
    const items = await Item.find({ user: req.user })
      .select("-content")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      items,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/**
 * Retrieves a single item decorated with populated related memories.
 */
export const getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate({
      path: 'relatedItems',
      select: 'title type summary image createdAt'
    });

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/**
 * Cascading Delete: Removes item from DB, vector from Qdrant, and updates Topic counts.
 */
export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    // 1. Sync with Vector Database (Qdrant)
    try {
      if (item.vectorId) {
        await qdrant.delete("items_vectors", {
          points: [item.vectorId],
        });
      }

      // Secondary safety check: delete by itemId payload to ensure no orphans
      await qdrant.delete("items_vectors", {
        filter: {
          must: [{
            key: "itemId",
            match: { value: item._id.toString() }
          }]
        }
      });
    } catch (qdrantError) {
      console.error("Failed to delete vector from Qdrant:", qdrantError.message);
    }

    // 2. Sync with Topic Engine
    if (item.clusterId) {
      try {
        const Topic = (await import("../models/topic.model.js")).default;
        const topic = await Topic.findOne({ user: req.user, clusterId: item.clusterId });

        if (topic) {
          if (topic.itemCount > 1) {
            topic.itemCount -= 1;
            await topic.save();
          } else {
            // Remove empty topics automatically
            await Topic.findByIdAndDelete(topic._id);
          }
        }
      } catch (topicError) {
        console.error("Failed to sync topic during deletion:", topicError.message);
      }
    }

    // 3. Remove Document from MongoDB
    await Item.findByIdAndDelete(req.params.id);

    res.json({
      message: "Item deleted and intelligence synced",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/**
 * Updates basic item metadata (Title/Type).
 */
export const updateItem = async (req, res) => {
  try {
    const { title, type } = req.body;
    const item = await Item.findOneAndUpdate(
      { _id: req.params.id, user: req.user },
      { title, type },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Item updated", item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
