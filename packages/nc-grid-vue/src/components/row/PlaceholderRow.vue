<script setup lang="ts">
/**
 * PlaceholderRow.vue — New row placeholder at the bottom of the table
 */
import { inject, ref } from 'vue';
import { useGridStore } from '../../stores/gridStore';
import { INJECTION_KEYS } from '../../types';

const props = defineProps<{
  colCount: number;
}>();

const gridStore = useGridStore();
const isReadOnly = inject(INJECTION_KEYS.IS_READONLY, ref(false));

function addNewRow(): void {
  if (isReadOnly.value) return;
  const row = gridStore.addEmptyRow();
}
</script>

<template>
  <tr v-if="!isReadOnly" class="nc-placeholder-row" @click="addNewRow">
    <td :colspan="colCount" class="nc-placeholder-td">
      <div class="nc-placeholder-content">
        <span class="nc-placeholder-icon">+</span>
        <span class="nc-placeholder-text">New Row</span>
      </div>
    </td>
  </tr>
</template>

<style scoped>
.nc-placeholder-row {
  cursor: pointer;
  height: 32px;
}

.nc-placeholder-row:hover {
  background: var(--nc-grid-hover-bg, #f9fafb);
}

.nc-placeholder-td {
  border-bottom: 1px solid var(--nc-grid-border-color, #e5e7eb);
  padding: 0;
}

.nc-placeholder-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  height: 32px;
  color: var(--nc-grid-text-secondary, #9ca3af);
  font-size: 13px;
}

.nc-placeholder-icon {
  font-size: 16px;
  font-weight: 300;
}

.nc-placeholder-row:hover .nc-placeholder-content {
  color: var(--nc-grid-primary-color, #3b82f6);
}
</style>
