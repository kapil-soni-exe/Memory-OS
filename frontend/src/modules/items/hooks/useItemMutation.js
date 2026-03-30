import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveItem, deleteItem, updateItem, interactWithItem } from '../services/item.api';

/**
 * Mutation hooks for items
 * Automatically invalidates ['items'] query on success.
 */

export const useAddItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['nuggets'] });
    },
  });
};

export const useUpdateItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
};

export const useDeleteItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
};

export const useLikeItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => interactWithItem(id, 'like'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['resurface'] });
    },
  });
};

export const useSkipItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => interactWithItem(id, 'skip'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resurface'] });
    },
  });
};

export const useViewItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => interactWithItem(id, 'view'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resurface'] });
    },
  });
};
