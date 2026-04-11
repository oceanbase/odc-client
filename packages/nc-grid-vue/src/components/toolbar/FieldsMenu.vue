<script setup lang="ts">
/**
 * FieldsMenu.vue — Toggle column visibility and reorder fields
 */
import { useViewColumns } from '../../composables/useViewColumns';

const emit = defineEmits<{ (e: 'close'): void }>();

const {
  gridColumns,
  visibleGridColumns,
  hiddenGridColumns,
  toggleVisibility,
  showAllColumns,
  hideAllColumns,
  moveColumn,
} = useViewColumns();
</script>

<template>
  <div class="nc-fields-menu">
    <div class="nc-panel-header">
      <span class="nc-panel-title">Fields</span>
      <button class="nc-panel-close" @click="emit('close')">✕</button>
    </div>

    <div class="nc-fields-actions-top">
      <button class="nc-grid-btn nc-grid-btn-sm" @click="showAllColumns()">Show All</button>
      <button class="nc-grid-btn nc-grid-btn-sm" @click="hideAllColumns()">Hide All</button>
    </div>

    <div class="nc-fields-list">
      <div
        v-for="gc in gridColumns"
        :key="gc.column.id"
        class="nc-field-item"
        :class="{ 'nc-field-hidden': !gc.visible }"
      >
        <span class="nc-field-drag-handle" title="Drag to reorder">⠿</span>
        <label class="nc-field-label">
          <input
            type="checkbox"
            :checked="gc.visible"
            :disabled="!!gc.column.pk"
            @change="toggleVisibility(gc.column.id!, !gc.visible)"
            class="nc-field-checkbox"
          />
          <span class="nc-field-name">{{ gc.column.title }}</span>
          <span v-if="gc.column.pk" class="nc-field-pk">PK</span>
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nc-fields-menu {
  background: var(--nc-grid-bg-color, #ffffff);
  border: 1px solid var(--nc-grid-border-color, #e5e7eb);
  border-top: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.nc-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.nc-panel-title { font-size: 13px; font-weight: 600; }

.nc-panel-close {
  background: none; border: none; cursor: pointer;
  font-size: 14px; color: var(--nc-grid-text-secondary, #6b7280);
}

.nc-fields-actions-top {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.nc-fields-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nc-field-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.1s;
}

.nc-field-item:hover {
  background: var(--nc-grid-hover-bg, #f3f4f6);
}

.nc-field-hidden {
  opacity: 0.5;
}

.nc-field-drag-handle {
  cursor: grab;
  color: var(--nc-grid-text-secondary, #9ca3af);
  font-size: 14px;
}

.nc-field-label {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  cursor: pointer;
  font-size: 12px;
}

.nc-field-checkbox {
  width: 14px;
  height: 14px;
  accent-color: var(--nc-grid-primary-color, #3b82f6);
}

.nc-field-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nc-field-pk {
  font-size: 10px;
  background: var(--nc-grid-primary-bg, #eff6ff);
  color: var(--nc-grid-primary-color, #3b82f6);
  padding: 0 4px;
  border-radius: 2px;
}

.nc-grid-btn-sm {
  padding: 4px 10px; font-size: 12px; border-radius: 4px;
  border: 1px solid var(--nc-grid-border-color, #e5e7eb);
  background: var(--nc-grid-bg-color, #ffffff); cursor: pointer;
}
.nc-grid-btn-sm:hover { background: var(--nc-grid-hover-bg, #f3f4f6); }
</style>
