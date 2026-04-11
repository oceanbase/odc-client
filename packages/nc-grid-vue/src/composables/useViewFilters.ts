/**
 * useViewFilters — Complex filter management composable
 */
import { computed } from 'vue';
import { useViewStore } from '../stores/viewStore';
import { useGridStore } from '../stores/gridStore';
import type { FilterType, ColumnType } from 'nocodb-sdk';

/** Comparison operators with their display labels */
export const COMPARISON_OPS: Record<string, { label: string; requiresValue: boolean }> = {
  eq: { label: 'is equal', requiresValue: true },
  neq: { label: 'is not equal', requiresValue: true },
  like: { label: 'is like', requiresValue: true },
  nlike: { label: 'is not like', requiresValue: true },
  empty: { label: 'is empty', requiresValue: false },
  notempty: { label: 'is not empty', requiresValue: false },
  null: { label: 'is null', requiresValue: false },
  notnull: { label: 'is not null', requiresValue: false },
  gt: { label: 'is greater than', requiresValue: true },
  gte: { label: 'is greater or equal', requiresValue: true },
  lt: { label: 'is less than', requiresValue: true },
  lte: { label: 'is less or equal', requiresValue: true },
  is: { label: 'is', requiresValue: true },
  isnot: { label: 'is not', requiresValue: true },
  in: { label: 'contains', requiresValue: true },
  btw: { label: 'is between', requiresValue: true },
  nbtw: { label: 'is not between', requiresValue: true },
};

/** Get available operators for a column type */
export function getOperatorsForType(uiDataType?: string): string[] {
  const textOps = ['eq', 'neq', 'like', 'nlike', 'empty', 'notempty', 'null', 'notnull'];
  const numericOps = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'empty', 'notempty', 'null', 'notnull'];
  const boolOps = ['is', 'isnot', 'null', 'notnull'];
  const selectOps = ['eq', 'neq', 'like', 'nlike', 'empty', 'notempty', 'null', 'notnull'];

  switch (uiDataType) {
    case 'Number':
    case 'Decimal':
    case 'Currency':
    case 'Percent':
    case 'Duration':
    case 'Rating':
      return numericOps;
    case 'Checkbox':
      return boolOps;
    case 'SingleSelect':
    case 'MultiSelect':
      return selectOps;
    case 'Date':
    case 'DateTime':
    case 'Time':
    case 'Year':
      return [...numericOps, 'btw', 'nbtw'];
    default:
      return textOps;
  }
}

export function useViewFilters() {
  const viewStore = useViewStore();
  const gridStore = useGridStore();

  const filters = computed(() => viewStore.filters);
  const hasFilters = computed(() => viewStore.filters.length > 0);
  const activeFilterCount = computed(() => viewStore.filters.length);

  /** Columns available for filtering */
  const filterableColumns = computed(() =>
    gridStore.columns.filter((c) => !c.system || c.pk)
  );

  async function addFilter(column?: ColumnType): Promise<void> {
    const col = column || gridStore.columns[0];
    if (!col?.id) return;

    const ops = getOperatorsForType(col.uidt);
    await viewStore.addFilter({
      fk_column_id: col.id,
      comparison_op: (ops[0] || 'eq') as FilterType['comparison_op'],
      logical_op: viewStore.filters.length > 0 ? 'and' : undefined,
      value: '',
    });
  }

  async function updateFilter(
    filterId: string,
    updates: Partial<FilterType>
  ): Promise<void> {
    await viewStore.updateFilter(filterId, updates);
  }

  async function changeFilterColumn(
    filterId: string,
    columnId: string
  ): Promise<void> {
    const col = gridStore.columns.find((c) => c.id === columnId);
    const ops = getOperatorsForType(col?.uidt);
    await viewStore.updateFilter(filterId, {
      fk_column_id: columnId,
      comparison_op: (ops[0] || 'eq') as FilterType['comparison_op'],
      value: '',
    });
  }

  async function changeFilterOp(
    filterId: string,
    op: string
  ): Promise<void> {
    const opDef = COMPARISON_OPS[op];
    await viewStore.updateFilter(filterId, {
      comparison_op: op as FilterType['comparison_op'],
      value: opDef?.requiresValue ? undefined : '',
    });
  }

  async function changeFilterValue(
    filterId: string,
    value: string
  ): Promise<void> {
    await viewStore.updateFilter(filterId, { value });
  }

  async function changeFilterLogicalOp(
    filterId: string,
    logicalOp: 'and' | 'or'
  ): Promise<void> {
    await viewStore.updateFilter(filterId, { logical_op: logicalOp });
  }

  async function removeFilter(filterId: string): Promise<void> {
    await viewStore.removeFilter(filterId);
  }

  async function clearAll(): Promise<void> {
    await viewStore.clearFilters();
  }

  return {
    filters,
    hasFilters,
    activeFilterCount,
    filterableColumns,
    addFilter,
    updateFilter,
    changeFilterColumn,
    changeFilterOp,
    changeFilterValue,
    changeFilterLogicalOp,
    removeFilter,
    clearAll,
  };
}
