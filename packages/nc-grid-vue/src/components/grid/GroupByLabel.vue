<script setup lang="ts">
/**
 * GroupByLabel.vue — Group header with collapse toggle
 */
import type { GroupData } from '../../types';

const props = defineProps<{
  group: GroupData;
  groupIndex: number;
}>();

const emit = defineEmits<{
  (e: 'toggle'): void;
}>();
</script>

<template>
  <div
    class="nc-group-label"
    @click="emit('toggle')"
  >
    <span class="nc-group-collapse-icon">
      {{ group.collapsed ? '▶' : '▼' }}
    </span>
    <span class="nc-group-key">{{ group.key }}</span>
    <span class="nc-group-count">({{ group.count }})</span>
  </div>
</template>

<style scoped>
.nc-group-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--nc-grid-header-bg, #f9fafb);
  cursor: pointer;
  user-select: none;
  font-size: 13px;
  font-weight: 500;
  color: var(--nc-grid-text-color, #1f2937);
  transition: background 0.15s ease;
}

.nc-group-label:hover {
  background: var(--nc-grid-hover-bg, #f3f4f6);
}

.nc-group-collapse-icon {
  font-size: 10px;
  color: var(--nc-grid-text-secondary, #6b7280);
}

.nc-group-key {
  flex: 1;
}

.nc-group-count {
  color: var(--nc-grid-text-secondary, #6b7280);
  font-size: 12px;
  font-weight: 400;
}
</style>
