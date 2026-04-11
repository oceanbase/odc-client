<script setup lang="ts">
/**
 * Toolbar.vue — Main toolbar container with filter, sort, groupBy, fields, search, etc.
 */
import { useUIStore } from '../../stores/uiStore';
import { useViewStore } from '../../stores/viewStore';
import { useGridStore } from '../../stores/gridStore';
import FilterBar from './FilterBar.vue';
import SortBar from './SortBar.vue';
import GroupByBar from './GroupByBar.vue';
import FieldsMenu from './FieldsMenu.vue';
import SearchBar from './SearchBar.vue';
import RowHeight from './RowHeight.vue';
import ExportMenu from './ExportMenu.vue';

const uiStore = useUIStore();
const viewStore = useViewStore();
const gridStore = useGridStore();
</script>

<template>
  <div class="nc-toolbar">
    <div class="nc-toolbar-left">
      <!-- Fields toggle -->
      <button
        class="nc-toolbar-btn"
        :class="{ 'nc-toolbar-btn-active': uiStore.showFieldsMenu }"
        @click="uiStore.toggleFieldsMenu()"
      >
        ☰ Fields
      </button>

      <!-- Filter button -->
      <button
        class="nc-toolbar-btn"
        :class="{
          'nc-toolbar-btn-active': uiStore.showFilterMenu,
          'nc-toolbar-btn-badge': viewStore.filters.length > 0,
        }"
        @click="uiStore.toggleFilterMenu()"
      >
        🔍 Filter
        <span v-if="viewStore.filters.length > 0" class="nc-toolbar-badge">
          {{ viewStore.filters.length }}
        </span>
      </button>

      <!-- Sort button -->
      <button
        class="nc-toolbar-btn"
        :class="{
          'nc-toolbar-btn-active': uiStore.showSortMenu,
          'nc-toolbar-btn-badge': viewStore.sorts.length > 0,
        }"
        @click="uiStore.toggleSortMenu()"
      >
        ↕ Sort
        <span v-if="viewStore.sorts.length > 0" class="nc-toolbar-badge">
          {{ viewStore.sorts.length }}
        </span>
      </button>

      <!-- Group By button -->
      <button
        class="nc-toolbar-btn"
        :class="{
          'nc-toolbar-btn-active': uiStore.showGroupByMenu,
          'nc-toolbar-btn-badge': viewStore.groupBys.length > 0,
        }"
        @click="uiStore.toggleGroupByMenu()"
      >
        ▤ Group By
        <span v-if="viewStore.groupBys.length > 0" class="nc-toolbar-badge">
          {{ viewStore.groupBys.length }}
        </span>
      </button>

      <!-- Row Height -->
      <button
        class="nc-toolbar-btn"
        :class="{ 'nc-toolbar-btn-active': uiStore.showRowHeightMenu }"
        @click="uiStore.toggleRowHeightMenu()"
      >
        ≡ Height
      </button>
    </div>

    <div class="nc-toolbar-right">
      <!-- Search -->
      <button
        class="nc-toolbar-btn"
        :class="{ 'nc-toolbar-btn-active': uiStore.showSearchBar }"
        @click="uiStore.toggleSearchBar()"
      >
        🔎 Search
      </button>

      <!-- Export -->
      <ExportMenu />

      <!-- Fullscreen toggle -->
      <button
        class="nc-toolbar-btn"
        @click="uiStore.toggleFullscreen()"
        :title="uiStore.isFullscreen ? 'Exit fullscreen' : 'Fullscreen'"
      >
        {{ uiStore.isFullscreen ? '⤓' : '⤢' }}
      </button>

      <!-- Row count -->
      <span class="nc-toolbar-info">
        {{ gridStore.paginationData.totalRows }} rows
      </span>
    </div>

    <!-- Dropdown panels -->
    <div class="nc-toolbar-panels">
      <FieldsMenu v-if="uiStore.showFieldsMenu" @close="uiStore.showFieldsMenu = false" />
      <FilterBar v-if="uiStore.showFilterMenu" @close="uiStore.showFilterMenu = false" />
      <SortBar v-if="uiStore.showSortMenu" @close="uiStore.showSortMenu = false" />
      <GroupByBar v-if="uiStore.showGroupByMenu" @close="uiStore.showGroupByMenu = false" />
      <RowHeight v-if="uiStore.showRowHeightMenu" @close="uiStore.showRowHeightMenu = false" />
      <SearchBar v-if="uiStore.showSearchBar" @close="uiStore.showSearchBar = false" />
    </div>
  </div>
</template>

<style scoped>
.nc-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  border-bottom: 1px solid var(--nc-grid-border-color, #e5e7eb);
  background: var(--nc-grid-bg-color, #ffffff);
  flex-wrap: wrap;
  gap: 4px;
  position: relative;
}

.nc-toolbar-left,
.nc-toolbar-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nc-toolbar-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: none;
  cursor: pointer;
  font-size: 12px;
  color: var(--nc-grid-text-secondary, #6b7280);
  white-space: nowrap;
  transition: all 0.15s;
}

.nc-toolbar-btn:hover {
  background: var(--nc-grid-hover-bg, #f3f4f6);
  color: var(--nc-grid-text-color, #1f2937);
}

.nc-toolbar-btn-active {
  background: var(--nc-grid-primary-bg, #eff6ff);
  color: var(--nc-grid-primary-color, #3b82f6);
  border-color: var(--nc-grid-primary-color, #3b82f6);
}

.nc-toolbar-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: var(--nc-grid-primary-color, #3b82f6);
  color: #ffffff;
  font-size: 10px;
  font-weight: 600;
}

.nc-toolbar-info {
  font-size: 12px;
  color: var(--nc-grid-text-secondary, #9ca3af);
  padding: 0 8px;
}

.nc-toolbar-panels {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 50;
}
</style>
