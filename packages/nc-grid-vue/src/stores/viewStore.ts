/**
 * View store — manages active view configuration (sorts, filters, groupBy, column config)
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { FilterType, SortType, ViewType } from 'nocodb-sdk';
import type { NcApiClient } from '../api/client';
import type { GridGroupBy } from '../types';

export const useViewStore = defineStore('nc-grid-view', () => {
  // ── State ──
  const activeView = ref<ViewType | null>(null);
  const views = ref<ViewType[]>([]);
  const sorts = ref<SortType[]>([]);
  const filters = ref<FilterType[]>([]);
  const groupBys = ref<GridGroupBy[]>([]);
  const viewColumns = ref<Record<string, unknown>[]>([]);
  const loading = ref(false);

  let apiClient: NcApiClient | null = null;

  // ── Computed ──
  const viewId = computed(() => activeView.value?.id || '');
  const viewTitle = computed(() => activeView.value?.title || '');
  const sortString = computed(() => {
    return sorts.value
      .map((s) => {
        const col = s.fk_column_id;
        const dir = s.direction === 'desc' ? '-' : '';
        return `${dir}${col}`;
      })
      .join(',');
  });
  const whereString = computed(() => {
    return buildWhereString(filters.value);
  });

  const hiddenColumnIds = computed(() => {
    return new Set(
      viewColumns.value
        .filter((vc) => !(vc as Record<string, unknown>).show)
        .map((vc) => (vc as Record<string, unknown>).fk_column_id as string)
    );
  });

  const columnOrder = computed(() => {
    const orderMap = new Map<string, number>();
    viewColumns.value.forEach((vc) => {
      const colId = (vc as Record<string, unknown>).fk_column_id as string;
      const order = (vc as Record<string, unknown>).order as number;
      if (colId) orderMap.set(colId, order ?? 0);
    });
    return orderMap;
  });

  const columnWidths = computed(() => {
    const widthMap = new Map<string, number>();
    viewColumns.value.forEach((vc) => {
      const colId = (vc as Record<string, unknown>).fk_column_id as string;
      const width = (vc as Record<string, unknown>).width as string;
      if (colId && width) widthMap.set(colId, parseInt(width, 10) || 200);
    });
    return widthMap;
  });

  // ── Actions ──

  function setApiClient(client: NcApiClient) {
    apiClient = client;
  }

  function getApiClient(): NcApiClient {
    if (!apiClient) throw new Error('API client not initialized');
    return apiClient;
  }

  async function loadViews(): Promise<void> {
    const client = getApiClient();
    views.value = await client.getViews();
  }

  async function setActiveView(view: ViewType): Promise<void> {
    activeView.value = view;
    await Promise.all([loadSorts(), loadFilters(), loadViewColumns()]);
  }

  async function loadSorts(): Promise<void> {
    if (!viewId.value) return;
    const client = getApiClient();
    sorts.value = await client.getSorts(viewId.value);
  }

  async function loadFilters(): Promise<void> {
    if (!viewId.value) return;
    const client = getApiClient();
    filters.value = await client.getFilters(viewId.value);
  }

  async function loadViewColumns(): Promise<void> {
    if (!viewId.value) return;
    const client = getApiClient();
    viewColumns.value = await client.getViewColumns(viewId.value);
  }

  // ── Sort operations ──

  async function addSort(columnId: string, direction: 'asc' | 'desc' = 'asc'): Promise<void> {
    const client = getApiClient();
    const newSort = await client.createSort(
      { fk_column_id: columnId, direction },
      viewId.value
    );
    sorts.value.push(newSort);
  }

  async function updateSort(sortId: string, data: Partial<SortType>): Promise<void> {
    const client = getApiClient();
    await client.updateSort(sortId, data);
    const idx = sorts.value.findIndex((s) => s.id === sortId);
    if (idx >= 0) {
      sorts.value[idx] = { ...sorts.value[idx], ...data };
    }
  }

  async function removeSort(sortId: string): Promise<void> {
    const client = getApiClient();
    await client.deleteSort(sortId);
    sorts.value = sorts.value.filter((s) => s.id !== sortId);
  }

  async function clearSorts(): Promise<void> {
    const client = getApiClient();
    await Promise.all(sorts.value.map((s) => s.id && client.deleteSort(s.id)));
    sorts.value = [];
  }

  // ── Filter operations ──

  async function addFilter(filter: Partial<FilterType>): Promise<void> {
    const client = getApiClient();
    const newFilter = await client.createFilter(filter, viewId.value);
    filters.value.push(newFilter);
  }

  async function updateFilter(filterId: string, data: Partial<FilterType>): Promise<void> {
    const client = getApiClient();
    await client.updateFilter(filterId, data);
    const idx = filters.value.findIndex((f) => f.id === filterId);
    if (idx >= 0) {
      filters.value[idx] = { ...filters.value[idx], ...data };
    }
  }

  async function removeFilter(filterId: string): Promise<void> {
    const client = getApiClient();
    await client.deleteFilter(filterId);
    filters.value = filters.value.filter((f) => f.id !== filterId);
  }

  async function clearFilters(): Promise<void> {
    const client = getApiClient();
    await Promise.all(
      filters.value.map((f) => f.id && client.deleteFilter(f.id))
    );
    filters.value = [];
  }

  // ── Column visibility/order ──

  async function toggleColumnVisibility(
    columnId: string,
    show: boolean
  ): Promise<void> {
    const client = getApiClient();
    await client.updateViewColumn(viewId.value, columnId, { show });
    const vc = viewColumns.value.find(
      (v) => (v as Record<string, unknown>).fk_column_id === columnId
    );
    if (vc) {
      (vc as Record<string, unknown>).show = show;
    }
  }

  async function updateColumnWidth(
    columnId: string,
    width: number
  ): Promise<void> {
    const client = getApiClient();
    await client.updateViewColumn(viewId.value, columnId, {
      width: String(width),
    });
    const vc = viewColumns.value.find(
      (v) => (v as Record<string, unknown>).fk_column_id === columnId
    );
    if (vc) {
      (vc as Record<string, unknown>).width = String(width);
    }
  }

  async function updateColumnOrder(
    columnId: string,
    order: number
  ): Promise<void> {
    const client = getApiClient();
    await client.updateViewColumn(viewId.value, columnId, { order });
    const vc = viewColumns.value.find(
      (v) => (v as Record<string, unknown>).fk_column_id === columnId
    );
    if (vc) {
      (vc as Record<string, unknown>).order = order;
    }
  }

  // ── GroupBy ──

  function addGroupBy(columnId: string, direction: 'asc' | 'desc' = 'asc'): void {
    groupBys.value.push({ fk_column_id: columnId, direction });
  }

  function removeGroupBy(index: number): void {
    groupBys.value.splice(index, 1);
  }

  function clearGroupBys(): void {
    groupBys.value = [];
  }

  function $reset(): void {
    activeView.value = null;
    views.value = [];
    sorts.value = [];
    filters.value = [];
    groupBys.value = [];
    viewColumns.value = [];
    loading.value = false;
    apiClient = null;
  }

  return {
    // State
    activeView,
    views,
    sorts,
    filters,
    groupBys,
    viewColumns,
    loading,
    // Computed
    viewId,
    viewTitle,
    sortString,
    whereString,
    hiddenColumnIds,
    columnOrder,
    columnWidths,
    // Actions
    setApiClient,
    loadViews,
    setActiveView,
    loadSorts,
    loadFilters,
    loadViewColumns,
    addSort,
    updateSort,
    removeSort,
    clearSorts,
    addFilter,
    updateFilter,
    removeFilter,
    clearFilters,
    toggleColumnVisibility,
    updateColumnWidth,
    updateColumnOrder,
    addGroupBy,
    removeGroupBy,
    clearGroupBys,
    $reset,
  };
});

/** Build a where clause string from filter array */
function buildWhereString(filters: FilterType[]): string {
  if (!filters || filters.length === 0) return '';

  return filters
    .map((f, i) => {
      const op = i === 0 ? '' : `~${f.logical_op || 'and'}`;
      const field = f.fk_column_id || '';
      const comparison = f.comparison_op || 'eq';
      const value = f.value ?? '';
      return `${op}(${field},${comparison},${value})`;
    })
    .join('');
}
