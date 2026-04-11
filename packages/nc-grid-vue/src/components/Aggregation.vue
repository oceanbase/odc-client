<script setup lang="ts">
/**
 * Aggregation.vue — Per-column aggregation display in footer
 */
import { ref, computed } from 'vue';
import type { ColumnType } from 'nocodb-sdk';
import { useViewAggregate } from '../composables/useViewAggregate';
import type { AggregationType } from '../types';

const props = defineProps<{
  column: ColumnType;
}>();

const { getAggregation, setAggregation, removeAggregation, getAvailableTypes } = useViewAggregate();

const showMenu = ref(false);

const currentAgg = computed(() => getAggregation(props.column.id || ''));
const availableTypes = computed(() => getAvailableTypes(props.column));

function selectType(type: AggregationType): void {
  if (type === 'none') {
    removeAggregation(props.column.id || '');
  } else {
    setAggregation(props.column.id || '', type);
  }
  showMenu.value = false;
}
</script>

<template>
  <div class="nc-aggregation" @click="showMenu = !showMenu">
    <span v-if="currentAgg && currentAgg.type !== 'none'" class="nc-agg-value">
      {{ currentAgg.type }}: {{ currentAgg.result ?? '—' }}
    </span>
    <span v-else class="nc-agg-placeholder">—</span>

    <!-- Dropdown -->
    <div v-if="showMenu" class="nc-agg-dropdown" @click.stop>
      <button
        v-for="type in availableTypes"
        :key="type"
        class="nc-agg-option"
        :class="{ 'nc-agg-option-active': currentAgg?.type === type }"
        @click="selectType(type)"
      >
        {{ type === 'none' ? 'None' : type }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.nc-aggregation {
  position: relative;
  cursor: pointer;
  padding: 2px 0;
}

.nc-agg-value {
  font-size: 11px;
  color: var(--nc-grid-text-secondary, #6b7280);
}

.nc-agg-placeholder {
  font-size: 11px;
  color: var(--nc-grid-text-secondary, #d1d5db);
}

.nc-agg-dropdown {
  position: absolute;
  bottom: 100%;
  left: 0;
  min-width: 140px;
  background: var(--nc-grid-bg-color, #ffffff);
  border: 1px solid var(--nc-grid-border-color, #e5e7eb);
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  z-index: 100;
  padding: 4px 0;
  max-height: 200px;
  overflow-y: auto;
}

.nc-agg-option {
  display: block;
  width: 100%;
  padding: 6px 12px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 12px;
  color: var(--nc-grid-text-color, #1f2937);
  text-align: left;
}

.nc-agg-option:hover {
  background: var(--nc-grid-hover-bg, #f3f4f6);
}

.nc-agg-option-active {
  color: var(--nc-grid-primary-color, #3b82f6);
  font-weight: 500;
}
</style>
