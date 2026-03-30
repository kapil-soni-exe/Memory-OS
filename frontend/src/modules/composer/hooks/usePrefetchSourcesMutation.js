import { useMutation, useQueryClient } from '@tanstack/react-query';
import { preFetchSources } from '../api/composer.api';
import { composerKeys } from '../keys/composer.keys';

export const usePrefetchSourcesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: preFetchSources,
    onSuccess: (data, prompt) => {
      if (data.sources) {
        queryClient.setQueryData(
          composerKeys.sources(prompt),
          data.sources
        );
      }
    },
  });
};
