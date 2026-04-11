/**
 * useKeyboardNavigation — Arrow keys, Tab, Enter, Escape, and shortcut handling
 */
import { onMounted, onUnmounted } from 'vue';
import { useSelectionStore } from '../stores/selectionStore';
import { useEditStore } from '../stores/editStore';
import { useGridStore } from '../stores/gridStore';
import { useCopy } from './useCopy';

export function useKeyboardNavigation() {
  const selectionStore = useSelectionStore();
  const editStore = useEditStore();
  const gridStore = useGridStore();
  const { copySelection } = useCopy();

  function handleKeyDown(event: KeyboardEvent): void {
    const maxRows = gridStore.rows.length;
    const maxCols = gridStore.visibleColumns.length;

    // ── Editing mode shortcuts ──
    if (editStore.isEditing) {
      switch (event.key) {
        case 'Escape':
          editStore.cancelEditing();
          event.preventDefault();
          return;
        case 'Enter':
          if (!event.shiftKey) {
            // Commit and move down
            editStore.commitEditing();
            selectionStore.moveActiveCell('down', maxRows, maxCols);
            event.preventDefault();
          }
          return;
        case 'Tab':
          editStore.commitEditing();
          selectionStore.tabNavigate(maxRows, maxCols, event.shiftKey);
          event.preventDefault();
          return;
      }
      // Don't intercept other keys while editing
      return;
    }

    // ── Navigation mode shortcuts ──
    const isCtrlOrCmd = event.ctrlKey || event.metaKey;

    switch (event.key) {
      case 'ArrowUp':
        selectionStore.moveActiveCell('up', maxRows, maxCols);
        event.preventDefault();
        break;

      case 'ArrowDown':
        selectionStore.moveActiveCell('down', maxRows, maxCols);
        event.preventDefault();
        break;

      case 'ArrowLeft':
        selectionStore.moveActiveCell('left', maxRows, maxCols);
        event.preventDefault();
        break;

      case 'ArrowRight':
        selectionStore.moveActiveCell('right', maxRows, maxCols);
        event.preventDefault();
        break;

      case 'Tab':
        selectionStore.tabNavigate(maxRows, maxCols, event.shiftKey);
        event.preventDefault();
        break;

      case 'Enter':
        // Start editing active cell
        if (selectionStore.activeCell) {
          const { row, col } = selectionStore.activeCell;
          const column = gridStore.visibleColumns[col];
          if (column?.title && !column.pk && !column.ai && !column.system) {
            const rowData = gridStore.rows[row];
            if (rowData) {
              editStore.startEditing(row, col, rowData.row[column.title]);
            }
          }
        }
        event.preventDefault();
        break;

      case 'Escape':
        selectionStore.clearAll();
        event.preventDefault();
        break;

      case 'Delete':
      case 'Backspace':
        // Clear active cell value
        if (selectionStore.activeCell && !isCtrlOrCmd) {
          const { row, col } = selectionStore.activeCell;
          const column = gridStore.visibleColumns[col];
          if (column?.title && !column.pk && !column.ai && !column.system) {
            gridStore.updateRow(row, column.title, null);
          }
          event.preventDefault();
        }
        break;

      case 'c':
        if (isCtrlOrCmd) {
          copySelection();
          event.preventDefault();
        }
        break;

      case 'z':
        if (isCtrlOrCmd) {
          if (event.shiftKey) {
            editStore.redo();
          } else {
            editStore.undo();
          }
          event.preventDefault();
        }
        break;

      case 'y':
        if (isCtrlOrCmd) {
          editStore.redo();
          event.preventDefault();
        }
        break;

      case 'a':
        if (isCtrlOrCmd) {
          selectionStore.selectAllRows(gridStore.rows.length);
          event.preventDefault();
        }
        break;

      case ' ':
        // Toggle row selection with space
        if (selectionStore.activeCell) {
          selectionStore.toggleRowSelection(selectionStore.activeCell.row);
          event.preventDefault();
        }
        break;

      default:
        // Start editing with any printable character
        if (
          event.key.length === 1 &&
          !isCtrlOrCmd &&
          !event.altKey &&
          selectionStore.activeCell
        ) {
          const { row, col } = selectionStore.activeCell;
          const column = gridStore.visibleColumns[col];
          if (column?.title && !column.pk && !column.ai && !column.system) {
            editStore.startEditing(row, col, event.key);
          }
        }
        break;
    }
  }

  function setupKeyboardListeners(container: HTMLElement): void {
    container.addEventListener('keydown', handleKeyDown);
  }

  function teardownKeyboardListeners(container: HTMLElement): void {
    container.removeEventListener('keydown', handleKeyDown);
  }

  return {
    handleKeyDown,
    setupKeyboardListeners,
    teardownKeyboardListeners,
  };
}
