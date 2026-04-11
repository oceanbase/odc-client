/**
 * useUndoRedo — Undo/redo stack for grid operations
 */
import { useEditStore } from '../stores/editStore';

export function useUndoRedo() {
  const editStore = useEditStore();

  async function undo(): Promise<void> {
    await editStore.undo();
  }

  async function redo(): Promise<void> {
    await editStore.redo();
  }

  function clear(): void {
    editStore.clearUndoRedo();
  }

  return {
    canUndo: editStore.canUndo,
    canRedo: editStore.canRedo,
    undo,
    redo,
    clear,
  };
}
