<script setup lang="ts">
/**
 * Pagination.vue — Page size selector, navigation, and total row count
 */
import { computed } from 'vue';
import { useGridStore } from '../stores/gridStore';
import { useGridViewData } from '../composables/useGridViewData';

const gridStore = useGridStore();
const { changePage, changePageSize } = useGridViewData();

const pageSizeOptions = [10, 25, 50, 100];

const currentPage = computed(() => gridStore.paginationData.page);
const totalPages = computed(() => gridStore.totalPages);
const totalRows = computed(() => gridStore.paginationData.totalRows);
const pageSize = computed(() => gridStore.paginationData.pageSize);
const isFirstPage = computed(() => currentPage.value <= 1);
const isLastPage = computed(() => currentPage.value >= totalPages.value);

const pageStart = computed(() => (currentPage.value - 1) * pageSize.value + 1);
const pageEnd = computed(() => Math.min(currentPage.value * pageSize.value, totalRows.value));

function goToFirst(): void { changePage(1); }
function goToPrev(): void { if (!isFirstPage.value) changePage(currentPage.value - 1); }
function goToNext(): void { if (!isLastPage.value) changePage(currentPage.value + 1); }
function goToLast(): void { changePage(totalPages.value); }

function onPageSizeChange(event: Event): void {
  const size = Number((event.target as HTMLSelectElement).value);
  changePageSize(size);
}
</script>

<template>
  <div class="nc-pagination">
    <div class="nc-pagination-left">
      <span class="nc-pagination-info">
        {{ pageStart }}-{{ pageEnd }} of {{ totalRows }}
      </span>
    </div>

    <div class="nc-pagination-center">
      <button
        class="nc-page-btn"
        :disabled="isFirstPage"
        @click="goToFirst"
        title="First page"
      >
        «
      </button>
      <button
        class="nc-page-btn"
        :disabled="isFirstPage"
        @click="goToPrev"
        title="Previous page"
      >
        ‹
      </button>

      <span class="nc-page-current">
        {{ currentPage }} / {{ totalPages }}
      </span>

      <button
        class="nc-page-btn"
        :disabled="isLastPage"
        @click="goToNext"
        title="Next page"
      >
        ›
      </button>
      <button
        class="nc-page-btn"
        :disabled="isLastPage"
        @click="goToLast"
        title="Last page"
      >
        »
      </button>
    </div>

    <div class="nc-pagination-right">
      <select
        class="nc-page-size-select"
        :value="pageSize"
        @change="onPageSizeChange"
      >
        <option v-for="size in pageSizeOptions" :key="size" :value="size">
          {{ size }} / page
        </option>
      </select>
    </div>
  </div>
</template>

<style scoped>
.nc-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  border-top: 1px solid var(--nc-grid-border-color, #e5e7eb);
  background: var(--nc-grid-bg-color, #ffffff);
  font-size: 12px;
  flex-shrink: 0;
}

.nc-pagination-left {
  flex: 1;
}

.nc-pagination-info {
  color: var(--nc-grid-text-secondary, #6b7280);
}

.nc-pagination-center {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nc-page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--nc-grid-border-color, #e5e7eb);
  border-radius: 4px;
  background: var(--nc-grid-bg-color, #ffffff);
  cursor: pointer;
  font-size: 14px;
  color: var(--nc-grid-text-color, #1f2937);
  transition: all 0.15s;
}

.nc-page-btn:hover:not(:disabled) {
  background: var(--nc-grid-hover-bg, #f3f4f6);
  border-color: var(--nc-grid-primary-color, #3b82f6);
}

.nc-page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nc-page-current {
  padding: 0 8px;
  color: var(--nc-grid-text-color, #1f2937);
  font-weight: 500;
}

.nc-pagination-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.nc-page-size-select {
  padding: 4px 8px;
  border: 1px solid var(--nc-grid-border-color, #e5e7eb);
  border-radius: 4px;
  font-size: 12px;
  outline: none;
  background: var(--nc-grid-bg-color, #ffffff);
}

.nc-page-size-select:focus {
  border-color: var(--nc-grid-primary-color, #3b82f6);
}
</style>
