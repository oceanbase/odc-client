/**
 * API client wrapper around nocodb-sdk
 * Initializes with serverUrl and token, resolves baseName/tableName to IDs
 */
import { Api } from 'nocodb-sdk';
import type { ColumnType, FilterType, SortType, TableType, ViewType } from 'nocodb-sdk';
import type { AggregationType, PaginationData, Row } from '../types';

export interface NcApiClientOptions {
  serverUrl: string;
  token: string;
}

export interface ResolvedIds {
  baseId: string;
  tableId: string;
  viewId?: string;
}

export class NcApiClient {
  public api: Api<unknown>;
  private serverUrl: string;
  private token: string;

  /** Cached resolved IDs */
  private resolvedIds: ResolvedIds | null = null;
  private tableMeta: TableType | null = null;

  constructor(options: NcApiClientOptions) {
    this.serverUrl = options.serverUrl;
    this.token = options.token;
    this.api = new Api({
      baseURL: options.serverUrl,
      headers: {
        'xc-auth': options.token,
      },
    });
  }

  /** Resolve baseName to baseId */
  async resolveBaseId(baseName: string): Promise<string> {
    const bases = await this.api.base.list();
    const base = (bases.list || []).find(
      (b: { title?: string }) => b.title === baseName
    );
    if (!base || !base.id) {
      throw new Error(`Base "${baseName}" not found`);
    }
    return base.id;
  }

  /** Resolve tableName to tableId within a base */
  async resolveTableId(baseId: string, tableName: string): Promise<string> {
    const tables = await this.api.dbTable.list(baseId);
    const table = (tables.list || []).find(
      (t: { title?: string }) => t.title === tableName
    );
    if (!table || !table.id) {
      throw new Error(`Table "${tableName}" not found in base`);
    }
    return table.id;
  }

  /** Resolve viewName to viewId (optional, defaults to first grid view) */
  async resolveViewId(tableId: string, viewName?: string): Promise<string> {
    const views = await this.api.dbView.list(tableId);
    let view: ViewType | undefined;
    if (viewName) {
      view = (views.list || []).find(
        (v: ViewType) => v.title === viewName
      );
    } else {
      // Default to first grid view
      view = (views.list || []).find(
        (v: ViewType) => v.type === 3 /* Grid */
      );
      if (!view) {
        view = (views.list || [])[0];
      }
    }
    if (!view || !view.id) {
      throw new Error(`View "${viewName || 'default grid'}" not found`);
    }
    return view.id;
  }

  /** Initialize: resolve names to IDs */
  async initialize(baseName: string, tableName: string, viewName?: string): Promise<ResolvedIds> {
    const baseId = await this.resolveBaseId(baseName);
    const tableId = await this.resolveTableId(baseId, tableName);
    const viewId = await this.resolveViewId(tableId, viewName);
    this.resolvedIds = { baseId, tableId, viewId };
    return this.resolvedIds;
  }

  getResolvedIds(): ResolvedIds {
    if (!this.resolvedIds) {
      throw new Error('API client not initialized. Call initialize() first.');
    }
    return this.resolvedIds;
  }

  // ──────────────── Table Meta ────────────────

  async getTableMeta(tableId?: string): Promise<TableType> {
    const id = tableId || this.getResolvedIds().tableId;
    const meta = await this.api.dbTable.read(id);
    this.tableMeta = meta;
    return meta;
  }

  async getColumns(tableId?: string): Promise<ColumnType[]> {
    const meta = await this.getTableMeta(tableId);
    return (meta.columns || []) as ColumnType[];
  }

  // ──────────────── Views ────────────────

  async getViews(tableId?: string): Promise<ViewType[]> {
    const id = tableId || this.getResolvedIds().tableId;
    const res = await this.api.dbView.list(id);
    return (res.list || []) as ViewType[];
  }

  async getView(viewId?: string): Promise<ViewType> {
    // The SDK doesn't have a direct view read, use list + filter
    const { tableId } = this.getResolvedIds();
    const vid = viewId || this.getResolvedIds().viewId;
    const views = await this.getViews(tableId);
    const view = views.find((v) => v.id === vid);
    if (!view) throw new Error('View not found');
    return view;
  }

  // ──────────────── Row CRUD ────────────────

  async listRows(
    viewId?: string,
    params?: {
      offset?: number;
      limit?: number;
      where?: string;
      sort?: string;
      fields?: string;
    }
  ): Promise<{ list: Record<string, unknown>[]; pageInfo: PaginationData }> {
    const vid = viewId || this.getResolvedIds().viewId;
    if (!vid) throw new Error('View ID required');
    const res = await this.api.dbViewRow.list(
      'noco',
      this.getResolvedIds().baseId,
      this.getResolvedIds().tableId,
      vid,
      params as Record<string, unknown>
    );
    const list = (res as { list?: Record<string, unknown>[] }).list || [];
    const pageInfo = (res as { pageInfo?: Record<string, unknown> }).pageInfo || {};
    return {
      list,
      pageInfo: {
        page: (pageInfo.page as number) || 1,
        pageSize: (pageInfo.pageSize as number) || 25,
        totalRows: (pageInfo.totalRows as number) || 0,
        isFirstPage: (pageInfo.isFirstPage as boolean) ?? true,
        isLastPage: (pageInfo.isLastPage as boolean) ?? true,
      },
    };
  }

  async createRow(
    data: Record<string, unknown>,
    viewId?: string
  ): Promise<Record<string, unknown>> {
    const { baseId, tableId } = this.getResolvedIds();
    const vid = viewId || this.getResolvedIds().viewId;
    if (!vid) throw new Error('View ID required');
    return (await this.api.dbViewRow.create(
      'noco',
      baseId,
      tableId,
      vid,
      data
    )) as Record<string, unknown>;
  }

  async updateRow(
    rowId: string,
    data: Record<string, unknown>,
    viewId?: string
  ): Promise<Record<string, unknown>> {
    const { baseId, tableId } = this.getResolvedIds();
    const vid = viewId || this.getResolvedIds().viewId;
    if (!vid) throw new Error('View ID required');
    return (await this.api.dbViewRow.update(
      'noco',
      baseId,
      tableId,
      vid,
      rowId,
      data
    )) as Record<string, unknown>;
  }

  async deleteRow(
    rowId: string,
    viewId?: string
  ): Promise<void> {
    const { baseId, tableId } = this.getResolvedIds();
    const vid = viewId || this.getResolvedIds().viewId;
    if (!vid) throw new Error('View ID required');
    await this.api.dbViewRow.delete(
      'noco',
      baseId,
      tableId,
      vid,
      rowId
    );
  }

  async bulkCreate(
    rows: Record<string, unknown>[],
    viewId?: string
  ): Promise<Record<string, unknown>[]> {
    const { baseId, tableId } = this.getResolvedIds();
    const vid = viewId || this.getResolvedIds().viewId;
    if (!vid) throw new Error('View ID required');
    return (await this.api.dbTableRow.bulkCreate(
      'noco',
      baseId,
      tableId,
      rows
    )) as Record<string, unknown>[];
  }

  async bulkUpdate(
    rows: Record<string, unknown>[],
    viewId?: string
  ): Promise<unknown> {
    const { baseId, tableId } = this.getResolvedIds();
    const vid = viewId || this.getResolvedIds().viewId;
    if (!vid) throw new Error('View ID required');
    return await this.api.dbTableRow.bulkUpdate(
      'noco',
      baseId,
      tableId,
      rows
    );
  }

  async bulkDelete(
    rowIds: Record<string, unknown>[],
    viewId?: string
  ): Promise<unknown> {
    const { baseId, tableId } = this.getResolvedIds();
    const vid = viewId || this.getResolvedIds().viewId;
    if (!vid) throw new Error('View ID required');
    return await this.api.dbTableRow.bulkDelete(
      'noco',
      baseId,
      tableId,
      rowIds
    );
  }

  // ──────────────── Sorting ────────────────

  async getSorts(viewId?: string): Promise<SortType[]> {
    const vid = viewId || this.getResolvedIds().viewId;
    if (!vid) throw new Error('View ID required');
    const res = await this.api.dbTableSort.list(vid);
    return (res as { list?: SortType[] }).list || [];
  }

  async createSort(
    data: Partial<SortType>,
    viewId?: string
  ): Promise<SortType> {
    const vid = viewId || this.getResolvedIds().viewId;
    if (!vid) throw new Error('View ID required');
    return (await this.api.dbTableSort.create(vid, data)) as SortType;
  }

  async updateSort(sortId: string, data: Partial<SortType>): Promise<unknown> {
    return await this.api.dbTableSort.update(sortId, data);
  }

  async deleteSort(sortId: string): Promise<void> {
    await this.api.dbTableSort.delete(sortId);
  }

  // ──────────────── Filters ────────────────

  async getFilters(viewId?: string): Promise<FilterType[]> {
    const vid = viewId || this.getResolvedIds().viewId;
    if (!vid) throw new Error('View ID required');
    const res = await this.api.dbTableFilter.read(vid);
    return ((res as { children?: FilterType[] }).children || [res]) as FilterType[];
  }

  async createFilter(
    data: Partial<FilterType>,
    viewId?: string
  ): Promise<FilterType> {
    const vid = viewId || this.getResolvedIds().viewId;
    if (!vid) throw new Error('View ID required');
    return (await this.api.dbTableFilter.create(vid, data)) as FilterType;
  }

  async updateFilter(filterId: string, data: Partial<FilterType>): Promise<unknown> {
    return await this.api.dbTableFilter.update(filterId, data);
  }

  async deleteFilter(filterId: string): Promise<void> {
    await this.api.dbTableFilter.delete(filterId);
  }

  // ──────────────── View Columns ────────────────

  async getViewColumns(viewId?: string): Promise<Record<string, unknown>[]> {
    const vid = viewId || this.getResolvedIds().viewId;
    if (!vid) throw new Error('View ID required');
    const res = await this.api.dbView.columnList(vid);
    return (res as unknown[]) as Record<string, unknown>[];
  }

  async updateViewColumn(
    viewId: string,
    columnId: string,
    data: Record<string, unknown>
  ): Promise<unknown> {
    return await this.api.dbView.columnUpdate(viewId, columnId, data);
  }

  // ──────────────── Column CRUD ────────────────

  async createColumn(
    tableId: string,
    data: Partial<ColumnType>
  ): Promise<ColumnType> {
    return (await this.api.dbTableColumn.create(tableId, data)) as ColumnType;
  }

  async updateColumn(columnId: string, data: Partial<ColumnType>): Promise<ColumnType> {
    return (await this.api.dbTableColumn.update(columnId, data)) as ColumnType;
  }

  async deleteColumn(columnId: string): Promise<void> {
    await this.api.dbTableColumn.delete(columnId);
  }

  // ──────────────── Attachments ────────────────

  async uploadAttachment(
    file: File | Blob,
    params?: Record<string, unknown>
  ): Promise<unknown> {
    const formData = new FormData();
    formData.append('file', file);
    return await this.api.storage.upload(
      {
        path: `noco/${this.getResolvedIds().baseId}/${this.getResolvedIds().tableId}`,
        ...params,
      },
      {
        body: formData as unknown as Record<string, unknown>,
      }
    );
  }

  // ──────────────── Comments ────────────────

  async getComments(rowId: string): Promise<unknown[]> {
    const { baseId, tableId } = this.getResolvedIds();
    const res = await this.api.utils.commentList({
      row_id: rowId,
      fk_model_id: tableId,
    });
    return (res as { list?: unknown[] }).list || [];
  }

  async createComment(rowId: string, comment: string): Promise<unknown> {
    const { tableId } = this.getResolvedIds();
    return await this.api.utils.commentRow({
      row_id: rowId,
      fk_model_id: tableId,
      comment,
    });
  }

  // ──────────────── Aggregation ────────────────

  async getAggregation(
    viewId: string,
    columnId: string,
    type: AggregationType
  ): Promise<unknown> {
    // NocoDB aggregation via view row count or custom endpoint
    const { baseId, tableId } = this.getResolvedIds();
    return await this.api.dbViewRow.count(
      'noco',
      baseId,
      tableId,
      viewId
    );
  }

  // ──────────────── Export ────────────────

  async exportCsv(viewId?: string): Promise<Blob> {
    const vid = viewId || this.getResolvedIds().viewId;
    if (!vid) throw new Error('View ID required');
    const { baseId, tableId } = this.getResolvedIds();
    const res = await this.api.dbViewRow.export(
      'noco',
      baseId,
      tableId,
      vid,
      'csv' as unknown as Record<string, unknown>
    );
    return new Blob([res as string], { type: 'text/csv' });
  }

  async exportExcel(viewId?: string): Promise<Blob> {
    const vid = viewId || this.getResolvedIds().viewId;
    if (!vid) throw new Error('View ID required');
    const { baseId, tableId } = this.getResolvedIds();
    const res = await this.api.dbViewRow.export(
      'noco',
      baseId,
      tableId,
      vid,
      'excel' as unknown as Record<string, unknown>
    );
    return new Blob([res as BlobPart], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  // ──────────────── Row count ────────────────

  async getRowCount(viewId?: string, where?: string): Promise<number> {
    const vid = viewId || this.getResolvedIds().viewId;
    if (!vid) throw new Error('View ID required');
    const { baseId, tableId } = this.getResolvedIds();
    const res = await this.api.dbViewRow.count(
      'noco',
      baseId,
      tableId,
      vid,
      where ? { where } : undefined
    );
    return (res as { count?: number }).count || 0;
  }

  // ──────────────── Group By ────────────────

  async getGroupedData(
    viewId: string,
    columnId: string,
    params?: Record<string, unknown>
  ): Promise<unknown[]> {
    const { baseId, tableId } = this.getResolvedIds();
    const res = await this.api.dbViewRow.groupBy(
      'noco',
      baseId,
      tableId,
      viewId,
      {
        column_name: columnId,
        ...params,
      } as Record<string, unknown>
    );
    return (res as unknown[]) || [];
  }
}

/** Factory function to create a new API client */
export function createNcApiClient(options: NcApiClientOptions): NcApiClient {
  return new NcApiClient(options);
}
