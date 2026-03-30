import { useQuery } from '@tanstack/react-query';
import { getItems } from '../services/item.api';

/**
 * Hook to fetch items using TanStack Query
 * Minimal configuration with 5 min staleTime as requested.
 */
export const useItemsQuery = () => {
  return useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      const data = await getItems();
      return data.items || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: (query) => {
      const items = query.state.data || [];
      const hasPending = items.some(item => 
        item.processingStatus === 'pending' || item.processingStatus === 'processing'
      );
      return hasPending ? 3000 : false;
    },
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
  });
};
