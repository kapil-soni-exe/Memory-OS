import { useQuery } from '@tanstack/react-query';
import { composerKeys } from '../keys/composer.keys';

export const useSourcesQuery = (prompt) => {
  return useQuery({
    queryKey: composerKeys.sources(prompt),
    queryFn: () => [], // Passive fallback to satisfy TanStack v5
    enabled: !!prompt,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 // 1 hour
  });
};
