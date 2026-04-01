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
  // 1. If we have a file, it MUST be sent as multipart/form-data
  if (itemData.file) {
    const formData = new FormData();
    
    // Append all fields to FormData
    Object.keys(itemData).forEach(key => {
      // Backend expects 'content' or 'url', but frontend might send 'input'
      if (key === 'input') {
        const val = itemData[key]?.trim();
        if (val?.startsWith('http')) {
          formData.append('url', val);
        } else {
          formData.append('content', val);
        }
      } else if (itemData[key] !== undefined && itemData[key] !== null) {
        formData.append(key, itemData[key]);
      }
    });

    const response = await apiClient.post('/items/save', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  // 2. Standard JSON save for notes/URLs without file uploads
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

export const getResurfaceItems = async (options = {}) => {
  const { contextTags = [] } = options;
  const params = {};
  
  if (contextTags.length > 0) {
    params.contextTags = contextTags.join(',');
  }
  
  const response = await apiClient.get('/resurface', { params });
  return response.data;
};

export const interactWithItem = async (id, action) => {
  const response = await apiClient.post(`/resurface/${id}/interact`, { action });
  return response.data;
};
