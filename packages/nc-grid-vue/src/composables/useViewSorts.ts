/**
 * useViewSorts — Multi-column sort management composable
 */
import { computed } from 'vue';
import { useViewStore } from '../stores/viewStore';
import { useGridStore } from '../stores/gridStore';
import type { ColumnType } from 'nocodb-sdk';

export function useViewSorts() {
  const viewStore = useViewStore();
  const gridStore = useGridStore();

  const sorts = computed(() => viewStore.sorts);
  const hasSorts = computed(() => viewStore.sorts.length > 0);

  /** Get available columns for sorting (exclude already sorted columns) */
  const availableSortColumns = computed(() => {
    const sortedIds = new Set(viewStore.sorts.map((s) => s.fk_column_id));
    return gridStore.columns.filter(
      (c) => c.id && !sortedIds.has(c.id) && !c.system
    );
  });

  async function addSort(
    column: ColumnType,
    direction: 'asc' | 'desc' = 'asc'
  ): Promise<void> {
    if (!column.id) return;
    await viewStore.addSort(column.id, direction);
  }

  async function toggleSortDirection(sortId: string): Promise<void> {
    const sort = viewStore.sorts.find((s) => s.id === sortId);
    if (!sort) return;
    const newDirection = sort.direction === 'asc' ? 'desc' : 'asc';
    await viewStore.updateSort(sortId, { direction: newDirection });
  }

  async function changeSortColumn(sortId: string, columnId: string): Promise<void> {
    await viewStore.updateSort(sortId, { fk_column_id: columnId });
  }

  async function removeSort(sortId: string): Promise<void> {
    await viewStore.removeSort(sortId);
  }

  async function clearAll(): Promise<void> {
    await viewStore.clearSorts();
  }

  /** Quick sort: toggle column sort (none → asc → desc → none) */
  async function quickSort(column: ColumnType): Promise<void> {
    if (!column.id) return;
    const existing = viewStore.sorts.find((s) => s.fk_column_id === column.id);

    if (!existing) {
      await viewStore.addSort(column.id, 'asc');
    } else if (existing.direction === 'asc') {
      await viewStore.updateSort(existing.id!, { direction: 'desc' });
    } else {
      await viewStore.removeSort(existing.id!);
    }
  }

  /** Get sort direction for a specific column */
  function getSortDirection(columnId: string): 'asc' | 'desc' | null {
    const sort = viewStore.sorts.find((s) => s.fk_column_id === columnId);
    return sort ? (sort.direction as 'asc' | 'desc') : null;
  }

  /** Get sort index for a column (for multi-sort display) */
  function getSortIndex(columnId: string): number {
    return viewStore.sorts.findIndex((s) => s.fk_column_id === columnId);
  }

  return {
    sorts,
    hasSorts,
    availableSortColumns,
    addSort,
    toggleSortDirection,
    changeSortColumn,
    removeSort,
    clearAll,
    quickSort,
    getSortDirection,
    getSortIndex,
  };
}
