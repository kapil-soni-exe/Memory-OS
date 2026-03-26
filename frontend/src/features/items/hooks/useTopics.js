import { useState, useEffect } from "react";
import { getTopics, deleteTopic } from "../services/topic.api";

export default function useTopics() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const data = await getTopics();
      setTopics(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const removeTopic = async (topicId) => {
    try {
      await deleteTopic(topicId);
      setTopics(prev => prev.filter(t => t._id !== topicId));
    } catch (err) {
      console.error("Failed to delete topic:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  return {
    topics,
    loading,
    error,
    removeTopic,
    refetch: fetchTopics
  };
}
