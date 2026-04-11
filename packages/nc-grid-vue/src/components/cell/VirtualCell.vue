<script setup lang="ts">
/**
 * VirtualCell.vue — Virtual column cells (lookup, rollup, formula)
 * Renders read-only values for computed/virtual columns.
 */
import { computed } from 'vue';
import type { ColumnType } from 'nocodb-sdk';
import type { Row } from '../../types';

const props = defineProps<{
  column: ColumnType;
  row: Row;
}>();

const cellValue = computed(() => {
  if (props.column.title) {
    return props.row.row[props.column.title];
  }
  return null;
});

const displayValue = computed(() => {
  const val = cellValue.value;
  if (val === null || val === undefined) return '';
  if (Array.isArray(val)) return val.join(', ');
  if (typeof val === 'object') {
    try { return JSON.stringify(val); } catch { return String(val); }
  }
  return String(val);
});

const columnType = computed(() => props.column.uidt || '');

const isLinks = computed(() =>
  ['Links', 'LinkToAnotherRecord'].includes(columnType.value)
);
</script>

<template>
  <div class="nc-virtual-cell" :class="`nc-vcell-${columnType.toLowerCase()}`">
    <!-- Links display -->
    <template v-if="isLinks">
      <span class="nc-vcell-link-count">
        {{ Array.isArray(cellValue) ? (cellValue as unknown[]).length : (cellValue || 0) }} linked record(s)
      </span>
    </template>

    <!-- Default display -->
    <template v-else>
      <span
        class="nc-vcell-value"
        :class="{ 'nc-vcell-null': cellValue === null || cellValue === undefined }"
      >
        {{ displayValue }}
      </span>
    </template>
  </div>
</template>

<style scoped>
.nc-virtual-cell {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 8px;
  overflow: hidden;
}

.nc-vcell-value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  color: var(--nc-grid-text-secondary, #6b7280);
}

.nc-vcell-null {
  font-style: italic;
  color: var(--nc-grid-text-secondary, #9ca3af);
}

.nc-vcell-link-count {
  color: var(--nc-grid-primary-color, #3b82f6);
  font-size: 12px;
  cursor: pointer;
}

.nc-vcell-link-count:hover {
  text-decoration: underline;
}
</style>
