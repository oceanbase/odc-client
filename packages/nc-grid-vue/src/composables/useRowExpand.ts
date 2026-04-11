/**
 * useRowExpand — Expanded form open/close/navigation
 */
import { useUIStore } from '../stores/uiStore';
import { useGridStore } from '../stores/gridStore';
import type { Row } from '../types';

export function useRowExpand() {
  const uiStore = useUIStore();
  const gridStore = useGridStore();

  function openExpandedForm(row: Row, rowIndex: number): void {
    uiStore.openExpandedForm(row, rowIndex);
  }

  function closeExpandedForm(): void {
    uiStore.closeExpandedForm();
  }

  function navigatePrev(): void {
    const idx = uiStore.expandedFormRowIndex;
    if (idx > 0) {
      const prevRow = gridStore.rows[idx - 1];
      if (prevRow) {
        uiStore.openExpandedForm(prevRow, idx - 1);
      }
    }
  }

  function navigateNext(): void {
    const idx = uiStore.expandedFormRowIndex;
    if (idx < gridStore.rows.length - 1) {
      const nextRow = gridStore.rows[idx + 1];
      if (nextRow) {
        uiStore.openExpandedForm(nextRow, idx + 1);
      }
    }
  }

  return {
    isOpen: uiStore.showExpandedForm,
    currentRow: uiStore.expandedFormRow,
    currentRowIndex: uiStore.expandedFormRowIndex,
    openExpandedForm,
    closeExpandedForm,
    navigatePrev,
    navigateNext,
  };
}
