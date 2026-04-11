<script setup lang="ts">
/**
 * HeaderMenu.vue — Column context menu (sort, filter, hide, rename, delete, duplicate)
 */
import { ref, inject, computed, onMounted, onUnmounted } from 'vue';
import type { ColumnType } from 'nocodb-sdk';
import { useViewSorts } from '../../composables/useViewSorts';
import { useViewFilters } from '../../composables/useViewFilters';
import { useViewColumns } from '../../composables/useViewColumns';
import { useGridStore } from '../../stores/gridStore';
import { INJECTION_KEYS } from '../../types';

const props = defineProps<{
  column: ColumnType;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const gridStore = useGridStore();
const isReadOnly = inject(INJECTION_KEYS.IS_READONLY, ref(false));
const { addSort, quickSort } = useViewSorts();
const { addFilter } = useViewFilters();
const { toggleVisibility } = useViewColumns();

const menuRef = ref<HTMLElement | null>(null);
const isRenaming = ref(false);
const newTitle = ref(props.column.title || '');

function handleClickOutside(event: MouseEvent): void {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    emit('close');
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true);
});

async function sortAsc(): Promise<void> {
  await addSort(props.column, 'asc');
  emit('close');
}

async function sortDesc(): Promise<void> {
  await addSort(props.column, 'desc');
  emit('close');
}

async function filterByColumn(): Promise<void> {
  await addFilter(props.column);
  emit('close');
}

async function hideColumn(): Promise<void> {
  if (props.column.id) {
    await toggleVisibility(props.column.id, false);
  }
  emit('close');
}

async function renameColumn(): Promise<void> {
  if (!props.column.id || !newTitle.value.trim()) return;
  const client = gridStore.getApiClient();
  await client.updateColumn(props.column.id, { title: newTitle.value.trim() });
  // Reload metadata
  await gridStore.loadTableMeta();
  isRenaming.value = false;
  emit('close');
}

async function duplicateColumn(): Promise<void> {
  if (!props.column.id) return;
  const client = gridStore.getApiClient();
  const ids = client.getResolvedIds();
  await client.createColumn(ids.tableId, {
    title: `${props.column.title} (copy)`,
    uidt: props.column.uidt,
    dt: props.column.dt,
  });
  await gridStore.loadTableMeta();
  emit('close');
}

async function deleteColumn(): Promise<void> {
  if (!props.column.id) return;
  if (!confirm(`Delete column "${props.column.title}"?`)) return;
  const client = gridStore.getApiClient();
  await client.deleteColumn(props.column.id);
  await gridStore.loadTableMeta();
  await gridStore.reload();
  emit('close');
}
</script>

<template>
  <div ref="menuRef" class="nc-header-menu" @click.stop>
    <!-- Rename mode -->
    <div v-if="isRenaming" class="nc-menu-rename">
      <input
        v-model="newTitle"
        class="nc-menu-rename-input"
        @keydown.enter="renameColumn"
        @keydown.escape="isRenaming = false"
        autofocus
      />
      <div class="nc-menu-rename-actions">
        <button class="nc-menu-btn" @click="renameColumn">Save</button>
        <button class="nc-menu-btn" @click="isRenaming = false">Cancel</button>
      </div>
    </div>

    <!-- Normal menu -->
    <template v-else>
      <div class="nc-menu-section">
        <button class="nc-menu-item" @click="sortAsc">
          <span class="nc-menu-icon">↑</span> Sort Ascending
        </button>
        <button class="nc-menu-item" @click="sortDesc">
          <span class="nc-menu-icon">↓</span> Sort Descending
        </button>
      </div>

      <div class="nc-menu-divider" />

      <div class="nc-menu-section">
        <button class="nc-menu-item" @click="filterByColumn">
          <span class="nc-menu-icon">🔍</span> Filter by this field
        </button>
      </div>

      <div class="nc-menu-divider" />

      <div class="nc-menu-section">
        <button
          class="nc-menu-item"
          @click="hideColumn"
          :disabled="!!column.pk"
        >
          <span class="nc-menu-icon">👁</span> Hide field
        </button>
      </div>

      <template v-if="!isReadOnly">
        <div class="nc-menu-divider" />

        <div class="nc-menu-section">
          <button class="nc-menu-item" @click="isRenaming = true">
            <span class="nc-menu-icon">✏️</span> Rename field
          </button>
          <button class="nc-menu-item" @click="duplicateColumn">
            <span class="nc-menu-icon">📋</span> Duplicate field
          </button>
        </div>

        <div class="nc-menu-divider" />

        <div class="nc-menu-section">
          <button
            class="nc-menu-item nc-menu-item-danger"
            @click="deleteColumn"
            :disabled="!!column.pk"
          >
            <span class="nc-menu-icon">🗑️</span> Delete field
          </button>
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped>
.nc-header-menu {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 200px;
  background: var(--nc-grid-bg-color, #ffffff);
  border: 1px solid var(--nc-grid-border-color, #e5e7eb);
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  z-index: 100;
  padding: 4px 0;
}

.nc-menu-section {
  padding: 2px 0;
}

.nc-menu-divider {
  height: 1px;
  background: var(--nc-grid-border-color, #e5e7eb);
  margin: 4px 0;
}

.nc-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 13px;
  color: var(--nc-grid-text-color, #1f2937);
  text-align: left;
  transition: background 0.1s;
}

.nc-menu-item:hover:not(:disabled) {
  background: var(--nc-grid-hover-bg, #f3f4f6);
}

.nc-menu-item:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.nc-menu-item-danger {
  color: var(--nc-grid-error-color, #dc2626);
}

.nc-menu-icon {
  font-size: 14px;
  width: 20px;
  text-align: center;
}

.nc-menu-rename {
  padding: 8px;
}

.nc-menu-rename-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--nc-grid-border-color, #e5e7eb);
  border-radius: 4px;
  font-size: 13px;
  outline: none;
}

.nc-menu-rename-input:focus {
  border-color: var(--nc-grid-primary-color, #3b82f6);
}

.nc-menu-rename-actions {
  display: flex;
  gap: 4px;
  margin-top: 8px;
}

.nc-menu-btn {
  padding: 4px 12px;
  border-radius: 4px;
  border: 1px solid var(--nc-grid-border-color, #e5e7eb);
  background: var(--nc-grid-bg-color, #ffffff);
  cursor: pointer;
  font-size: 12px;
}

.nc-menu-btn:hover {
  background: var(--nc-grid-hover-bg, #f3f4f6);
}
</style>
