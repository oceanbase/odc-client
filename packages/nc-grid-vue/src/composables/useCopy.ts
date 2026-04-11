/**
 * useCopy — Copy to clipboard in Excel/CSV/plain text formats
 */
import { useSelectionStore } from '../stores/selectionStore';
import { useGridStore } from '../stores/gridStore';

export function useCopy() {
  const selectionStore = useSelectionStore();
  const gridStore = useGridStore();

  /** Copy selected cells/rows to clipboard as tab-separated text */
  async function copySelection(): Promise<void> {
    const text = getSelectionAsText();
    if (text) {
      await navigator.clipboard.writeText(text);
    }
  }

  /** Get selected data as tab-separated text (TSV, compatible with Excel/Sheets) */
  function getSelectionAsText(): string {
    const range = selectionStore.normalizedRange;
    const columns = gridStore.visibleColumns;

    // If range selection exists
    if (range) {
      const lines: string[] = [];
      for (let r = range.start.row; r <= range.end.row; r++) {
        const rowData = gridStore.rows[r];
        if (!rowData) continue;
        const cells: string[] = [];
        for (let c = range.start.col; c <= range.end.col; c++) {
          const col = columns[c];
          if (col?.title) {
            cells.push(formatCellValue(rowData.row[col.title]));
          }
        }
        lines.push(cells.join('\t'));
      }
      return lines.join('\n');
    }

    // If row selection
    if (selectionStore.selectedRows.size > 0) {
      const lines: string[] = [];
      // Header
      const headers = columns.map((c) => c.title || '');
      lines.push(headers.join('\t'));

      // Data rows
      const sortedIndices = Array.from(selectionStore.selectedRows).sort((a, b) => a - b);
      for (const idx of sortedIndices) {
        const rowData = gridStore.rows[idx];
        if (!rowData) continue;
        const cells = columns.map((col) =>
          formatCellValue(rowData.row[col.title || ''])
        );
        lines.push(cells.join('\t'));
      }
      return lines.join('\n');
    }

    // If single active cell
    if (selectionStore.activeCell) {
      const { row, col } = selectionStore.activeCell;
      const rowData = gridStore.rows[row];
      const column = columns[col];
      if (rowData && column?.title) {
        return formatCellValue(rowData.row[column.title]);
      }
    }

    return '';
  }

  /** Get selection as CSV format */
  function getSelectionAsCsv(): string {
    const text = getSelectionAsText();
    return text
      .split('\n')
      .map((line) =>
        line
          .split('\t')
          .map((cell) => {
            // Escape CSV: wrap in quotes if contains comma, newline, or quote
            if (cell.includes(',') || cell.includes('\n') || cell.includes('"')) {
              return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
          })
          .join(',')
      )
      .join('\n');
  }

  return {
    copySelection,
    getSelectionAsText,
    getSelectionAsCsv,
  };
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}
