/**
 * useMultiSelect — Cell/row/range selection with keyboard and mouse
 */
import { useSelectionStore } from '../stores/selectionStore';
import { useGridStore } from '../stores/gridStore';
import { useEditStore } from '../stores/editStore';

export function useMultiSelect() {
  const selectionStore = useSelectionStore();
  const gridStore = useGridStore();
  const editStore = useEditStore();

  function handleCellClick(
    row: number,
    col: number,
    event: MouseEvent
  ): void {
    // If shift held, extend range
    if (event.shiftKey && selectionStore.activeCell) {
      selectionStore.startRangeSelection(
        selectionStore.activeCell.row,
        selectionStore.activeCell.col
      );
      selectionStore.updateRangeSelection(row, col);
      selectionStore.endRangeSelection();
      return;
    }

    // If Ctrl/Cmd held, toggle row selection
    if (event.ctrlKey || event.metaKey) {
      selectionStore.toggleRowSelection(row);
      return;
    }

    // Normal click: set active cell
    selectionStore.setActiveCell(row, col);
  }

  function handleCellDoubleClick(row: number, col: number): void {
    const columns = gridStore.visibleColumns;
    const column = columns[col];
    if (!column || column.pk || column.ai) return;

    const rowData = gridStore.rows[row];
    if (!rowData || !column.title) return;

    editStore.startEditing(row, col, rowData.row[column.title]);
  }

  function handleCellMouseDown(row: number, col: number, event: MouseEvent): void {
    if (event.button !== 0) return; // Left click only
    if (event.shiftKey) return; // Handled in click

    selectionStore.startRangeSelection(row, col);
  }

  function handleCellMouseOver(row: number, col: number): void {
    if (selectionStore.isSelectingRange) {
      selectionStore.updateRangeSelection(row, col);
    }
  }

  function handleCellMouseUp(): void {
    if (selectionStore.isSelectingRange) {
      selectionStore.endRangeSelection();
    }
  }

  function handleRowCheckbox(rowIndex: number, event: Event): void {
    event.stopPropagation();
    selectionStore.toggleRowSelection(rowIndex);
  }

  function handleSelectAll(): void {
    if (selectionStore.selectAllActive) {
      selectionStore.clearRowSelection();
    } else {
      selectionStore.selectAllRows(gridStore.rows.length);
    }
  }

  /** Get selected rows data */
  function getSelectedRows() {
    return Array.from(selectionStore.selectedRows)
      .sort((a, b) => a - b)
      .map((idx) => gridStore.rows[idx])
      .filter(Boolean);
  }

  /** Get cells in the selected range */
  function getSelectedRangeCells() {
    const range = selectionStore.normalizedRange;
    if (!range) return [];

    const cells: { row: number; col: number; value: unknown }[] = [];
    const columns = gridStore.visibleColumns;

    for (let r = range.start.row; r <= range.end.row; r++) {
      for (let c = range.start.col; c <= range.end.col; c++) {
        const rowData = gridStore.rows[r];
        const col = columns[c];
        if (rowData && col?.title) {
          cells.push({
            row: r,
            col: c,
            value: rowData.row[col.title],
          });
        }
      }
    }

    return cells;
  }

  return {
    handleCellClick,
    handleCellDoubleClick,
    handleCellMouseDown,
    handleCellMouseOver,
    handleCellMouseUp,
    handleRowCheckbox,
    handleSelectAll,
    getSelectedRows,
    getSelectedRangeCells,
  };
}
