import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getItems, saveItem, deleteItem, updateItem } from '../features/items/services/item.api';

export const ItemsContext = createContext();

export const ItemsProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getItems();
      setItems(Array.isArray(res.items) ? res.items : []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshItems = useCallback(async () => {
    try {
      const res = await getItems();
      setItems(Array.isArray(res.items) ? res.items : []);
    } catch (err) {
      console.error("Background refresh failed:", err);
    }
  }, []);

  // Smart Polling for AI updates
  useEffect(() => {
    const hasPending = items.some(item => 
      item.processingStatus === 'pending' || item.processingStatus === 'processing'
    );

    if (hasPending) {
      const interval = setInterval(() => {
        refreshItems();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [items, refreshItems]);

  const addItem = async (data) => {
    try {
      const res = await saveItem(data);
      setItems(prev => [res.item, ...prev]);
      return res.item;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const editItem = async (id, data) => {
    try {
      const res = await updateItem(id, data);
      setItems(prev => prev.map(item => item._id === id ? res.item : item));
      return res.item;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const removeItem = async (id) => {
    try {
      await deleteItem(id);
      setItems(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <ItemsContext.Provider value={{ 
      items, 
      loading, 
      error, 
      addItem, 
      editItem, 
      removeItem, 
      refetch: fetchItems 
    }}>
      {children}
    </ItemsContext.Provider>
  );
};
