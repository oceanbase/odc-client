/**
 * Main entry point for nc-grid-vue
 * Exports the NcGrid component, stores, composables, and types.
 */
import type { App, Plugin } from 'vue';
import { createPinia } from 'pinia';
import NcGrid from './components/NcGrid.vue';
import './styles/variables.css';

// ── Default Export: NcGrid Component ──
export default NcGrid;

// ── Named Component Export ──
export { NcGrid };

// ── API Client ──
export { NcApiClient, createNcApiClient } from './api/client';
export type { NcApiClientOptions, ResolvedIds } from './api/client';

// ── Stores ──
export {
  useGridStore,
  useViewStore,
  useSelectionStore,
  useEditStore,
  useUIStore,
} from './stores';

// ── Composables ──
export {
  useGridViewData,
  useInfiniteData,
  useViewSorts,
  useViewFilters,
  useViewGroupBy,
  useViewColumns,
  useMultiSelect,
  useCopy,
  usePaste,
  useUndoRedo,
  useColumnDrag,
  useRowDragging,
  useKeyboardNavigation,
  useRowExpand,
  useViewAggregate,
  useRowComments,
  COMPARISON_OPS,
  getOperatorsForType,
} from './composables';

// ── Types ──
export type {
  NcGridProps,
  NcGridEmits,
  Row,
  RowMeta,
  CellPosition,
  CellRange,
  GridColumn,
  GridFilter,
  GridSort,
  GridGroupBy,
  GroupData,
  PaginationData,
  AggregationType,
  ColumnAggregation,
  UndoRedoAction,
  RowHeightType,
  ColumnType,
  FilterType,
  SortType,
  ViewType,
  TableType,
} from './types';

export { INJECTION_KEYS, ROW_HEIGHT_MAP } from './types';

// ── Sub-components (for advanced usage) ──
export { default as GridTable } from './components/grid/Table.vue';
export { default as InfiniteTable } from './components/grid/InfiniteTable.vue';
export { default as GroupByTable } from './components/grid/GroupByTable.vue';
export { default as GridToolbar } from './components/toolbar/Toolbar.vue';
export { default as GridPagination } from './components/Pagination.vue';
export { default as GridAggregation } from './components/Aggregation.vue';
export { default as ExpandedForm } from './components/row/ExpandedForm.vue';
export { default as CellComponent } from './components/cell/Cell.vue';
export { default as VirtualCell } from './components/cell/VirtualCell.vue';
export { default as HeaderCell } from './components/header/HeaderCell.vue';

// ── Vue Plugin ──
export const NcGridPlugin: Plugin = {
  install(app: App) {
    // Ensure Pinia is available
    if (!app.config.globalProperties.$pinia) {
      app.use(createPinia());
    }
    app.component('NcGrid', NcGrid);
  },
};
