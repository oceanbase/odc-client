/**
 * usePaste — Paste with validation and type coercion
 */
import { useSelectionStore } from '../stores/selectionStore';
import { useGridStore } from '../stores/gridStore';
import { useEditStore } from '../stores/editStore';
import type { ColumnType } from 'nocodb-sdk';

export function usePaste() {
  const selectionStore = useSelectionStore();
  const gridStore = useGridStore();
  const editStore = useEditStore();

  /** Handle paste event */
  async function handlePaste(event: ClipboardEvent): Promise<void> {
    const clipboardText = event.clipboardData?.getData('text/plain');
    if (!clipboardText) return;

    event.preventDefault();

    // If editing a cell, paste into the cell
    if (editStore.isEditing) {
      editStore.updateEditingValue(clipboardText);
      return;
    }

    // Otherwise paste into grid starting at active cell
    const startCell = selectionStore.activeCell;
    if (!startCell) return;

    const rows = parsePasteData(clipboardText);
    const columns = gridStore.visibleColumns;

    const updates: Array<{ rowIndex: number; field: string; value: unknown }> = [];

    for (let r = 0; r < rows.length; r++) {
      const rowIndex = startCell.row + r;
      if (rowIndex >= gridStore.rows.length) break;

      for (let c = 0; c < rows[r].length; c++) {
        const colIndex = startCell.col + c;
        if (colIndex >= columns.length) break;

        const column = columns[colIndex];
        if (!column.title || column.pk || column.ai || column.system) continue;

        const convertedValue = convertCellData(rows[r][c], column);
        updates.push({
          rowIndex,
          field: column.title,
          value: convertedValue,
        });
      }
    }

    // Apply updates with undo support
    for (const update of updates) {
      const row = gridStore.rows[update.rowIndex];
      if (!row) continue;

      const oldValue = row.row[update.field];
      row.row[update.field] = update.value;
      row.rowMeta.changed = true;

      editStore.addUndoAction({
        undo: {
          fn: async () => {
            row.row[update.field] = oldValue;
            await gridStore.updateRow(update.rowIndex, update.field, oldValue);
          },
          args: [],
        },
        redo: {
          fn: async () => {
            row.row[update.field] = update.value;
            await gridStore.updateRow(update.rowIndex, update.field, update.value);
          },
          args: [],
        },
      });

      // Save to server
      try {
        await gridStore.updateRow(update.rowIndex, update.field, update.value);
      } catch {
        // Revert on error
        row.row[update.field] = oldValue;
        row.rowMeta.changed = false;
      }
    }
  }

  return {
    handlePaste,
  };
}

/** Parse tab-separated paste data into 2D array */
function parsePasteData(text: string): string[][] {
  return text.split('\n').map((line) => line.split('\t'));
}

/** Convert pasted string to appropriate type based on column */
function convertCellData(value: string, column: ColumnType): unknown {
  if (value === '' || value === null || value === undefined) return null;

  switch (column.uidt) {
    case 'Number':
    case 'Decimal':
    case 'Currency':
    case 'Percent':
    case 'Duration':
    case 'Rating': {
      const num = Number(value);
      return isNaN(num) ? null : num;
    }
    case 'Checkbox':
      return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
    case 'JSON': {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    case 'MultiSelect':
      return value; // Keep as comma-separated string
    default:
      return value;
  }
}
