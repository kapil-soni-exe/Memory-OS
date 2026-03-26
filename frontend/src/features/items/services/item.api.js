import apiClient from "../../../services/apiClient";

export const getItems = async () => {
  const response = await apiClient.get('/items');
  return response.data;
};

export const getItemById = async (id) => {
  const response = await apiClient.get(`/items/${id}`);
  return response.data;
};

export const saveItem = async (itemData) => {
  const response = await apiClient.post('/items/save', itemData);
  return response.data;
};

export const extractContent = async (input) => {
  const response = await apiClient.post('/items/extract', input);
  return response.data;
};


export const updateItem = async (id, data) => {
  const response = await apiClient.put(`/items/${id}`, data);
  return response.data;
};

export const deleteItem = async (id) => {
  const response = await apiClient.delete(`/items/${id}`);
  return response.data;
};

export const getResurfaceItems = async () => {
  const response = await apiClient.get('/resurface');
  return response.data;
};

export const interactWithItem = async (id, action) => {
  const response = await apiClient.post(`/resurface/${id}/interact`, { action });
  return response.data;
};
