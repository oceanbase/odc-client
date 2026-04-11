/**
 * Edit store — manages cell editing state, dirty tracking, and undo/redo
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { UndoRedoAction, CellPosition } from '../types';

export const useEditStore = defineStore('nc-grid-edit', () => {
  // ── State ──
  const isEditing = ref(false);
  const editingCell = ref<CellPosition | null>(null);
  const editingValue = ref<unknown>(null);
  const originalValue = ref<unknown>(null);
  const undoStack = ref<UndoRedoAction[]>([]);
  const redoStack = ref<UndoRedoAction[]>([]);

  const MAX_UNDO_STACK = 100;

  // ── Computed ──
  const canUndo = computed(() => undoStack.value.length > 0);
  const canRedo = computed(() => redoStack.value.length > 0);
  const isDirty = computed(() => editingValue.value !== originalValue.value);
  const isEditingRow = computed(() => editingCell.value?.row ?? -1);
  const isEditingCol = computed(() => editingCell.value?.col ?? -1);

  // ── Actions ──

  function startEditing(row: number, col: number, currentValue: unknown): void {
    isEditing.value = true;
    editingCell.value = { row, col };
    editingValue.value = currentValue;
    originalValue.value = currentValue;
  }

  function updateEditingValue(value: unknown): void {
    editingValue.value = value;
  }

  function cancelEditing(): void {
    isEditing.value = false;
    editingCell.value = null;
    editingValue.value = null;
    originalValue.value = null;
  }

  function commitEditing(): { row: number; col: number; value: unknown; oldValue: unknown } | null {
    if (!editingCell.value || !isDirty.value) {
      cancelEditing();
      return null;
    }

    const result = {
      row: editingCell.value.row,
      col: editingCell.value.col,
      value: editingValue.value,
      oldValue: originalValue.value,
    };

    cancelEditing();
    return result;
  }

  function addUndoAction(action: UndoRedoAction): void {
    undoStack.value.push(action);
    if (undoStack.value.length > MAX_UNDO_STACK) {
      undoStack.value.shift();
    }
    // Clear redo stack on new action
    redoStack.value = [];
  }

  async function undo(): Promise<void> {
    const action = undoStack.value.pop();
    if (!action) return;

    await action.undo.fn(...action.undo.args);
    redoStack.value.push(action);
  }

  async function redo(): Promise<void> {
    const action = redoStack.value.pop();
    if (!action) return;

    await action.redo.fn(...action.redo.args);
    undoStack.value.push(action);
  }

  function clearUndoRedo(): void {
    undoStack.value = [];
    redoStack.value = [];
  }

  function isCellEditing(row: number, col: number): boolean {
    return isEditing.value && editingCell.value?.row === row && editingCell.value?.col === col;
  }

  function $reset(): void {
    cancelEditing();
    clearUndoRedo();
  }

  return {
    // State
    isEditing,
    editingCell,
    editingValue,
    originalValue,
    undoStack,
    redoStack,
    // Computed
    canUndo,
    canRedo,
    isDirty,
    isEditingRow,
    isEditingCol,
    // Actions
    startEditing,
    updateEditingValue,
    cancelEditing,
    commitEditing,
    addUndoAction,
    undo,
    redo,
    clearUndoRedo,
    isCellEditing,
    $reset,
  };
});
