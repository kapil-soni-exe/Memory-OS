import { useMutation, useQueryClient } from '@tanstack/react-query';
import { synthesizeContent } from '../api/composer.api';
import { composerKeys } from '../keys/composer.keys';

export const useSynthesizeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: synthesizeContent,
    onSuccess: (data, variables) => {
      if (data.sources) {
        const { prompt } = variables;
        queryClient.setQueryData(
          composerKeys.sources(prompt),
          data.sources
        );
      }
    },
  });
};
