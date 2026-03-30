import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchItems } from '../services/search.api';

/**
 * useSearchQuery - A debounced search hook using TanStack Query.
 * Optimizes network requests by waiting for 300ms of inactivity.
 */
export const useSearchQuery = (searchQuery) => {
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  // Handle 300ms debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  return useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      const data = await searchItems(debouncedQuery);
      return data.results || [];
    },
    // Only search if the debounced string is not empty
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
    // TanStack v5: Keep previous results while fetching new ones to avoid flicker
    placeholderData: (previousData) => previousData,
  });
};
