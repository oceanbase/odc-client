/**
 * Core type definitions for nc-grid-vue
 */
import type { ColumnType, FilterType, SortType, ViewType, TableType } from 'nocodb-sdk';

/** Props accepted by the NcGrid component */
export interface NcGridProps {
  /** NocoDB server base URL (e.g. https://app.nocodb.com) */
  serverUrl: string;
  /** Authentication token (API token or JWT) */
  token: string;
  /** Name of the table to display */
  tableName: string;
  /** Name of the base (project) containing the table */
  baseName: string;
  /** Optional: specific view name to use (defaults to first grid view) */
  viewName?: string;
  /** Page size for pagination (default: 25) */
  pageSize?: number;
  /** Enable infinite scroll instead of pagination (default: false) */
  infiniteScroll?: boolean;
  /** Read-only mode (default: false) */
  readOnly?: boolean;
  /** Row height: 'short' | 'medium' | 'tall' | 'extra' (default: 'short') */
  rowHeight?: RowHeightType;
  /** Show toolbar (default: true) */
  showToolbar?: boolean;
  /** Show pagination (default: true) */
  showPagination?: boolean;
}

export type RowHeightType = 'short' | 'medium' | 'tall' | 'extra';

export const ROW_HEIGHT_MAP: Record<RowHeightType, number> = {
  short: 32,
  medium: 48,
  tall: 64,
  extra: 96,
};

/** A single row record with metadata */
export interface Row {
  /** The actual data fields */
  row: Record<string, unknown>;
  /** Original data before edits (for dirty tracking) */
  oldRow: Record<string, unknown>;
  /** Row metadata */
  rowMeta: RowMeta;
}

export interface RowMeta {
  /** Whether the row is new (not yet saved) */
  new?: boolean;
  /** Whether the row is selected */
  selected?: boolean;
  /** Comment count */
  commentCount?: number;
  /** Whether the row is being saved */
  saving?: boolean;
  /** Whether the row has been changed */
  changed?: boolean;
  /** Row index in the current view */
  rowIndex?: number;
}

/** Cell position identifier */
export interface CellPosition {
  row: number;
  col: number;
}

/** Range selection */
export interface CellRange {
  start: CellPosition;
  end: CellPosition;
}

/** Column with UI metadata */
export interface GridColumn {
  /** NocoDB column definition */
  column: ColumnType;
  /** Column width in pixels */
  width: number;
  /** Whether the column is visible */
  visible: boolean;
  /** Display order */
  order: number;
}

/** Filter condition */
export interface GridFilter {
  id?: string;
  fk_column_id?: string;
  comparison_op?: string;
  comparison_sub_op?: string;
  value?: string;
  logical_op?: 'and' | 'or';
  children?: GridFilter[];
}

/** Sort definition */
export interface GridSort {
  id?: string;
  fk_column_id?: string;
  direction?: 'asc' | 'desc';
  order?: number;
}

/** GroupBy definition */
export interface GridGroupBy {
  id?: string;
  fk_column_id?: string;
  direction?: 'asc' | 'desc';
  order?: number;
}

/** Group data with rows */
export interface GroupData {
  key: string;
  value: unknown;
  count: number;
  rows: Row[];
  paginationData: PaginationData;
  nestedGroups?: GroupData[];
  collapsed?: boolean;
}

/** Pagination state */
export interface PaginationData {
  page: number;
  pageSize: number;
  totalRows: number;
  isFirstPage: boolean;
  isLastPage: boolean;
}

/** Aggregation types */
export type AggregationType =
  | 'count'
  | 'sum'
  | 'avg'
  | 'min'
  | 'max'
  | 'count_empty'
  | 'count_filled'
  | 'count_unique'
  | 'percent_empty'
  | 'percent_filled'
  | 'percent_unique'
  | 'none';

/** Column aggregation config */
export interface ColumnAggregation {
  fk_column_id: string;
  type: AggregationType;
  result?: unknown;
}

/** Undo/redo action */
export interface UndoRedoAction {
  undo: {
    fn: (...args: unknown[]) => Promise<void> | void;
    args: unknown[];
  };
  redo: {
    fn: (...args: unknown[]) => Promise<void> | void;
    args: unknown[];
  };
  scope?: string;
}

/** Events emitted by NcGrid */
export interface NcGridEmits {
  (e: 'row-click', row: Row, index: number): void;
  (e: 'row-select', rows: Row[]): void;
  (e: 'cell-change', row: Row, field: string, value: unknown, oldValue: unknown): void;
  (e: 'error', error: Error): void;
  (e: 'loaded', meta: { totalRows: number; columns: ColumnType[] }): void;
  (e: 'row-create', row: Row): void;
  (e: 'row-delete', row: Row): void;
  (e: 'row-update', row: Row): void;
  (e: 'view-change', view: ViewType): void;
  (e: 'sort-change', sorts: SortType[]): void;
  (e: 'filter-change', filters: FilterType[]): void;
}

/** Injection keys for provide/inject */
export const INJECTION_KEYS = {
  API_CLIENT: Symbol('nc-grid-api-client'),
  GRID_STORE: Symbol('nc-grid-store'),
  VIEW_STORE: Symbol('nc-grid-view-store'),
  SELECTION_STORE: Symbol('nc-grid-selection-store'),
  EDIT_STORE: Symbol('nc-grid-edit-store'),
  UI_STORE: Symbol('nc-grid-ui-store'),
  META: Symbol('nc-grid-meta'),
  ACTIVE_VIEW: Symbol('nc-grid-active-view'),
  IS_READONLY: Symbol('nc-grid-is-readonly'),
  RELOAD_DATA: Symbol('nc-grid-reload-data'),
  RELOAD_VIEW: Symbol('nc-grid-reload-view'),
} as const;

/** Re-export useful nocodb-sdk types */
export type {
  ColumnType,
  FilterType,
  SortType,
  ViewType,
  TableType,
} from 'nocodb-sdk';
