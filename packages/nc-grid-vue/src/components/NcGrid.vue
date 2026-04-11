<script setup lang="ts">
/**
 * NcGrid — Main entry component for the standalone NocoDB grid view.
 * Accept serverUrl, token, tableName, baseName props.
 * Initialize API client, stores, and orchestrate data loading.
 */
import { onMounted, onUnmounted, provide, ref, watch, computed, toRefs } from 'vue';
import { createPinia, type Pinia } from 'pinia';
import { createNcApiClient, type NcApiClient } from '../api/client';
import { useGridStore } from '../stores/gridStore';
import { useViewStore } from '../stores/viewStore';
import { useSelectionStore } from '../stores/selectionStore';
import { useEditStore } from '../stores/editStore';
import { useUIStore } from '../stores/uiStore';
import { INJECTION_KEYS, type NcGridProps, type NcGridEmits } from '../types';
import { useKeyboardNavigation } from '../composables/useKeyboardNavigation';
import { usePaste } from '../composables/usePaste';
import GridToolbar from './toolbar/Toolbar.vue';
import GridTable from './grid/Table.vue';
import InfiniteTable from './grid/InfiniteTable.vue';
import GroupByTable from './grid/GroupByTable.vue';
import GridPagination from './Pagination.vue';
import ExpandedForm from './row/ExpandedForm.vue';

const props = withDefaults(defineProps<NcGridProps>(), {
  pageSize: 25,
  infiniteScroll: false,
  readOnly: false,
  rowHeight: 'short',
  showToolbar: true,
  showPagination: true,
});

const emit = defineEmits<NcGridEmits>();

const containerRef = ref<HTMLElement | null>(null);
const initialized = ref(false);
const initError = ref<Error | null>(null);

// ── Stores ──
const gridStore = useGridStore();
const viewStore = useViewStore();
const selectionStore = useSelectionStore();
const editStore = useEditStore();
const uiStore = useUIStore();

// ── API Client ──
const apiClient = ref<NcApiClient | null>(null);

// ── Provide injection context ──
provide(INJECTION_KEYS.IS_READONLY, computed(() => props.readOnly));
provide(INJECTION_KEYS.RELOAD_DATA, () => gridStore.reload());
provide(INJECTION_KEYS.RELOAD_VIEW, () => initializeView());

// ── Keyboard & Paste ──
const { setupKeyboardListeners, teardownKeyboardListeners } = useKeyboardNavigation();
const { handlePaste } = usePaste();

// ── Initialize ──
async function initialize(): Promise<void> {
  try {
    initError.value = null;

    // Create API client
    const client = createNcApiClient({
      serverUrl: props.serverUrl,
      token: props.token,
    });
    apiClient.value = client;

    // Set up stores with client
    gridStore.setApiClient(client);
    viewStore.setApiClient(client);

    // Resolve IDs
    await client.initialize(props.baseName, props.tableName, props.viewName);

    // Load metadata
    await gridStore.loadTableMeta();

    // Initialize view
    await initializeView();

    // Apply UI settings
    uiStore.setRowHeight(props.rowHeight);
    uiStore.setShowToolbar(props.showToolbar);
    uiStore.setShowPagination(props.showPagination);
    gridStore.setPageSize(props.pageSize);

    initialized.value = true;

    emit('loaded', {
      totalRows: gridStore.paginationData.totalRows,
      columns: gridStore.columns,
    });
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    initError.value = error;
    emit('error', error);
  }
}

async function initializeView(): Promise<void> {
  // Load views and set active view
  await viewStore.loadViews();
  const ids = apiClient.value?.getResolvedIds();
  const activeView = viewStore.views.find((v) => v.id === ids?.viewId);
  if (activeView) {
    await viewStore.setActiveView(activeView);
  }

  // Load data
  await gridStore.loadRows();
}

// ── Watch for prop changes ──
watch(
  () => [props.serverUrl, props.token, props.baseName, props.tableName],
  () => {
    // Re-initialize on prop changes
    gridStore.$reset();
    viewStore.$reset();
    selectionStore.$reset();
    editStore.$reset();
    uiStore.$reset();
    initialized.value = false;
    initialize();
  }
);

watch(() => props.readOnly, (val) => {
  // Read-only is reactive via injection
});

watch(() => props.rowHeight, (val) => uiStore.setRowHeight(val));
watch(() => props.showToolbar, (val) => uiStore.setShowToolbar(val));
watch(() => props.showPagination, (val) => uiStore.setShowPagination(val));

// ── Lifecycle ──
onMounted(() => {
  initialize();
  if (containerRef.value) {
    setupKeyboardListeners(containerRef.value);
    containerRef.value.addEventListener('paste', handlePaste as EventListener);
  }
});

onUnmounted(() => {
  if (containerRef.value) {
    teardownKeyboardListeners(containerRef.value);
    containerRef.value.removeEventListener('paste', handlePaste as EventListener);
  }
  gridStore.$reset();
  viewStore.$reset();
  selectionStore.$reset();
  editStore.$reset();
  uiStore.$reset();
});

// ── Computed ──
const hasGroupBy = computed(() => viewStore.groupBys.length > 0);
const showInfiniteScroll = computed(() => props.infiniteScroll && !hasGroupBy.value);
</script>

<template>
  <div
    ref="containerRef"
    class="nc-grid-wrapper"
    :class="{
      'nc-grid-fullscreen': uiStore.isFullscreen,
      'nc-grid-readonly': readOnly,
    }"
    tabindex="0"
  >
    <!-- Loading State -->
    <div v-if="!initialized && !initError" class="nc-grid-loading">
      <slot name="loading">
        <div class="nc-grid-loading-spinner">
          <div class="nc-grid-spinner" />
          <span>Loading...</span>
        </div>
      </slot>
    </div>

    <!-- Error State -->
    <div v-else-if="initError" class="nc-grid-error">
      <slot name="error" :error="initError">
        <div class="nc-grid-error-content">
          <span class="nc-grid-error-icon">⚠</span>
          <p>{{ initError.message }}</p>
          <button class="nc-grid-btn nc-grid-btn-primary" @click="initialize">
            Retry
          </button>
        </div>
      </slot>
    </div>

    <!-- Grid Content -->
    <template v-else>
      <!-- Toolbar -->
      <GridToolbar v-if="uiStore.showToolbar" />

      <!-- Table Area -->
      <div class="nc-grid-table-wrapper">
        <!-- Group By View -->
        <GroupByTable v-if="hasGroupBy" />

        <!-- Infinite Scroll View -->
        <InfiniteTable v-else-if="showInfiniteScroll" />

        <!-- Standard Paginated View -->
        <GridTable v-else @row-click="(row, idx) => emit('row-click', row, idx)" />

        <!-- Empty State -->
        <div
          v-if="initialized && gridStore.rows.length === 0 && !gridStore.loading"
          class="nc-grid-empty"
        >
          <slot name="empty">
            <div class="nc-grid-empty-content">
              <span class="nc-grid-empty-icon">📋</span>
              <p>No records found</p>
              <button
                v-if="!readOnly"
                class="nc-grid-btn nc-grid-btn-primary"
                @click="gridStore.addEmptyRow()"
              >
                + Add Row
              </button>
            </div>
          </slot>
        </div>
      </div>

      <!-- Pagination -->
      <GridPagination v-if="uiStore.showPagination && !showInfiniteScroll" />

      <!-- Expanded Form Modal -->
      <ExpandedForm
        v-if="uiStore.showExpandedForm && uiStore.expandedFormRow"
        :row="uiStore.expandedFormRow"
        :row-index="uiStore.expandedFormRowIndex"
        @close="uiStore.closeExpandedForm()"
      />
    </template>
  </div>
</template>

<style scoped>
.nc-grid-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 13px;
  color: var(--nc-grid-text-color, #1f2937);
  background: var(--nc-grid-bg-color, #ffffff);
  border: 1px solid var(--nc-grid-border-color, #e5e7eb);
  border-radius: var(--nc-grid-border-radius, 4px);
  overflow: hidden;
  position: relative;
  outline: none;
}

.nc-grid-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  border-radius: 0;
}

.nc-grid-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
}

.nc-grid-loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--nc-grid-text-secondary, #6b7280);
}

.nc-grid-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--nc-grid-border-color, #e5e7eb);
  border-top-color: var(--nc-grid-primary-color, #3b82f6);
  border-radius: 50%;
  animation: nc-spin 0.8s linear infinite;
}

@keyframes nc-spin {
  to { transform: rotate(360deg); }
}

.nc-grid-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
}

.nc-grid-error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  text-align: center;
}

.nc-grid-error-icon {
  font-size: 32px;
}

.nc-grid-error-content p {
  color: var(--nc-grid-error-color, #dc2626);
  margin: 0;
}

.nc-grid-table-wrapper {
  flex: 1;
  overflow: auto;
  position: relative;
}

.nc-grid-empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nc-grid-empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--nc-grid-text-secondary, #6b7280);
}

.nc-grid-empty-icon {
  font-size: 48px;
}

.nc-grid-empty-content p {
  margin: 0;
  font-size: 14px;
}

.nc-grid-btn {
  padding: 6px 16px;
  border-radius: 4px;
  border: 1px solid var(--nc-grid-border-color, #e5e7eb);
  background: var(--nc-grid-bg-color, #ffffff);
  color: var(--nc-grid-text-color, #1f2937);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s ease;
}

.nc-grid-btn:hover {
  background: var(--nc-grid-hover-bg, #f3f4f6);
}

.nc-grid-btn-primary {
  background: var(--nc-grid-primary-color, #3b82f6);
  color: #ffffff;
  border-color: var(--nc-grid-primary-color, #3b82f6);
}

.nc-grid-btn-primary:hover {
  background: var(--nc-grid-primary-hover, #2563eb);
}
</style>
