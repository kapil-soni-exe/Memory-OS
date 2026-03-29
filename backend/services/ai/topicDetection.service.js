import qdrant from "../../config/qdrant.js";
import OpenAI from "openai";
import { v5 as uuidv5 } from "uuid";

const TOPIC_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

// ✅ Collection ek baar check karo, baar baar nahi
let collectionReady = false;

/**
 * 🧮 Centroid calculate karo (average of all vectors)
 */
export function calculateCentroid(embeddings = []) {
  if (embeddings.length === 0) return null;
  const dims = embeddings[0].length;
  const centroid = new Array(dims).fill(0);
  embeddings.forEach(vector => {
    for (let i = 0; i < dims; i++) centroid[i] += vector[i];
  });
  return centroid.map(sum => sum / embeddings.length);
}

/**
 * 📏 Vector normalize karo (L2)
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) return vector;
  return vector.map(val => val / magnitude);
}

/**
 * 🤖 AI se verify karo — kya A, B ka child hai?
 */
async function verifyParentRelation(childName, parentName) {
  try {
    const prompt = `
      You are an expert at organizing topics into hierarchies.
      
      Determine if Topic A should be a SUB-TOPIC (child) of Topic B.
      
      Topic A: "${childName}"
      Topic B: "${parentName}"
      
      Rules:
      - Return true ONLY if A is a specific subset of B
      - Return false if they are same level, unrelated, or B is child of A
      - Return ONLY JSON: {"isChild": true/false, "reason": "short explanation"}
    `;

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("AI verification failed:", error.message);
    return { isChild: false, reason: "AI verification failed" };
  }
}

/**
 * 🛠️ Qdrant collection ensure karo
 */
async function ensureTopicCollection() {
  if (collectionReady) return; // ✅ Baar baar check mat karo

  try {
    await qdrant.getCollection("topics_vectors");
  } catch (e) {
    await qdrant.createCollection("topics_vectors", {
      vectors: { size: 1024, distance: "Cosine" }
    });
  }

  try {
    await qdrant.createPayloadIndex("topics_vectors", {
      field_name: "user",
      field_schema: "keyword"
    });
  } catch (e) {
    // Index already exists — ignore
  }

  collectionReady = true;
}

/**
 * 🪐 Parent dhundo — kya ye topic kisi existing topic ka child hai?
 * 
 * SCORE LOGIC:
 * > 0.92 + same level = MERGE (duplicate hai)
 * > 0.55             = Sub-topic check (AI verify)
 * < 0.55             = Naya Level 1 topic
 */
export async function findLogicalParent(topicName, centroid, userId) {
  try {
    if (!centroid || centroid.length === 0) {
      return { parentTopicId: null, level: 1, confidence: 1, reason: "No centroid available" };
    }

    const normalizedCentroid = normalizeVector(centroid);
    await ensureTopicCollection();

    // 🔍 Qdrant mein similar topics dhundo
    let results = [];
    try {
      results = await qdrant.search("topics_vectors", {
        vector: normalizedCentroid,
        limit: 5,
        filter: {
          must: [{ key: "user", match: { value: userId.toString() } }]
        }
      });
    } catch (e) {
      if (!e.message.includes("404")) {
        console.error(`[TopicEngine] Search Error: ${e.message}`);
        throw e; // ✅ Silent failure nahi — error propagate karo
      }
    }

    if (!results || results.length === 0) {
      return { parentTopicId: null, level: 1, confidence: 1, reason: "First topic — no similar topics exist" };
    }

    // Score ke hisaab se sort karo
    const candidates = results.sort((a, b) => b.score - a.score);

    for (const candidate of candidates) {
      const parentName = candidate.payload?.topicName;
      const parentId = candidate.payload?.topicId;
      const parentLevel = candidate.payload?.level || 1;
      const score = candidate.score;

      console.log(`[TopicEngine] Checking: "${parentName}" | Score: ${score.toFixed(3)} | Level: ${parentLevel}`);

      // ✅ CASE A: Almost duplicate — MERGE karo
      // Sirf tab jab score bohot zyada high ho (0.92+)
      if (score > 0.92) {
        console.log(`[TopicEngine] 🔄 Merge candidate: "${topicName}" → "${parentName}"`);
        return {
          parentTopicId: parentId,
          level: parentLevel,
          isMergeCandidate: true,
          confidence: score,
          reason: `Duplicate of "${parentName}" (${(score * 100).toFixed(1)}%)`
        };
      }

      // ✅ CASE B: Related hai — Sub-topic banana chahiye
      // Score 0.55-0.92 ke beech aur max depth (3) tak
      if (score > 0.55 && parentLevel < 3) {
        const { isChild, reason } = await verifyParentRelation(topicName, parentName);

        if (isChild) {
          console.log(`[TopicEngine] 📂 Sub-topic: "${topicName}" → parent: "${parentName}" (Level ${parentLevel + 1})`);
          return {
            parentTopicId: parentId,
            level: parentLevel + 1, // ✅ Parent ke andar rakho
            isMergeCandidate: false, // ✅ Merge nahi — alag topic rehega
            confidence: score,
            reason: reason || `Sub-topic of "${parentName}"`
          };
        }
        // AI ne bola nahi hai child — next candidate try karo
      }
    }

    // Koi parent nahi mila — brand new Level 1 topic
    console.log(`[TopicEngine] 🆕 New root topic: "${topicName}"`);
    return {
      parentTopicId: null,
      level: 1,
      isMergeCandidate: false,
      confidence: 0.5,
      reason: "No suitable parent found"
    };

  } catch (error) {
    console.error("findLogicalParent Error:", error.message);
    return { parentTopicId: null, level: 1, confidence: 0, reason: error.message };
  }
}

/**
 * 🚀 Topic ko Qdrant mein save/update karo
 */
export async function upsertTopicVector(topicId, centroid, topicName, userId, level) {
  try {
    await ensureTopicCollection();
    const normalizedCentroid = normalizeVector(centroid);
    const vectorId = uuidv5(topicId.toString(), TOPIC_NAMESPACE);

    await qdrant.upsert("topics_vectors", {
      wait: true,
      points: [{
        id: vectorId,
        vector: normalizedCentroid,
        payload: {
          topicId: topicId.toString(),
          topicName,
          user: userId.toString(),
          level
        }
      }]
    });

    console.log(`[TopicEngine] ✅ Synced "${topicName}" (Level ${level}) to Qdrant`);
  } catch (error) {
    console.error("[TopicEngine] Upsert Error:", error.message);
  }
}