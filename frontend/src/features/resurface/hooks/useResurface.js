import { useState, useEffect } from "react";
import { getResurfaceItems } from "../../items/services/item.api";

export default function useResurface() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchResurface = async () => {
    try {
      setLoading(true);
      const res = await getResurfaceItems();
      setItems(Array.isArray(res.items) ? res.items : []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id && item._id !== id));
  };

  useEffect(() => {
    fetchResurface();
  }, []);

  return {
    items,
    loading,
    error,
    removeItem,
    refetch: fetchResurface
  };
}
