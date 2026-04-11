<script setup lang="ts">
/**
 * GroupByBar.vue — Group-by configuration panel
 */
import { useViewGroupBy } from '../../composables/useViewGroupBy';
import { useGridStore } from '../../stores/gridStore';

const emit = defineEmits<{ (e: 'close'): void }>();

const gridStore = useGridStore();
const {
  groupBys,
  hasGroupBy,
  groupByCount,
  groupableColumns,
  addGroupBy,
  removeGroupBy,
  clearAll,
} = useViewGroupBy();

function getColumnTitle(columnId: string): string {
  const col = gridStore.columns.find((c) => c.id === columnId);
  return col?.title || '';
}
</script>

<template>
  <div class="nc-groupby-bar">
    <div class="nc-panel-header">
      <span class="nc-panel-title">Group By</span>
      <button class="nc-panel-close" @click="emit('close')">✕</button>
    </div>

    <div class="nc-groupby-list">
      <div
        v-for="(gb, idx) in groupBys"
        :key="idx"
        class="nc-groupby-row"
      >
        <span class="nc-groupby-label">{{ idx === 0 ? 'Group by' : 'then by' }}</span>
        <span class="nc-groupby-column">{{ getColumnTitle(gb.fk_column_id || '') }}</span>
        <span class="nc-groupby-dir">{{ gb.direction === 'desc' ? '↓ DESC' : '↑ ASC' }}</span>
        <button class="nc-groupby-remove" @click="removeGroupBy(idx)">✕</button>
      </div>
    </div>

    <div class="nc-groupby-actions">
      <div class="nc-groupby-add" v-if="groupableColumns.length > 0">
        <select class="nc-groupby-select" @change="addGroupBy(groupableColumns.find(c => c.id === ($event.target as HTMLSelectElement).value)!)">
          <option value="">+ Add Group By</option>
          <option
            v-for="col in groupableColumns"
            :key="col.id"
            :value="col.id"
          >
            {{ col.title }}
          </option>
        </select>
      </div>
      <button
        v-if="hasGroupBy"
        class="nc-grid-btn nc-grid-btn-sm nc-grid-btn-danger"
        @click="clearAll()"
      >
        Clear All
      </button>
    </div>
  </div>
</template>

<style scoped>
.nc-groupby-bar {
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

.nc-panel-title { font-size: 13px; font-weight: 600; }

.nc-panel-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: var(--nc-grid-text-secondary, #6b7280);
}

.nc-groupby-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 8px;
}

.nc-groupby-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nc-groupby-label { font-size: 12px; color: var(--nc-grid-text-secondary, #6b7280); width: 60px; }
.nc-groupby-column { font-size: 12px; flex: 1; }
.nc-groupby-dir { font-size: 11px; color: var(--nc-grid-text-secondary, #6b7280); }

.nc-groupby-remove {
  background: none; border: none; cursor: pointer;
  color: var(--nc-grid-text-secondary, #9ca3af); font-size: 14px;
}
.nc-groupby-remove:hover { color: var(--nc-grid-error-color, #dc2626); }

.nc-groupby-actions { display: flex; gap: 8px; align-items: center; }

.nc-groupby-select {
  padding: 4px 8px; border: 1px solid var(--nc-grid-border-color, #e5e7eb);
  border-radius: 4px; font-size: 12px; outline: none;
}

.nc-grid-btn-sm { padding: 4px 10px; font-size: 12px; border-radius: 4px; border: 1px solid var(--nc-grid-border-color, #e5e7eb); background: var(--nc-grid-bg-color, #ffffff); cursor: pointer; }
.nc-grid-btn-sm:hover { background: var(--nc-grid-hover-bg, #f3f4f6); }
.nc-grid-btn-danger { color: var(--nc-grid-error-color, #dc2626); }
</style>
