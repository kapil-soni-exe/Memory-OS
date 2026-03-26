import apiClient from "../../../services/apiClient";

export const getTopics = async () => {
  const response = await apiClient.get('/topics');
  return response.data;
};

export const getTopicById = async (id) => {
  const response = await apiClient.get(`/topics/${id}`);
  return response.data;
};

export const deleteTopic = async (id) => {
  const response = await apiClient.delete(`/topics/${id}`);
  return response.data;
};
