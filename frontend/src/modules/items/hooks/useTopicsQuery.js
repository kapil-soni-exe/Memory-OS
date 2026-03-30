import { useQuery } from '@tanstack/react-query';
import { getTopics } from '../services/topic.api';

export const useTopicsQuery = () => {
  return useQuery({
    queryKey: ["topics"],
    queryFn: getTopics,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
