<script setup lang="ts">
/**
 * InfiniteTable.vue — Virtualized infinite scrolling table
 */
import { computed, onMounted, ref } from 'vue';
import { useGridStore } from '../../stores/gridStore';
import { useViewStore } from '../../stores/viewStore';
import { useSelectionStore } from '../../stores/selectionStore';
import { useEditStore } from '../../stores/editStore';
import { useUIStore } from '../../stores/uiStore';
import { useInfiniteData } from '../../composables/useInfiniteData';
import { useMultiSelect } from '../../composables/useMultiSelect';
import HeaderCell from '../header/HeaderCell.vue';
import Cell from '../cell/Cell.vue';
import RowActions from '../row/RowActions.vue';
import { ROW_HEIGHT_MAP } from '../../types';

const gridStore = useGridStore();
const viewStore = useViewStore();
const selectionStore = useSelectionStore();
const editStore = useEditStore();
const uiStore = useUIStore();

const {
  allRows,
  loadingMore,
  hasMore,
  loadInitial,
  handleScroll,
} = useInfiniteData();

const {
  handleCellClick,
  handleCellDoubleClick,
  handleCellMouseDown,
  handleCellMouseOver,
  handleCellMouseUp,
  handleRowCheckbox,
  handleSelectAll,
} = useMultiSelect();

const scrollContainer = ref<HTMLElement | null>(null);

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
  loadInitial();
});
</script>

<template>
  <div
    ref="scrollContainer"
    class="nc-infinite-table"
    @scroll="handleScroll"
    @mouseup="handleCellMouseUp"
  >
    <table class="nc-table">
      <thead>
        <tr class="nc-table-header-row">
          <th class="nc-th nc-th-row-index" style="width: 64px; min-width: 64px;">
            <div class="nc-th-content">
              <input
                type="checkbox"
                :checked="selectionStore.selectAllActive"
                @change="handleSelectAll"
                class="nc-checkbox"
              />
            </div>
          </th>
          <th class="nc-th nc-th-expand" style="width: 32px; min-width: 32px;">
            <div class="nc-th-content" />
          </th>
          <th
            v-for="col in visibleColumns"
            :key="col.id"
            class="nc-th"
            :style="{ width: getColumnWidth(col.id || ''), minWidth: '60px' }"
          >
            <HeaderCell :column="col" :col-index="0" />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, rowIdx) in allRows"
          :key="rowIdx"
          class="nc-table-row"
          :class="{
            'nc-row-selected': selectionStore.isRowSelected(rowIdx),
          }"
          :style="{ height: `${rowHeightPx}px` }"
        >
          <td class="nc-td nc-td-row-index">
            <div class="nc-td-content nc-row-index-cell">
              <span class="nc-row-number">{{ rowIdx + 1 }}</span>
              <input
                type="checkbox"
                class="nc-checkbox nc-row-checkbox"
                :checked="selectionStore.isRowSelected(rowIdx)"
                @click="handleRowCheckbox(rowIdx, $event)"
              />
            </div>
          </td>
          <td class="nc-td nc-td-expand">
            <RowActions :row="row" :row-index="rowIdx" />
          </td>
          <td
            v-for="(col, colIdx) in visibleColumns"
            :key="col.id"
            class="nc-td"
            :class="{
              'nc-cell-active': selectionStore.isCellActive(rowIdx, colIdx),
              'nc-cell-in-range': selectionStore.isCellInRange(rowIdx, colIdx),
              'nc-cell-editing': editStore.isCellEditing(rowIdx, colIdx),
            }"
            :style="{ width: getColumnWidth(col.id || '') }"
            @click="handleCellClick(rowIdx, colIdx, $event)"
            @dblclick="handleCellDoubleClick(rowIdx, colIdx)"
            @mousedown="handleCellMouseDown(rowIdx, colIdx, $event)"
            @mouseover="handleCellMouseOver(rowIdx, colIdx)"
          >
            <Cell
              :column="col"
              :row="row"
              :row-index="rowIdx"
              :col-index="colIdx"
              :is-editing="editStore.isCellEditing(rowIdx, colIdx)"
            />
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Load more indicator -->
    <div v-if="loadingMore" class="nc-infinite-loading">
      <div class="nc-grid-spinner" />
      <span>Loading more rows...</span>
    </div>

    <div v-if="!hasMore && allRows.length > 0" class="nc-infinite-end">
      All {{ allRows.length }} rows loaded
    </div>
  </div>
</template>

<style scoped>
.nc-infinite-table {
  overflow: auto;
  height: 100%;
  position: relative;
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
  z-index: 10;
}

.nc-th {
  background: var(--nc-grid-header-bg, #f9fafb);
  border-bottom: 2px solid var(--nc-grid-border-color, #e5e7eb);
  border-right: 1px solid var(--nc-grid-border-color, #e5e7eb);
  padding: 0;
  text-align: left;
  font-weight: 500;
  font-size: 12px;
  color: var(--nc-grid-header-text, #374151);
  height: 36px;
  user-select: none;
}

.nc-th-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 4px;
}

.nc-table-row:hover {
  background: var(--nc-grid-row-hover, #f9fafb);
}

.nc-row-selected {
  background: var(--nc-grid-selection-bg, #eff6ff) !important;
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
  height: 100%;
  padding: 0 4px;
}

.nc-row-index-cell {
  justify-content: center;
  position: relative;
}

.nc-row-number {
  color: var(--nc-grid-text-secondary, #9ca3af);
  font-size: 11px;
}

.nc-row-checkbox {
  display: none;
}

.nc-table-row:hover .nc-row-number {
  display: none;
}

.nc-table-row:hover .nc-row-checkbox {
  display: block;
}

.nc-cell-active {
  outline: 2px solid var(--nc-grid-primary-color, #3b82f6);
  outline-offset: -2px;
  z-index: 1;
}

.nc-cell-in-range {
  background: var(--nc-grid-selection-bg, #dbeafe) !important;
}

.nc-cell-editing {
  outline: 2px solid var(--nc-grid-primary-color, #3b82f6);
  outline-offset: -2px;
  z-index: 2;
}

.nc-checkbox {
  width: 14px;
  height: 14px;
  cursor: pointer;
  accent-color: var(--nc-grid-primary-color, #3b82f6);
}

.nc-infinite-loading,
.nc-infinite-end {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  font-size: 12px;
  color: var(--nc-grid-text-secondary, #6b7280);
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
