<script setup lang="ts">
/**
 * RowActions.vue — Row expand, delete, duplicate action buttons
 */
import { inject, ref } from 'vue';
import { useGridStore } from '../../stores/gridStore';
import { useUIStore } from '../../stores/uiStore';
import { INJECTION_KEYS } from '../../types';
import type { Row } from '../../types';

const props = defineProps<{
  row: Row;
  rowIndex: number;
}>();

const gridStore = useGridStore();
const uiStore = useUIStore();
const isReadOnly = inject(INJECTION_KEYS.IS_READONLY, ref(false));

function expandRow(): void {
  uiStore.openExpandedForm(props.row, props.rowIndex);
}

async function deleteRow(): Promise<void> {
  if (props.row.rowMeta.new) {
    gridStore.rows.splice(props.rowIndex, 1);
    return;
  }
  await gridStore.deleteRow(props.rowIndex);
}

async function duplicateRow(): Promise<void> {
  await gridStore.duplicateRow(props.rowIndex);
}
</script>

<template>
  <div class="nc-row-actions">
    <button
      class="nc-row-action-btn nc-expand-btn"
      @click.stop="expandRow"
      title="Expand row"
    >
      ⤢
    </button>
    <div class="nc-row-action-dropdown" v-if="!isReadOnly">
      <button
        class="nc-row-action-btn nc-duplicate-btn"
        @click.stop="duplicateRow"
        title="Duplicate row"
      >
        ⧉
      </button>
      <button
        class="nc-row-action-btn nc-delete-btn"
        @click.stop="deleteRow"
        title="Delete row"
      >
        ×
      </button>
    </div>
  </div>
</template>

<style scoped>
.nc-row-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 2px;
}

.nc-row-action-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: var(--nc-grid-text-secondary, #9ca3af);
  padding: 2px 4px;
  border-radius: 2px;
  line-height: 1;
  opacity: 0;
  transition: all 0.15s;
}

tr:hover .nc-row-action-btn,
.nc-row-actions:hover .nc-row-action-btn {
  opacity: 1;
}

.nc-expand-btn {
  opacity: 0.3;
}

tr:hover .nc-expand-btn {
  opacity: 1;
}

.nc-row-action-btn:hover {
  color: var(--nc-grid-text-color, #1f2937);
  background: var(--nc-grid-hover-bg, #f3f4f6);
}

.nc-delete-btn:hover {
  color: var(--nc-grid-error-color, #dc2626);
}

.nc-row-action-dropdown {
  display: flex;
  gap: 2px;
}
</style>
