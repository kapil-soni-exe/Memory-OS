import apiClient from "../../../services/apiClient";

export const getNuggetFeed = async () => {
  const response = await apiClient.get("/nuggets/feed");
  return response.data;
};
