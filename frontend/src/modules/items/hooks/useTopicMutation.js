import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTopic } from '../services/topic.api';

export const useDeleteTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteTopic(id),
    onSuccess: () => {
      // Invalidate both items and topics as topic deletion affects both
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
  });
};
