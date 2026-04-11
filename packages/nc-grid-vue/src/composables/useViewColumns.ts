/**
 * useViewColumns — Column visibility, ordering, and width management
 */
import { computed } from 'vue';
import { useViewStore } from '../stores/viewStore';
import { useGridStore } from '../stores/gridStore';
import type { ColumnType } from 'nocodb-sdk';
import type { GridColumn } from '../types';

export function useViewColumns() {
  const viewStore = useViewStore();
  const gridStore = useGridStore();

  /** All columns with view-specific metadata (visibility, width, order) */
  const gridColumns = computed((): GridColumn[] => {
    return gridStore.columns
      .map((col) => {
        const colId = col.id || '';
        return {
          column: col,
          width: viewStore.columnWidths.value?.get(colId) ?? 200,
          visible: !viewStore.hiddenColumnIds.value?.has(colId),
          order: viewStore.columnOrder.value?.get(colId) ?? 0,
        };
      })
      .sort((a, b) => a.order - b.order);
  });

  /** Only visible columns, sorted by order */
  const visibleGridColumns = computed((): GridColumn[] => {
    return gridColumns.value.filter((gc) => gc.visible);
  });

  /** Hidden columns */
  const hiddenGridColumns = computed((): GridColumn[] => {
    return gridColumns.value.filter((gc) => !gc.visible);
  });

  async function toggleVisibility(columnId: string, show: boolean): Promise<void> {
    await viewStore.toggleColumnVisibility(columnId, show);
  }

  async function showAllColumns(): Promise<void> {
    const hidden = hiddenGridColumns.value;
    await Promise.all(
      hidden.map((gc) =>
        viewStore.toggleColumnVisibility(gc.column.id!, true)
      )
    );
  }

  async function hideAllColumns(): Promise<void> {
    // Keep primary value column visible
    const pvCol = gridStore.primaryValueColumn;
    const toHide = visibleGridColumns.value.filter(
      (gc) => gc.column.id !== pvCol?.id && !gc.column.pk
    );
    await Promise.all(
      toHide.map((gc) =>
        viewStore.toggleColumnVisibility(gc.column.id!, false)
      )
    );
  }

  async function resizeColumn(columnId: string, width: number): Promise<void> {
    const minWidth = 60;
    const maxWidth = 800;
    const clampedWidth = Math.max(minWidth, Math.min(maxWidth, width));
    await viewStore.updateColumnWidth(columnId, clampedWidth);
  }

  async function reorderColumn(
    columnId: string,
    newOrder: number
  ): Promise<void> {
    await viewStore.updateColumnOrder(columnId, newOrder);
  }

  /** Move a column to a new position */
  async function moveColumn(
    fromIndex: number,
    toIndex: number
  ): Promise<void> {
    const cols = [...visibleGridColumns.value];
    const [moved] = cols.splice(fromIndex, 1);
    cols.splice(toIndex, 0, moved);

    // Update all orders
    await Promise.all(
      cols.map((gc, index) =>
        viewStore.updateColumnOrder(gc.column.id!, index + 1)
      )
    );
  }

  return {
    gridColumns,
    visibleGridColumns,
    hiddenGridColumns,
    toggleVisibility,
    showAllColumns,
    hideAllColumns,
    resizeColumn,
    reorderColumn,
    moveColumn,
  };
}
