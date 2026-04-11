<script setup lang="ts">
/**
 * SearchBar.vue — Global search across all columns
 */
import { ref, watch } from 'vue';
import { useGridStore } from '../../stores/gridStore';
import { useGridViewData } from '../../composables/useGridViewData';

const emit = defineEmits<{ (e: 'close'): void }>();

const gridStore = useGridStore();
const { loadData } = useGridViewData();

const searchTerm = ref(gridStore.searchQuery);
let debounceTimer: ReturnType<typeof setTimeout>;

watch(searchTerm, (val) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    gridStore.setSearch(val);
    // Trigger data reload with search (via where clause)
    loadData(1);
  }, 300);
});
</script>

<template>
  <div class="nc-search-bar">
    <div class="nc-search-input-wrapper">
      <span class="nc-search-icon">🔎</span>
      <input
        v-model="searchTerm"
        class="nc-search-input"
        placeholder="Search in all fields..."
        autofocus
      />
      <button
        v-if="searchTerm"
        class="nc-search-clear"
        @click="searchTerm = ''"
      >
        ✕
      </button>
    </div>
    <button class="nc-search-close" @click="emit('close')">✕</button>
  </div>
</template>

<style scoped>
.nc-search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--nc-grid-bg-color, #ffffff);
  border: 1px solid var(--nc-grid-border-color, #e5e7eb);
  border-top: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.nc-search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  padding: 4px 8px;
  border: 1px solid var(--nc-grid-border-color, #e5e7eb);
  border-radius: 4px;
}

.nc-search-input-wrapper:focus-within {
  border-color: var(--nc-grid-primary-color, #3b82f6);
}

.nc-search-icon {
  font-size: 14px;
}

.nc-search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 13px;
  background: transparent;
}

.nc-search-clear,
.nc-search-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: var(--nc-grid-text-secondary, #6b7280);
}

.nc-search-clear:hover,
.nc-search-close:hover {
  color: var(--nc-grid-text-color, #1f2937);
}
</style>
