/**
 * useViewGroupBy — Multi-level group by operations
 */
import { ref, computed, watch } from 'vue';
import { useViewStore } from '../stores/viewStore';
import { useGridStore } from '../stores/gridStore';
import type { GroupData } from '../types';
import type { ColumnType } from 'nocodb-sdk';

export function useViewGroupBy() {
  const viewStore = useViewStore();
  const gridStore = useGridStore();

  const groupData = ref<GroupData[]>([]);
  const loading = ref(false);

  const groupBys = computed(() => viewStore.groupBys);
  const hasGroupBy = computed(() => viewStore.groupBys.length > 0);
  const groupByCount = computed(() => viewStore.groupBys.length);

  /** Columns available for grouping */
  const groupableColumns = computed(() => {
    const groupedIds = new Set(viewStore.groupBys.map((g) => g.fk_column_id));
    return gridStore.columns.filter(
      (c) =>
        c.id &&
        !groupedIds.has(c.id) &&
        !c.system &&
        // Only allow certain types for grouping
        ['SingleLineText', 'SingleSelect', 'MultiSelect', 'Number', 'Date',
         'DateTime', 'Checkbox', 'Email', 'URL', 'PhoneNumber', 'Rating',
         'Year', 'Duration', 'Currency', 'Percent', 'Decimal'].includes(c.uidt || '')
    );
  });

  async function addGroupBy(
    column: ColumnType,
    direction: 'asc' | 'desc' = 'asc'
  ): Promise<void> {
    if (!column.id) return;
    viewStore.addGroupBy(column.id, direction);
    await loadGroupData();
  }

  function removeGroupBy(index: number): void {
    viewStore.removeGroupBy(index);
    if (!hasGroupBy.value) {
      groupData.value = [];
    } else {
      loadGroupData();
    }
  }

  function clearAll(): void {
    viewStore.clearGroupBys();
    groupData.value = [];
  }

  async function loadGroupData(): Promise<void> {
    if (!hasGroupBy.value) {
      groupData.value = [];
      return;
    }

    loading.value = true;
    try {
      const client = gridStore.getApiClient();
      const firstGroupBy = viewStore.groupBys[0];
      if (!firstGroupBy?.fk_column_id) return;

      const col = gridStore.columns.find((c) => c.id === firstGroupBy.fk_column_id);
      if (!col?.title) return;

      const ids = client.getResolvedIds();
      const result = await client.getGroupedData(
        ids.viewId || '',
        col.title,
        {
          sort: firstGroupBy.direction === 'desc' ? `-${col.title}` : col.title,
          where: viewStore.whereString || undefined,
        }
      );

      groupData.value = (result as Record<string, unknown>[]).map((group) => ({
        key: String(group[col.title!] ?? '(Empty)'),
        value: group[col.title!],
        count: (group.count as number) || 0,
        rows: [],
        paginationData: {
          page: 1,
          pageSize: 25,
          totalRows: (group.count as number) || 0,
          isFirstPage: true,
          isLastPage: false,
        },
        collapsed: false,
      }));
    } finally {
      loading.value = false;
    }
  }

  async function loadGroupRows(groupIndex: number, page = 1): Promise<void> {
    const group = groupData.value[groupIndex];
    if (!group) return;

    const firstGroupBy = viewStore.groupBys[0];
    const col = gridStore.columns.find((c) => c.id === firstGroupBy?.fk_column_id);
    if (!col?.title) return;

    const client = gridStore.getApiClient();
    const whereClause = group.value != null
      ? `(${col.title},eq,${group.value})`
      : `(${col.title},null,)`;
    const combinedWhere = viewStore.whereString
      ? `${viewStore.whereString}~and${whereClause}`
      : whereClause;

    const result = await client.listRows(undefined, {
      offset: (page - 1) * 25,
      limit: 25,
      where: combinedWhere,
      sort: viewStore.sortString || undefined,
    });

    group.rows = result.list.map((record, index) => ({
      row: { ...record },
      oldRow: { ...record },
      rowMeta: {
        new: false,
        selected: false,
        commentCount: 0,
        saving: false,
        changed: false,
        rowIndex: (page - 1) * 25 + index,
      },
    }));

    group.paginationData = {
      ...result.pageInfo,
      page,
      pageSize: 25,
    };
  }

  function toggleGroupCollapse(groupIndex: number): void {
    const group = groupData.value[groupIndex];
    if (!group) return;
    group.collapsed = !group.collapsed;
    if (!group.collapsed && group.rows.length === 0) {
      loadGroupRows(groupIndex);
    }
  }

  return {
    groupData,
    loading,
    groupBys,
    hasGroupBy,
    groupByCount,
    groupableColumns,
    addGroupBy,
    removeGroupBy,
    clearAll,
    loadGroupData,
    loadGroupRows,
    toggleGroupCollapse,
  };
}
