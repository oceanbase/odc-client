<script setup lang="ts">
/**
 * Table.vue — Standard paginated DOM table with full grid features
 */
import { computed, ref } from 'vue';
import { useGridStore } from '../../stores/gridStore';
import { useViewStore } from '../../stores/viewStore';
import { useSelectionStore } from '../../stores/selectionStore';
import { useEditStore } from '../../stores/editStore';
import { useUIStore } from '../../stores/uiStore';
import { useMultiSelect } from '../../composables/useMultiSelect';
import { useColumnDrag } from '../../composables/useColumnDrag';
import { useRowDragging } from '../../composables/useRowDragging';
import HeaderCell from '../header/HeaderCell.vue';
import Cell from '../cell/Cell.vue';
import RowActions from '../row/RowActions.vue';
import PlaceholderRow from '../row/PlaceholderRow.vue';
import Aggregation from '../Aggregation.vue';
import type { Row } from '../../types';
import { ROW_HEIGHT_MAP } from '../../types';

const emit = defineEmits<{
  (e: 'row-click', row: Row, index: number): void;
}>();

const gridStore = useGridStore();
const viewStore = useViewStore();
const selectionStore = useSelectionStore();
const editStore = useEditStore();
const uiStore = useUIStore();

const {
  handleCellClick,
  handleCellDoubleClick,
  handleCellMouseDown,
  handleCellMouseOver,
  handleCellMouseUp,
  handleRowCheckbox,
  handleSelectAll,
} = useMultiSelect();

const columnDrag = useColumnDrag();
const rowDrag = useRowDragging();

const tableRef = ref<HTMLElement | null>(null);

/** Visible columns sorted by order, excluding hidden */
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

/** Column widths from view config */
function getColumnWidth(colId: string): string {
  const width = viewStore.columnWidths.get(colId);
  return width ? `${width}px` : '200px';
}

const rowHeightPx = computed(() => ROW_HEIGHT_MAP[uiStore.rowHeight]);

function onRowClick(row: Row, index: number): void {
  emit('row-click', row, index);
}
</script>

<template>
  <div ref="tableRef" class="nc-grid-table" @mouseup="handleCellMouseUp">
    <table class="nc-table">
      <!-- Header -->
      <thead>
        <tr class="nc-table-header-row">
          <!-- Row number / checkbox column -->
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

          <!-- Expand row column -->
          <th class="nc-th nc-th-expand" style="width: 32px; min-width: 32px;">
            <div class="nc-th-content" />
          </th>

          <!-- Data columns -->
          <th
            v-for="(col, colIdx) in visibleColumns"
            :key="col.id"
            class="nc-th"
            :style="{ width: getColumnWidth(col.id || ''), minWidth: '60px' }"
            :class="{
              'nc-th-drag-over': columnDrag.dragOverIndex.value === colIdx,
            }"
            :draggable="true"
            @dragstart="columnDrag.onDragStart(colIdx, $event)"
            @dragover="columnDrag.onDragOver(colIdx, $event)"
            @dragleave="columnDrag.onDragLeave()"
            @drop="columnDrag.onDrop(colIdx, $event)"
            @dragend="columnDrag.onDragEnd()"
          >
            <HeaderCell :column="col" :col-index="colIdx" />
            <!-- Resize handle -->
            <div
              class="nc-th-resize-handle"
              @mousedown.prevent.stop="columnDrag.onResizeStart(col.id || '', $event.clientX, parseInt(getColumnWidth(col.id || '')))"
            />
          </th>

          <!-- Add column button -->
          <th class="nc-th nc-th-add" style="width: 60px; min-width: 60px;">
            <div class="nc-th-content">
              <button class="nc-btn-add-col" title="Add column">+</button>
            </div>
          </th>
        </tr>
      </thead>

      <!-- Body -->
      <tbody>
        <tr
          v-for="(row, rowIdx) in gridStore.rows"
          :key="rowIdx"
          class="nc-table-row"
          :class="{
            'nc-row-selected': selectionStore.isRowSelected(rowIdx),
            'nc-row-new': row.rowMeta.new,
            'nc-row-saving': row.rowMeta.saving,
          }"
          :style="{ height: `${rowHeightPx}px` }"
          :draggable="true"
          @dragstart="rowDrag.onDragStart(rowIdx, $event)"
          @dragover="rowDrag.onDragOver(rowIdx, $event)"
          @dragleave="rowDrag.onDragLeave()"
          @drop="rowDrag.onDrop(rowIdx, $event)"
          @dragend="rowDrag.onDragEnd()"
          @click="onRowClick(row, rowIdx)"
        >
          <!-- Row index / checkbox -->
          <td class="nc-td nc-td-row-index">
            <div class="nc-td-content nc-row-index-cell">
              <span class="nc-row-number">{{ (gridStore.paginationData.page - 1) * gridStore.paginationData.pageSize + rowIdx + 1 }}</span>
              <input
                type="checkbox"
                class="nc-checkbox nc-row-checkbox"
                :checked="selectionStore.isRowSelected(rowIdx)"
                @click="handleRowCheckbox(rowIdx, $event)"
              />
            </div>
          </td>

          <!-- Expand row button -->
          <td class="nc-td nc-td-expand">
            <RowActions :row="row" :row-index="rowIdx" />
          </td>

          <!-- Data cells -->
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

          <!-- Empty spacer -->
          <td class="nc-td nc-td-spacer" />
        </tr>

        <!-- Placeholder row for adding new records -->
        <PlaceholderRow :col-count="visibleColumns.length + 3" />
      </tbody>

      <!-- Footer with aggregation -->
      <tfoot>
        <tr class="nc-table-footer-row">
          <td class="nc-tf" :colspan="2" />
          <td
            v-for="col in visibleColumns"
            :key="col.id"
            class="nc-tf"
          >
            <Aggregation :column="col" />
          </td>
          <td class="nc-tf" />
        </tr>
      </tfoot>
    </table>

    <!-- Loading overlay -->
    <div v-if="gridStore.loading" class="nc-grid-loading-overlay">
      <div class="nc-grid-spinner" />
    </div>
  </div>
</template>

<style scoped>
.nc-grid-table {
  position: relative;
  overflow: auto;
  height: 100%;
}

.nc-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
}

/* ── Header ── */
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
  position: relative;
  user-select: none;
  height: 36px;
}

.nc-th-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 4px;
}

.nc-th-drag-over {
  background: var(--nc-grid-primary-bg, #eff6ff) !important;
}

.nc-th-resize-handle {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: col-resize;
  z-index: 1;
}

.nc-th-resize-handle:hover {
  background: var(--nc-grid-primary-color, #3b82f6);
}

.nc-th-add .nc-btn-add-col {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: var(--nc-grid-text-secondary, #6b7280);
  width: 100%;
  height: 100%;
}

.nc-th-add .nc-btn-add-col:hover {
  color: var(--nc-grid-primary-color, #3b82f6);
}

/* ── Body ── */
.nc-table-row {
  transition: background 0.1s ease;
}

.nc-table-row:hover {
  background: var(--nc-grid-row-hover, #f9fafb);
}

.nc-row-selected {
  background: var(--nc-grid-selection-bg, #eff6ff) !important;
}

.nc-row-new {
  background: var(--nc-grid-new-row-bg, #f0fdf4) !important;
}

.nc-row-saving {
  opacity: 0.7;
}

.nc-td {
  border-bottom: 1px solid var(--nc-grid-border-color, #e5e7eb);
  border-right: 1px solid var(--nc-grid-border-color, #e5e7eb);
  padding: 0;
  overflow: hidden;
  position: relative;
}

.nc-td-content {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 4px;
}

/* Row index cell */
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

.nc-row-selected .nc-row-number {
  display: none;
}

.nc-row-selected .nc-row-checkbox {
  display: block;
}

/* Cell states */
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

/* ── Footer ── */
.nc-table-footer-row {
  position: sticky;
  bottom: 0;
  z-index: 10;
}

.nc-tf {
  background: var(--nc-grid-header-bg, #f9fafb);
  border-top: 2px solid var(--nc-grid-border-color, #e5e7eb);
  padding: 4px 8px;
  font-size: 11px;
  color: var(--nc-grid-text-secondary, #6b7280);
}

/* ── Checkbox ── */
.nc-checkbox {
  width: 14px;
  height: 14px;
  cursor: pointer;
  accent-color: var(--nc-grid-primary-color, #3b82f6);
}

/* ── Loading ── */
.nc-grid-loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.6);
  z-index: 20;
}

.nc-grid-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--nc-grid-border-color, #e5e7eb);
  border-top-color: var(--nc-grid-primary-color, #3b82f6);
  border-radius: 50%;
  animation: nc-spin 0.8s linear infinite;
}

@keyframes nc-spin {
  to { transform: rotate(360deg); }
}

.nc-td-spacer {
  width: auto;
}
</style>
