<script setup lang="ts">
/**
 * GroupByTable.vue — Grouped table with collapsible sections
 */
import { computed, onMounted } from 'vue';
import { useGridStore } from '../../stores/gridStore';
import { useViewStore } from '../../stores/viewStore';
import { useViewGroupBy } from '../../composables/useViewGroupBy';
import GroupByLabel from './GroupByLabel.vue';
import Cell from '../cell/Cell.vue';
import { ROW_HEIGHT_MAP } from '../../types';
import { useUIStore } from '../../stores/uiStore';

const gridStore = useGridStore();
const viewStore = useViewStore();
const uiStore = useUIStore();

const {
  groupData,
  loading,
  loadGroupData,
  loadGroupRows,
  toggleGroupCollapse,
} = useViewGroupBy();

const visibleColumns = computed(() => {
  const hidden = viewStore.hiddenColumnIds;
  const order = viewStore.columnOrder;

  return gridStore.columns
    .filter((col) => col.id && !hidden.has(col.id))
    .sort((a, b) => {
      const orderA = order.get(a.id || '') ?? 0;
      const orderB = order.get(b.id || '') ?? 0;
      return orderA - orderB;
    });
});

function getColumnWidth(colId: string): string {
  const width = viewStore.columnWidths.get(colId);
  return width ? `${width}px` : '200px';
}

const rowHeightPx = computed(() => ROW_HEIGHT_MAP[uiStore.rowHeight]);

onMounted(() => {
  loadGroupData();
});
</script>

<template>
  <div class="nc-group-by-table">
    <!-- Loading -->
    <div v-if="loading" class="nc-group-loading">
      <div class="nc-grid-spinner" />
      <span>Loading groups...</span>
    </div>

    <!-- Groups -->
    <div v-else>
      <div
        v-for="(group, groupIdx) in groupData"
        :key="group.key"
        class="nc-group"
      >
        <!-- Group Header -->
        <GroupByLabel
          :group="group"
          :group-index="groupIdx"
          @toggle="toggleGroupCollapse(groupIdx)"
        />

        <!-- Group Rows -->
        <div v-if="!group.collapsed" class="nc-group-content">
          <table class="nc-table" v-if="group.rows.length > 0">
            <thead>
              <tr class="nc-table-header-row">
                <th class="nc-th nc-th-row-index" style="width: 64px;">
                  <div class="nc-th-content">#</div>
                </th>
                <th
                  v-for="col in visibleColumns"
                  :key="col.id"
                  class="nc-th"
                  :style="{ width: getColumnWidth(col.id || '') }"
                >
                  <div class="nc-th-content">{{ col.title }}</div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, rowIdx) in group.rows"
                :key="rowIdx"
                class="nc-table-row"
                :style="{ height: `${rowHeightPx}px` }"
              >
                <td class="nc-td nc-td-row-index">
                  <div class="nc-td-content">{{ rowIdx + 1 }}</div>
                </td>
                <td
                  v-for="(col, colIdx) in visibleColumns"
                  :key="col.id"
                  class="nc-td"
                  :style="{ width: getColumnWidth(col.id || '') }"
                >
                  <Cell
                    :column="col"
                    :row="row"
                    :row-index="rowIdx"
                    :col-index="colIdx"
                    :is-editing="false"
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Load rows button if rows not loaded yet -->
          <div v-else class="nc-group-load-rows">
            <button
              class="nc-grid-btn nc-grid-btn-sm"
              @click="loadGroupRows(groupIdx)"
            >
              Load {{ group.count }} rows
            </button>
          </div>

          <!-- Group pagination -->
          <div v-if="group.paginationData.totalRows > 25" class="nc-group-pagination">
            <button
              class="nc-grid-btn nc-grid-btn-sm"
              :disabled="group.paginationData.page <= 1"
              @click="loadGroupRows(groupIdx, group.paginationData.page - 1)"
            >
              ← Prev
            </button>
            <span class="nc-group-page-info">
              Page {{ group.paginationData.page }} of {{ Math.ceil(group.paginationData.totalRows / 25) }}
            </span>
            <button
              class="nc-grid-btn nc-grid-btn-sm"
              :disabled="group.paginationData.page >= Math.ceil(group.paginationData.totalRows / 25)"
              @click="loadGroupRows(groupIdx, group.paginationData.page + 1)"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      <!-- Empty groups -->
      <div v-if="groupData.length === 0" class="nc-group-empty">
        No groups found
      </div>
    </div>
  </div>
</template>

<style scoped>
.nc-group-by-table {
  overflow: auto;
  height: 100%;
}

.nc-group {
  margin-bottom: 2px;
  border: 1px solid var(--nc-grid-border-color, #e5e7eb);
  border-radius: 4px;
  overflow: hidden;
}

.nc-group-content {
  border-top: 1px solid var(--nc-grid-border-color, #e5e7eb);
}

.nc-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
}

.nc-table-header-row {
  position: sticky;
  top: 0;
  z-index: 5;
}

.nc-th {
  background: var(--nc-grid-header-bg, #f9fafb);
  border-bottom: 1px solid var(--nc-grid-border-color, #e5e7eb);
  border-right: 1px solid var(--nc-grid-border-color, #e5e7eb);
  padding: 0;
  font-weight: 500;
  font-size: 12px;
  height: 32px;
}

.nc-th-content {
  display: flex;
  align-items: center;
  padding: 0 8px;
  height: 100%;
}

.nc-table-row:hover {
  background: var(--nc-grid-row-hover, #f9fafb);
}

.nc-td {
  border-bottom: 1px solid var(--nc-grid-border-color, #e5e7eb);
  border-right: 1px solid var(--nc-grid-border-color, #e5e7eb);
  padding: 0;
  overflow: hidden;
}

.nc-td-content {
  display: flex;
  align-items: center;
  padding: 0 8px;
  height: 100%;
  font-size: 11px;
  color: var(--nc-grid-text-secondary, #9ca3af);
}

.nc-group-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  color: var(--nc-grid-text-secondary, #6b7280);
}

.nc-group-load-rows {
  padding: 8px 16px;
  text-align: center;
}

.nc-group-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px;
  border-top: 1px solid var(--nc-grid-border-color, #e5e7eb);
  font-size: 12px;
}

.nc-group-page-info {
  color: var(--nc-grid-text-secondary, #6b7280);
}

.nc-group-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  color: var(--nc-grid-text-secondary, #6b7280);
}

.nc-grid-btn-sm {
  padding: 4px 8px;
  font-size: 11px;
}

.nc-grid-btn {
  padding: 4px 12px;
  border-radius: 4px;
  border: 1px solid var(--nc-grid-border-color, #e5e7eb);
  background: var(--nc-grid-bg-color, #ffffff);
  cursor: pointer;
  font-size: 12px;
}

.nc-grid-btn:hover:not(:disabled) {
  background: var(--nc-grid-hover-bg, #f3f4f6);
}

.nc-grid-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nc-grid-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--nc-grid-border-color, #e5e7eb);
  border-top-color: var(--nc-grid-primary-color, #3b82f6);
  border-radius: 50%;
  animation: nc-spin 0.8s linear infinite;
}

@keyframes nc-spin {
  to { transform: rotate(360deg); }
}
</style>
