import { useState, useEffect } from "react";
import { getItems, saveItem, deleteItem,getItemById } from "../services/item.api";

export default function useItems() {

  const [items,setItems] = useState([]);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState(null);

  // Fetch items
  const fetchItems = async () => {

    try {

      setLoading(true);

      const res = await getItems();

      setItems(Array.isArray(res.items) ? res.items : []);

    } catch(err) {

      setError(err);

    } finally {

      setLoading(false);

    }

  };

  // Save new item
  const addItem = async (data) => {
    try {
      const res = await saveItem(data);
      setItems(prev => [res.item, ...prev]);
      return res.item; // Return for preview
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  // Update item
  const editItem = async (id, data) => {
    try {
      const { updateItem } = await import("../services/item.api");
      const res = await updateItem(id, data);
      setItems(prev => prev.map(item => item._id === id ? res.item : item));
      return res.item;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  // Delete item
  const removeItem = async (id) => {

    try {

      await deleteItem(id);

      setItems(prev => prev.filter(item => item._id !== id));

    } catch(err) {

      setError(err);

    }

  };

  useEffect(()=>{

    fetchItems();

  },[]);

  return {

    items,
    loading,
    error,
    addItem,
    editItem,
    removeItem,
    refetch: fetchItems

  };

}