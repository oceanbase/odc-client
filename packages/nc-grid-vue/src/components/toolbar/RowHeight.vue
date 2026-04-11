<script setup lang="ts">
/**
 * RowHeight.vue — Row height selector
 */
import { useUIStore } from '../../stores/uiStore';
import type { RowHeightType } from '../../types';

const emit = defineEmits<{ (e: 'close'): void }>();

const uiStore = useUIStore();

const options: { value: RowHeightType; label: string; icon: string }[] = [
  { value: 'short', label: 'Short', icon: '━' },
  { value: 'medium', label: 'Medium', icon: '≡' },
  { value: 'tall', label: 'Tall', icon: '☰' },
  { value: 'extra', label: 'Extra', icon: '▤' },
];

function selectHeight(height: RowHeightType): void {
  uiStore.setRowHeight(height);
  emit('close');
}
</script>

<template>
  <div class="nc-row-height-menu">
    <div class="nc-panel-header">
      <span class="nc-panel-title">Row Height</span>
      <button class="nc-panel-close" @click="emit('close')">✕</button>
    </div>
    <div class="nc-rh-options">
      <button
        v-for="opt in options"
        :key="opt.value"
        class="nc-rh-option"
        :class="{ 'nc-rh-option-active': uiStore.rowHeight === opt.value }"
        @click="selectHeight(opt.value)"
      >
        <span class="nc-rh-icon">{{ opt.icon }}</span>
        <span>{{ opt.label }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.nc-row-height-menu {
  background: var(--nc-grid-bg-color, #ffffff);
  border: 1px solid var(--nc-grid-border-color, #e5e7eb);
  border-top: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 12px;
  min-width: 160px;
}

.nc-panel-header {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;
}
.nc-panel-title { font-size: 13px; font-weight: 600; }
.nc-panel-close { background: none; border: none; cursor: pointer; font-size: 14px; color: var(--nc-grid-text-secondary, #6b7280); }

.nc-rh-options { display: flex; flex-direction: column; gap: 2px; }

.nc-rh-option {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 8px; border: none; border-radius: 4px;
  background: none; cursor: pointer; font-size: 12px;
  color: var(--nc-grid-text-color, #1f2937);
}
.nc-rh-option:hover { background: var(--nc-grid-hover-bg, #f3f4f6); }
.nc-rh-option-active {
  background: var(--nc-grid-primary-bg, #eff6ff);
  color: var(--nc-grid-primary-color, #3b82f6);
}
.nc-rh-icon { font-size: 14px; width: 20px; text-align: center; }
</style>
