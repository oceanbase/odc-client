/**
 * Central grid store — manages rows, columns, table metadata, pagination, and loading state
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ColumnType, TableType } from 'nocodb-sdk';
import type { NcApiClient } from '../api/client';
import type { Row, PaginationData, RowMeta } from '../types';

export const useGridStore = defineStore('nc-grid', () => {
  // ── State ──
  const loading = ref(false);
  const error = ref<Error | null>(null);
  const tableMeta = ref<TableType | null>(null);
  const columns = ref<ColumnType[]>([]);
  const rows = ref<Row[]>([]);
  const paginationData = ref<PaginationData>({
    page: 1,
    pageSize: 25,
    totalRows: 0,
    isFirstPage: true,
    isLastPage: true,
  });
  const searchQuery = ref('');

  // ── API client (set during initialization) ──
  let apiClient: NcApiClient | null = null;

  // ── Computed ──
  const totalRows = computed(() => paginationData.value.totalRows);
  const totalPages = computed(() =>
    Math.ceil(paginationData.value.totalRows / paginationData.value.pageSize)
  );
  const currentPage = computed(() => paginationData.value.page);
  const visibleColumns = computed(() =>
    columns.value.filter((c) => !c.system || c.pk)
  );
  const primaryKey = computed(() =>
    columns.value.find((c) => c.pk)
  );
  const primaryValueColumn = computed(() =>
    columns.value.find((c) => c.pv) || columns.value[0]
  );

  // ── Actions ──

  function setApiClient(client: NcApiClient) {
    apiClient = client;
  }

  function getApiClient(): NcApiClient {
    if (!apiClient) throw new Error('API client not initialized');
    return apiClient;
  }

  async function loadTableMeta(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const client = getApiClient();
      const meta = await client.getTableMeta();
      tableMeta.value = meta;
      columns.value = (meta.columns || []) as ColumnType[];
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e));
      throw error.value;
    } finally {
      loading.value = false;
    }
  }

  async function loadRows(params?: {
    page?: number;
    pageSize?: number;
    where?: string;
    sort?: string;
    fields?: string;
  }): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const client = getApiClient();
      const page = params?.page ?? paginationData.value.page;
      const pageSize = params?.pageSize ?? paginationData.value.pageSize;

      const result = await client.listRows(undefined, {
        offset: (page - 1) * pageSize,
        limit: pageSize,
        where: params?.where,
        sort: params?.sort,
        fields: params?.fields,
      });

      rows.value = result.list.map((record, index) => ({
        row: { ...record },
        oldRow: { ...record },
        rowMeta: {
          new: false,
          selected: false,
          commentCount: 0,
          saving: false,
          changed: false,
          rowIndex: (page - 1) * pageSize + index,
        },
      }));

      paginationData.value = {
        ...result.pageInfo,
        page,
        pageSize,
      };
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e));
      throw error.value;
    } finally {
      loading.value = false;
    }
  }

  async function createRow(data: Record<string, unknown>): Promise<Row> {
    const client = getApiClient();
    const created = await client.createRow(data);
    const newRow: Row = {
      row: { ...created },
      oldRow: { ...created },
      rowMeta: {
        new: false,
        selected: false,
        commentCount: 0,
        saving: false,
        changed: false,
      },
    };
    rows.value.push(newRow);
    paginationData.value.totalRows += 1;
    return newRow;
  }

  async function updateRow(
    rowIndex: number,
    field: string,
    value: unknown
  ): Promise<void> {
    const row = rows.value[rowIndex];
    if (!row) throw new Error(`Row at index ${rowIndex} not found`);

    const pk = primaryKey.value;
    if (!pk?.title) throw new Error('Primary key not found');

    const rowId = String(row.row[pk.title]);
    const client = getApiClient();

    row.rowMeta.saving = true;
    try {
      await client.updateRow(rowId, { [field]: value });
      row.row[field] = value;
      row.oldRow[field] = value;
      row.rowMeta.changed = false;
    } finally {
      row.rowMeta.saving = false;
    }
  }

  async function deleteRow(rowIndex: number): Promise<void> {
    const row = rows.value[rowIndex];
    if (!row) throw new Error(`Row at index ${rowIndex} not found`);

    const pk = primaryKey.value;
    if (!pk?.title) throw new Error('Primary key not found');

    const rowId = String(row.row[pk.title]);
    const client = getApiClient();

    await client.deleteRow(rowId);
    rows.value.splice(rowIndex, 1);
    paginationData.value.totalRows -= 1;
  }

  async function bulkDeleteRows(indices: number[]): Promise<void> {
    const pk = primaryKey.value;
    if (!pk?.title) throw new Error('Primary key not found');

    const client = getApiClient();
    const rowIds = indices.map((i) => {
      const row = rows.value[i];
      if (!row) throw new Error(`Row at index ${i} not found`);
      return { [pk.title!]: row.row[pk.title!] };
    });

    await client.bulkDelete(rowIds);

    // Remove from local state (reverse order to maintain indices)
    const sorted = [...indices].sort((a, b) => b - a);
    for (const idx of sorted) {
      rows.value.splice(idx, 1);
    }
    paginationData.value.totalRows -= indices.length;
  }

  function addEmptyRow(): Row {
    const emptyData: Record<string, unknown> = {};
    for (const col of columns.value) {
      if (col.title && !col.pk && !col.ai) {
        emptyData[col.title] = null;
      }
    }
    const newRow: Row = {
      row: emptyData,
      oldRow: {},
      rowMeta: {
        new: true,
        selected: false,
        commentCount: 0,
        saving: false,
        changed: true,
      },
    };
    rows.value.push(newRow);
    return newRow;
  }

  async function saveNewRow(rowIndex: number): Promise<void> {
    const row = rows.value[rowIndex];
    if (!row || !row.rowMeta.new) return;

    row.rowMeta.saving = true;
    try {
      const client = getApiClient();
      const created = await client.createRow(row.row);
      row.row = { ...created };
      row.oldRow = { ...created };
      row.rowMeta.new = false;
      row.rowMeta.changed = false;
    } finally {
      row.rowMeta.saving = false;
    }
  }

  async function duplicateRow(rowIndex: number): Promise<Row> {
    const row = rows.value[rowIndex];
    if (!row) throw new Error(`Row at index ${rowIndex} not found`);

    const pk = primaryKey.value;
    const data = { ...row.row };
    // Remove primary key and auto-increment fields
    if (pk?.title) delete data[pk.title];
    for (const col of columns.value) {
      if (col.ai && col.title) delete data[col.title];
      // Remove system fields
      if (col.system && col.title) delete data[col.title];
    }

    return await createRow(data);
  }

  function setPageSize(size: number): void {
    paginationData.value.pageSize = size;
  }

  async function goToPage(page: number): Promise<void> {
    await loadRows({ page });
  }

  async function reload(): Promise<void> {
    await loadRows();
  }

  function setSearch(query: string): void {
    searchQuery.value = query;
  }

  function $reset(): void {
    loading.value = false;
    error.value = null;
    tableMeta.value = null;
    columns.value = [];
    rows.value = [];
    paginationData.value = {
      page: 1,
      pageSize: 25,
      totalRows: 0,
      isFirstPage: true,
      isLastPage: true,
    };
    searchQuery.value = '';
    apiClient = null;
  }

  return {
    // State
    loading,
    error,
    tableMeta,
    columns,
    rows,
    paginationData,
    searchQuery,
    // Computed
    totalRows,
    totalPages,
    currentPage,
    visibleColumns,
    primaryKey,
    primaryValueColumn,
    // Actions
    setApiClient,
    getApiClient,
    loadTableMeta,
    loadRows,
    createRow,
    updateRow,
    deleteRow,
    bulkDeleteRows,
    addEmptyRow,
    saveNewRow,
    duplicateRow,
    setPageSize,
    goToPage,
    reload,
    setSearch,
    $reset,
  };
});
