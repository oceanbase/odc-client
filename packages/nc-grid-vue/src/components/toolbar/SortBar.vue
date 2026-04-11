<script setup lang="ts">
/**
 * SortBar.vue — Sort editor panel
 */
import { useViewSorts } from '../../composables/useViewSorts';
import { useGridStore } from '../../stores/gridStore';

const emit = defineEmits<{ (e: 'close'): void }>();

const gridStore = useGridStore();
const {
  sorts,
  hasSorts,
  availableSortColumns,
  addSort,
  toggleSortDirection,
  changeSortColumn,
  removeSort,
  clearAll,
} = useViewSorts();

function getColumnTitle(columnId: string): string {
  const col = gridStore.columns.find((c) => c.id === columnId);
  return col?.title || '';
}
</script>

<template>
  <div class="nc-sort-bar">
    <div class="nc-panel-header">
      <span class="nc-panel-title">Sort</span>
      <button class="nc-panel-close" @click="emit('close')">✕</button>
    </div>

    <div class="nc-sort-list">
      <div
        v-for="(sort, idx) in sorts"
        :key="sort.id || idx"
        class="nc-sort-row"
      >
        <span class="nc-sort-label">{{ idx === 0 ? 'Sort by' : 'then by' }}</span>

        <select
          class="nc-sort-select"
          :value="sort.fk_column_id"
          @change="changeSortColumn(sort.id!, ($event.target as HTMLSelectElement).value)"
        >
          <option
            v-for="col in [...(sort.fk_column_id ? [gridStore.columns.find(c => c.id === sort.fk_column_id)].filter(Boolean) : []), ...availableSortColumns]"
            :key="(col as Record<string, unknown>).id as string"
            :value="(col as Record<string, unknown>).id as string"
          >
            {{ (col as Record<string, unknown>).title }}
          </option>
        </select>

        <button
          class="nc-sort-dir-btn"
          @click="toggleSortDirection(sort.id!)"
        >
          {{ sort.direction === 'desc' ? '↓ Z-A' : '↑ A-Z' }}
        </button>

        <button class="nc-sort-remove" @click="removeSort(sort.id!)">✕</button>
      </div>
    </div>

    <div class="nc-sort-actions">
      <button
        class="nc-grid-btn nc-grid-btn-sm"
        @click="addSort(availableSortColumns[0])"
        :disabled="availableSortColumns.length === 0"
      >
        + Add Sort
      </button>
      <button
        v-if="hasSorts"
        class="nc-grid-btn nc-grid-btn-sm nc-grid-btn-danger"
        @click="clearAll()"
      >
        Clear All
      </button>
    </div>
  </div>
</template>

<style scoped>
.nc-sort-bar {
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
}

.nc-panel-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: var(--nc-grid-text-secondary, #6b7280);
}

.nc-sort-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 8px;
}

.nc-sort-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.nc-sort-label {
  font-size: 12px;
  color: var(--nc-grid-text-secondary, #6b7280);
  width: 60px;
  flex-shrink: 0;
}

.nc-sort-select {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid var(--nc-grid-border-color, #e5e7eb);
  border-radius: 4px;
  font-size: 12px;
  outline: none;
}

.nc-sort-dir-btn {
  padding: 4px 8px;
  border: 1px solid var(--nc-grid-border-color, #e5e7eb);
  border-radius: 4px;
  background: none;
  cursor: pointer;
  font-size: 12px;
  min-width: 60px;
}

.nc-sort-dir-btn:hover {
  background: var(--nc-grid-hover-bg, #f3f4f6);
}

.nc-sort-remove {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--nc-grid-text-secondary, #9ca3af);
  font-size: 14px;
}

.nc-sort-remove:hover {
  color: var(--nc-grid-error-color, #dc2626);
}

.nc-sort-actions {
  display: flex;
  gap: 8px;
}

.nc-grid-btn-sm {
  padding: 4px 10px;
  font-size: 12px;
  border-radius: 4px;
  border: 1px solid var(--nc-grid-border-color, #e5e7eb);
  background: var(--nc-grid-bg-color, #ffffff);
  cursor: pointer;
}

.nc-grid-btn-sm:hover:not(:disabled) {
  background: var(--nc-grid-hover-bg, #f3f4f6);
}

.nc-grid-btn-sm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nc-grid-btn-danger {
  color: var(--nc-grid-error-color, #dc2626);
}
</style>
