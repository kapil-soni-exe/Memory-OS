import { useCallback } from "react";
import { interactWithItem } from "../../items/services/item.api";
import { useDeleteItem } from "../../items/hooks/useItemMutation";

/**
 * useResurfaceActions - Encapsulates actions for the Resurface feed
 * 
 * Why this exists:
 * Resurface actions (Like, Skip, Delete) require complex synchronization 
 * between the resurface state, global items state, and search results.
 * 
 * We pass in the state update functions from parent hooks to keep this modular.
 */
const useResurfaceActions = ({ removeResurfaceItem }) => {
  const deleteMutation = useDeleteItem();
  
  // Like is just an API call, it doesn't remove it from the UI immediately.
  const handleLike = useCallback((id) => {
    interactWithItem(id, "like").catch(error => {
      console.error(`[Resurface Action Error] Failed to like item ${id}:`, error);
    });
  }, []);

  // Skip removes it from the local UI state immediately.
  const handleSkip = useCallback((id) => {
    interactWithItem(id, "skip").catch(error => {
      console.error(`[Resurface Action Error] Failed to skip item ${id}:`, error);
    });
    removeResurfaceItem(id); // Immediate local UI feedback
  }, [removeResurfaceItem]);

  // Delete is a multi-step process: Global DB delete + Resurface UI update + Search sync.
  const handleDelete = useCallback(async (id) => {
    try {
      await deleteMutation.mutateAsync(id);
      removeResurfaceItem(id); // Remove from the resurface "queue"
    } catch (error) {
      console.error(`[Critical Delete Error] Failed to remove item ${id}:`, error);
    }
  }, [deleteMutation, removeResurfaceItem]);

  return {
    handleLike,
    handleSkip,
    handleDelete
  };
};

export default useResurfaceActions;
