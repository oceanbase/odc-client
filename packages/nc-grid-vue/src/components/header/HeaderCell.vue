<script setup lang="ts">
/**
 * HeaderCell.vue — Column header with sort indicators and context menu
 */
import { ref, computed } from 'vue';
import type { ColumnType } from 'nocodb-sdk';
import { useViewSorts } from '../../composables/useViewSorts';
import HeaderMenu from './HeaderMenu.vue';
import HeaderIcon from './HeaderIcon.vue';

const props = defineProps<{
  column: ColumnType;
  colIndex: number;
}>();

const { getSortDirection, getSortIndex, quickSort } = useViewSorts();

const showMenu = ref(false);

const sortDir = computed(() => getSortDirection(props.column.id || ''));
const sortIdx = computed(() => getSortIndex(props.column.id || ''));

function handleSort(): void {
  quickSort(props.column);
}

function toggleMenu(event: MouseEvent): void {
  event.stopPropagation();
  showMenu.value = !showMenu.value;
}
</script>

<template>
  <div class="nc-header-cell" @click="handleSort">
    <div class="nc-header-cell-content">
      <HeaderIcon :column="column" />
      <span class="nc-header-title" :title="column.title">{{ column.title }}</span>
      <!-- Sort indicator -->
      <span v-if="sortDir" class="nc-sort-indicator">
        {{ sortDir === 'asc' ? '↑' : '↓' }}
        <sup v-if="sortIdx >= 0" class="nc-sort-index">{{ sortIdx + 1 }}</sup>
      </span>
      <!-- Primary key indicator -->
      <span v-if="column.pk" class="nc-pk-indicator" title="Primary Key">🔑</span>
    </div>

    <!-- Context menu trigger -->
    <button
      class="nc-header-menu-btn"
      @click="toggleMenu"
      title="Column menu"
    >
      ▾
    </button>

    <!-- Context menu -->
    <HeaderMenu
      v-if="showMenu"
      :column="column"
      @close="showMenu = false"
    />
  </div>
</template>

<style scoped>
.nc-header-cell {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 8px;
  gap: 4px;
  cursor: pointer;
  user-select: none;
}

.nc-header-cell-content {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  overflow: hidden;
}

.nc-header-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
}

.nc-sort-indicator {
  font-size: 10px;
  color: var(--nc-grid-primary-color, #3b82f6);
  flex-shrink: 0;
}

.nc-sort-index {
  font-size: 8px;
}

.nc-pk-indicator {
  font-size: 10px;
  flex-shrink: 0;
}

.nc-header-menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: var(--nc-grid-text-secondary, #6b7280);
  padding: 2px 4px;
  opacity: 0;
  transition: opacity 0.15s;
  flex-shrink: 0;
}

.nc-header-cell:hover .nc-header-menu-btn {
  opacity: 1;
}

.nc-header-menu-btn:hover {
  color: var(--nc-grid-text-color, #1f2937);
}
</style>
