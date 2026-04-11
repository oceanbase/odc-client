<script setup lang="ts">
/**
 * FilterBar.vue — Filter editor with add/remove/edit filter conditions
 */
import { computed } from 'vue';
import { useViewFilters, COMPARISON_OPS, getOperatorsForType } from '../../composables/useViewFilters';
import { useGridStore } from '../../stores/gridStore';

const emit = defineEmits<{ (e: 'close'): void }>();

const gridStore = useGridStore();
const {
  filters,
  hasFilters,
  filterableColumns,
  addFilter,
  changeFilterColumn,
  changeFilterOp,
  changeFilterValue,
  changeFilterLogicalOp,
  removeFilter,
  clearAll,
} = useViewFilters();

function getColumnTitle(columnId: string): string {
  const col = gridStore.columns.find((c) => c.id === columnId);
  return col?.title || '';
}

function getColumnType(columnId: string): string {
  const col = gridStore.columns.find((c) => c.id === columnId);
  return col?.uidt || 'SingleLineText';
}

function getOpsForFilter(filter: Record<string, unknown>): string[] {
  const colType = getColumnType(filter.fk_column_id as string);
  return getOperatorsForType(colType);
}
</script>

<template>
  <div class="nc-filter-bar">
    <div class="nc-panel-header">
      <span class="nc-panel-title">Filters</span>
      <button class="nc-panel-close" @click="emit('close')">✕</button>
    </div>

    <div class="nc-filter-list">
      <div
        v-for="(filter, idx) in filters"
        :key="filter.id || idx"
        class="nc-filter-row"
      >
        <!-- Logical operator -->
        <select
          v-if="idx > 0"
          class="nc-filter-select nc-filter-logic"
          :value="filter.logical_op || 'and'"
          @change="changeFilterLogicalOp(filter.id!, ($event.target as HTMLSelectElement).value as 'and' | 'or')"
        >
          <option value="and">And</option>
          <option value="or">Or</option>
        </select>
        <span v-else class="nc-filter-where">Where</span>

        <!-- Column select -->
        <select
          class="nc-filter-select nc-filter-column"
          :value="filter.fk_column_id"
          @change="changeFilterColumn(filter.id!, ($event.target as HTMLSelectElement).value)"
        >
          <option
            v-for="col in filterableColumns"
            :key="col.id"
            :value="col.id"
          >
            {{ col.title }}
          </option>
        </select>

        <!-- Operator select -->
        <select
          class="nc-filter-select nc-filter-op"
          :value="filter.comparison_op"
          @change="changeFilterOp(filter.id!, ($event.target as HTMLSelectElement).value)"
        >
          <option
            v-for="op in getOpsForFilter(filter as Record<string, unknown>)"
            :key="op"
            :value="op"
          >
            {{ COMPARISON_OPS[op]?.label || op }}
          </option>
        </select>

        <!-- Value input -->
        <input
          v-if="COMPARISON_OPS[filter.comparison_op || '']?.requiresValue !== false"
          class="nc-filter-input"
          :value="filter.value"
          placeholder="Value"
          @change="changeFilterValue(filter.id!, ($event.target as HTMLInputElement).value)"
        />

        <!-- Remove -->
        <button class="nc-filter-remove" @click="removeFilter(filter.id!)">✕</button>
      </div>
    </div>

    <div class="nc-filter-actions">
      <button class="nc-grid-btn nc-grid-btn-sm" @click="addFilter()">
        + Add Filter
      </button>
      <button
        v-if="hasFilters"
        class="nc-grid-btn nc-grid-btn-sm nc-grid-btn-danger"
        @click="clearAll()"
      >
        Clear All
      </button>
    </div>
  </div>
</template>

<style scoped>
.nc-filter-bar {
  background: var(--nc-grid-bg-color, #ffffff);
  border: 1px solid var(--nc-grid-border-color, #e5e7eb);
  border-top: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 12px;
}

.nc-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.nc-panel-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--nc-grid-text-color, #1f2937);
}

.nc-panel-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: var(--nc-grid-text-secondary, #6b7280);
}

.nc-filter-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 8px;
}

.nc-filter-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.nc-filter-where {
  font-size: 12px;
  color: var(--nc-grid-text-secondary, #6b7280);
  width: 50px;
  text-align: center;
}

.nc-filter-select,
.nc-filter-input {
  padding: 4px 8px;
  border: 1px solid var(--nc-grid-border-color, #e5e7eb);
  border-radius: 4px;
  font-size: 12px;
  outline: none;
}

.nc-filter-select:focus,
.nc-filter-input:focus {
  border-color: var(--nc-grid-primary-color, #3b82f6);
}

.nc-filter-logic {
  width: 50px;
}

.nc-filter-column {
  flex: 1;
  min-width: 100px;
}

.nc-filter-op {
  min-width: 120px;
}

.nc-filter-input {
  flex: 1;
  min-width: 100px;
}

.nc-filter-remove {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: var(--nc-grid-text-secondary, #9ca3af);
  padding: 4px;
}

.nc-filter-remove:hover {
  color: var(--nc-grid-error-color, #dc2626);
}

.nc-filter-actions {
  display: flex;
  gap: 8px;
}

.nc-grid-btn-sm {
  padding: 4px 10px;
  font-size: 12px;
}

.nc-grid-btn {
  border-radius: 4px;
  border: 1px solid var(--nc-grid-border-color, #e5e7eb);
  background: var(--nc-grid-bg-color, #ffffff);
  cursor: pointer;
}

.nc-grid-btn:hover {
  background: var(--nc-grid-hover-bg, #f3f4f6);
}

.nc-grid-btn-danger {
  color: var(--nc-grid-error-color, #dc2626);
}
</style>
