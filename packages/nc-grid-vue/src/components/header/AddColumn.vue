<script setup lang="ts">
/**
 * AddColumn.vue — New column creation dialog
 */
import { ref, computed } from 'vue';
import { useGridStore } from '../../stores/gridStore';

const gridStore = useGridStore();

const showDialog = ref(false);
const columnTitle = ref('');
const columnType = ref('SingleLineText');

const COLUMN_TYPES = [
  { value: 'SingleLineText', label: 'Single Line Text' },
  { value: 'LongText', label: 'Long Text' },
  { value: 'Number', label: 'Number' },
  { value: 'Decimal', label: 'Decimal' },
  { value: 'Currency', label: 'Currency' },
  { value: 'Percent', label: 'Percent' },
  { value: 'Email', label: 'Email' },
  { value: 'URL', label: 'URL' },
  { value: 'PhoneNumber', label: 'Phone Number' },
  { value: 'Checkbox', label: 'Checkbox' },
  { value: 'SingleSelect', label: 'Single Select' },
  { value: 'MultiSelect', label: 'Multi Select' },
  { value: 'Date', label: 'Date' },
  { value: 'DateTime', label: 'Date Time' },
  { value: 'Time', label: 'Time' },
  { value: 'Duration', label: 'Duration' },
  { value: 'Year', label: 'Year' },
  { value: 'Rating', label: 'Rating' },
  { value: 'Attachment', label: 'Attachment' },
  { value: 'JSON', label: 'JSON' },
];

async function createColumn(): Promise<void> {
  if (!columnTitle.value.trim()) return;

  const client = gridStore.getApiClient();
  const ids = client.getResolvedIds();

  await client.createColumn(ids.tableId, {
    title: columnTitle.value.trim(),
    uidt: columnType.value,
  });

  await gridStore.loadTableMeta();
  await gridStore.reload();

  columnTitle.value = '';
  columnType.value = 'SingleLineText';
  showDialog.value = false;
}

function cancel(): void {
  showDialog.value = false;
  columnTitle.value = '';
  columnType.value = 'SingleLineText';
}
</script>

<template>
  <div class="nc-add-column">
    <button class="nc-add-column-btn" @click="showDialog = true" title="Add new column">
      + Add Column
    </button>

    <!-- Dialog -->
    <div v-if="showDialog" class="nc-add-column-dialog" @click.stop>
      <div class="nc-dialog-overlay" @click="cancel" />
      <div class="nc-dialog-content">
        <h3 class="nc-dialog-title">Add Column</h3>

        <div class="nc-dialog-field">
          <label class="nc-dialog-label">Column Name</label>
          <input
            v-model="columnTitle"
            class="nc-dialog-input"
            placeholder="Enter column name"
            @keydown.enter="createColumn"
            autofocus
          />
        </div>

        <div class="nc-dialog-field">
          <label class="nc-dialog-label">Column Type</label>
          <select v-model="columnType" class="nc-dialog-select">
            <option
              v-for="ct in COLUMN_TYPES"
              :key="ct.value"
              :value="ct.value"
            >
              {{ ct.label }}
            </option>
          </select>
        </div>

        <div class="nc-dialog-actions">
          <button class="nc-grid-btn" @click="cancel">Cancel</button>
          <button
            class="nc-grid-btn nc-grid-btn-primary"
            @click="createColumn"
            :disabled="!columnTitle.trim()"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nc-add-column {
  position: relative;
}

.nc-add-column-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: var(--nc-grid-text-secondary, #6b7280);
  padding: 4px 8px;
  white-space: nowrap;
}

.nc-add-column-btn:hover {
  color: var(--nc-grid-primary-color, #3b82f6);
}

.nc-add-column-dialog {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.nc-dialog-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
}

.nc-dialog-content {
  position: relative;
  background: var(--nc-grid-bg-color, #ffffff);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
  padding: 24px;
  min-width: 360px;
  max-width: 480px;
}

.nc-dialog-title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: var(--nc-grid-text-color, #1f2937);
}

.nc-dialog-field {
  margin-bottom: 12px;
}

.nc-dialog-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--nc-grid-text-secondary, #6b7280);
  margin-bottom: 4px;
}

.nc-dialog-input,
.nc-dialog-select {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--nc-grid-border-color, #e5e7eb);
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
}

.nc-dialog-input:focus,
.nc-dialog-select:focus {
  border-color: var(--nc-grid-primary-color, #3b82f6);
}

.nc-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

.nc-grid-btn {
  padding: 6px 16px;
  border-radius: 4px;
  border: 1px solid var(--nc-grid-border-color, #e5e7eb);
  background: var(--nc-grid-bg-color, #ffffff);
  cursor: pointer;
  font-size: 13px;
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

.nc-grid-btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
