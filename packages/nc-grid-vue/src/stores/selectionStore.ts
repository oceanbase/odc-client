/**
 * Selection store — manages cell, row, and range selection state
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { CellPosition, CellRange, Row } from '../types';

export const useSelectionStore = defineStore('nc-grid-selection', () => {
  // ── State ──
  const activeCell = ref<CellPosition | null>(null);
  const selectedRange = ref<CellRange | null>(null);
  const selectedRows = ref<Set<number>>(new Set());
  const isSelectingRange = ref(false);
  const selectAllActive = ref(false);

  // ── Computed ──
  const hasSelection = computed(() => selectedRows.value.size > 0 || selectedRange.value !== null);
  const selectedRowCount = computed(() => selectedRows.value.size);
  const activeCellRow = computed(() => activeCell.value?.row ?? -1);
  const activeCellCol = computed(() => activeCell.value?.col ?? -1);

  const normalizedRange = computed((): CellRange | null => {
    if (!selectedRange.value) return null;
    const { start, end } = selectedRange.value;
    return {
      start: {
        row: Math.min(start.row, end.row),
        col: Math.min(start.col, end.col),
      },
      end: {
        row: Math.max(start.row, end.row),
        col: Math.max(start.col, end.col),
      },
    };
  });

  // ── Actions ──

  function setActiveCell(row: number, col: number): void {
    activeCell.value = { row, col };
    clearRange();
  }

  function clearActiveCell(): void {
    activeCell.value = null;
  }

  function startRangeSelection(row: number, col: number): void {
    isSelectingRange.value = true;
    selectedRange.value = {
      start: { row, col },
      end: { row, col },
    };
  }

  function updateRangeSelection(row: number, col: number): void {
    if (!isSelectingRange.value || !selectedRange.value) return;
    selectedRange.value = {
      ...selectedRange.value,
      end: { row, col },
    };
  }

  function endRangeSelection(): void {
    isSelectingRange.value = false;
  }

  function clearRange(): void {
    selectedRange.value = null;
    isSelectingRange.value = false;
  }

  function toggleRowSelection(rowIndex: number): void {
    if (selectedRows.value.has(rowIndex)) {
      selectedRows.value.delete(rowIndex);
    } else {
      selectedRows.value.add(rowIndex);
    }
    // Trigger reactivity
    selectedRows.value = new Set(selectedRows.value);
  }

  function selectRow(rowIndex: number): void {
    selectedRows.value.add(rowIndex);
    selectedRows.value = new Set(selectedRows.value);
  }

  function deselectRow(rowIndex: number): void {
    selectedRows.value.delete(rowIndex);
    selectedRows.value = new Set(selectedRows.value);
  }

  function selectAllRows(totalRows: number): void {
    selectedRows.value = new Set(Array.from({ length: totalRows }, (_, i) => i));
    selectAllActive.value = true;
  }

  function clearRowSelection(): void {
    selectedRows.value = new Set();
    selectAllActive.value = false;
  }

  function isRowSelected(rowIndex: number): boolean {
    return selectedRows.value.has(rowIndex);
  }

  function isCellInRange(row: number, col: number): boolean {
    const range = normalizedRange.value;
    if (!range) return false;
    return (
      row >= range.start.row &&
      row <= range.end.row &&
      col >= range.start.col &&
      col <= range.end.col
    );
  }

  function isCellActive(row: number, col: number): boolean {
    return activeCell.value?.row === row && activeCell.value?.col === col;
  }

  /** Move active cell with keyboard navigation */
  function moveActiveCell(
    direction: 'up' | 'down' | 'left' | 'right',
    maxRows: number,
    maxCols: number
  ): void {
    if (!activeCell.value) {
      setActiveCell(0, 0);
      return;
    }

    let { row, col } = activeCell.value;
    switch (direction) {
      case 'up':
        row = Math.max(0, row - 1);
        break;
      case 'down':
        row = Math.min(maxRows - 1, row + 1);
        break;
      case 'left':
        col = Math.max(0, col - 1);
        break;
      case 'right':
        col = Math.min(maxCols - 1, col + 1);
        break;
    }
    setActiveCell(row, col);
  }

  /** Tab navigation (move right, wrap to next row) */
  function tabNavigate(maxRows: number, maxCols: number, reverse = false): void {
    if (!activeCell.value) {
      setActiveCell(0, 0);
      return;
    }

    let { row, col } = activeCell.value;
    if (reverse) {
      col--;
      if (col < 0) {
        col = maxCols - 1;
        row = Math.max(0, row - 1);
      }
    } else {
      col++;
      if (col >= maxCols) {
        col = 0;
        row = Math.min(maxRows - 1, row + 1);
      }
    }
    setActiveCell(row, col);
  }

  function clearAll(): void {
    clearActiveCell();
    clearRange();
    clearRowSelection();
  }

  function $reset(): void {
    clearAll();
  }

  return {
    // State
    activeCell,
    selectedRange,
    selectedRows,
    isSelectingRange,
    selectAllActive,
    // Computed
    hasSelection,
    selectedRowCount,
    activeCellRow,
    activeCellCol,
    normalizedRange,
    // Actions
    setActiveCell,
    clearActiveCell,
    startRangeSelection,
    updateRangeSelection,
    endRangeSelection,
    clearRange,
    toggleRowSelection,
    selectRow,
    deselectRow,
    selectAllRows,
    clearRowSelection,
    isRowSelected,
    isCellInRange,
    isCellActive,
    moveActiveCell,
    tabNavigate,
    clearAll,
    $reset,
  };
});
