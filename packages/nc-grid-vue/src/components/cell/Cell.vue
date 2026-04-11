<script setup lang="ts">
/**
 * Cell.vue — Universal cell wrapper with view/edit mode switching.
 * Renders the appropriate cell editor/viewer based on column type.
 */
import { ref, computed, watch, inject, nextTick } from 'vue';
import type { ColumnType } from 'nocodb-sdk';
import { useEditStore } from '../../stores/editStore';
import { useGridStore } from '../../stores/gridStore';
import { INJECTION_KEYS, READONLY_COLUMN_TYPES } from '../../types';
import type { Row } from '../../types';

const props = defineProps<{
  column: ColumnType;
  row: Row;
  rowIndex: number;
  colIndex: number;
  isEditing: boolean;
}>();

const editStore = useEditStore();
const gridStore = useGridStore();
const isReadOnly = inject(INJECTION_KEYS.IS_READONLY, ref(false));

const inputRef = ref<HTMLInputElement | null>(null);
const localValue = ref<unknown>(null);

const cellValue = computed(() => {
  if (props.column.title) {
    return props.row.row[props.column.title];
  }
  return null;
});

const displayValue = computed(() => {
  const val = cellValue.value;
  if (val === null || val === undefined) return '';
  if (typeof val === 'boolean') return val ? '✓' : '';
  if (typeof val === 'object') {
    try { return JSON.stringify(val); } catch { return String(val); }
  }
  return String(val);
});

const columnType = computed(() => props.column.uidt || 'SingleLineText');

const isBoolean = computed(() => columnType.value === 'Checkbox');
const isRating = computed(() => columnType.value === 'Rating');
const isSelect = computed(() =>
  ['SingleSelect', 'MultiSelect'].includes(columnType.value)
);
const isAttachment = computed(() => columnType.value === 'Attachment');
const isReadOnlyField = computed(() =>
  props.column.pk || props.column.ai || props.column.system ||
  (READONLY_COLUMN_TYPES as readonly string[]).includes(columnType.value)
);

// Initialize local value when entering edit mode
watch(() => props.isEditing, (editing) => {
  if (editing) {
    localValue.value = cellValue.value;
    nextTick(() => {
      inputRef.value?.focus();
      inputRef.value?.select();
    });
  }
});

function onInput(event: Event): void {
  const target = event.target as HTMLInputElement;
  localValue.value = target.value;
  editStore.updateEditingValue(target.value);
}

function onCheckboxChange(): void {
  const newVal = !cellValue.value;
  commitValue(newVal);
}

function onRatingClick(rating: number): void {
  commitValue(rating);
}

async function commitValue(value: unknown): Promise<void> {
  if (!props.column.title || isReadOnly.value || isReadOnlyField.value) return;

  const oldValue = props.row.row[props.column.title];
  props.row.row[props.column.title] = value;
  props.row.rowMeta.changed = true;

  editStore.addUndoAction({
    undo: {
      fn: async () => {
        props.row.row[props.column.title!] = oldValue;
        await gridStore.updateRow(props.rowIndex, props.column.title!, oldValue);
      },
      args: [],
    },
    redo: {
      fn: async () => {
        props.row.row[props.column.title!] = value;
        await gridStore.updateRow(props.rowIndex, props.column.title!, value);
      },
      args: [],
    },
  });

  try {
    await gridStore.updateRow(props.rowIndex, props.column.title, value);
  } catch {
    props.row.row[props.column.title] = oldValue;
    props.row.rowMeta.changed = false;
  }
}

function onBlur(): void {
  if (props.isEditing && editStore.isDirty) {
    const result = editStore.commitEditing();
    if (result && props.column.title) {
      commitValue(result.value);
    }
  }
}

function onKeyDown(event: KeyboardEvent): void {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    onBlur();
  } else if (event.key === 'Escape') {
    editStore.cancelEditing();
  }
}

// Select options
const selectOptions = computed(() => {
  const colMeta = props.column.colOptions as Record<string, unknown> | undefined;
  if (!colMeta) return [];
  const options = colMeta.options as Array<{ title: string; color?: string }> | undefined;
  return options || [];
});
</script>

<template>
  <div
    class="nc-cell"
    :class="{
      'nc-cell-editing': isEditing,
      'nc-cell-readonly': isReadOnly || isReadOnlyField,
      [`nc-cell-${columnType.toLowerCase()}`]: true,
    }"
  >
    <!-- Checkbox type -->
    <template v-if="isBoolean">
      <input
        type="checkbox"
        :checked="!!cellValue"
        :disabled="isReadOnly || isReadOnlyField"
        @change="onCheckboxChange"
        class="nc-cell-checkbox"
      />
    </template>

    <!-- Rating type -->
    <template v-else-if="isRating">
      <div class="nc-cell-rating">
        <span
          v-for="i in 5"
          :key="i"
          class="nc-rating-star"
          :class="{ 'nc-rating-filled': i <= (cellValue as number || 0) }"
          @click="!isReadOnly && !isReadOnlyField && onRatingClick(i)"
        >
          ★
        </span>
      </div>
    </template>

    <!-- Select type (editing) -->
    <template v-else-if="isSelect && isEditing">
      <select
        class="nc-cell-select-input"
        :value="cellValue"
        @change="commitValue(($event.target as HTMLSelectElement).value)"
      >
        <option value="">-- Select --</option>
        <option
          v-for="opt in selectOptions"
          :key="opt.title"
          :value="opt.title"
        >
          {{ opt.title }}
        </option>
      </select>
    </template>

    <!-- Select type (display) -->
    <template v-else-if="isSelect">
      <span
        v-if="cellValue"
        class="nc-cell-select-tag"
      >
        {{ cellValue }}
      </span>
    </template>

    <!-- Attachment type -->
    <template v-else-if="isAttachment">
      <div class="nc-cell-attachment">
        <span v-if="cellValue">📎 {{ Array.isArray(cellValue) ? (cellValue as unknown[]).length : 1 }} file(s)</span>
        <span v-else class="nc-cell-placeholder">No attachments</span>
      </div>
    </template>

    <!-- Editing mode (text input) -->
    <template v-else-if="isEditing && !isReadOnlyField">
      <input
        v-if="columnType !== 'LongText'"
        ref="inputRef"
        class="nc-cell-input"
        :type="['Number', 'Decimal', 'Currency', 'Percent'].includes(columnType) ? 'number' : 'text'"
        :value="localValue"
        @input="onInput"
        @blur="onBlur"
        @keydown="onKeyDown"
      />
      <textarea
        v-else
        ref="inputRef"
        class="nc-cell-textarea"
        :value="String(localValue ?? '')"
        @input="onInput"
        @blur="onBlur"
        @keydown="onKeyDown"
      />
    </template>

    <!-- Display mode -->
    <template v-else>
      <span
        class="nc-cell-value"
        :class="{
          'nc-cell-null': cellValue === null || cellValue === undefined,
          'nc-cell-url': columnType === 'URL',
          'nc-cell-email': columnType === 'Email',
        }"
      >
        <a
          v-if="columnType === 'URL' && cellValue"
          :href="String(cellValue)"
          target="_blank"
          rel="noopener noreferrer"
          class="nc-cell-link"
          @click.stop
        >
          {{ cellValue }}
        </a>
        <a
          v-else-if="columnType === 'Email' && cellValue"
          :href="`mailto:${cellValue}`"
          class="nc-cell-link"
          @click.stop
        >
          {{ cellValue }}
        </a>
        <template v-else>
          {{ displayValue }}
        </template>
      </span>
    </template>
  </div>
</template>

<style scoped>
.nc-cell {
  display: flex;
  align-items: center;
  height: 100%;
  width: 100%;
  padding: 0 8px;
  overflow: hidden;
}

.nc-cell-editing {
  padding: 0;
}

.nc-cell-value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  line-height: 1.4;
}

.nc-cell-null {
  color: var(--nc-grid-text-secondary, #9ca3af);
  font-style: italic;
}

.nc-cell-input,
.nc-cell-textarea,
.nc-cell-select-input {
  width: 100%;
  height: 100%;
  border: none;
  padding: 0 8px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  background: var(--nc-grid-bg-color, #ffffff);
}

.nc-cell-textarea {
  resize: none;
  min-height: 60px;
}

.nc-cell-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--nc-grid-primary-color, #3b82f6);
}

.nc-cell-rating {
  display: flex;
  gap: 2px;
}

.nc-rating-star {
  font-size: 16px;
  color: var(--nc-grid-border-color, #d1d5db);
  cursor: pointer;
  transition: color 0.1s;
}

.nc-rating-filled {
  color: #f59e0b;
}

.nc-cell-select-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 12px;
  background: var(--nc-grid-primary-bg, #eff6ff);
  color: var(--nc-grid-primary-color, #3b82f6);
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nc-cell-attachment {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.nc-cell-placeholder {
  color: var(--nc-grid-text-secondary, #9ca3af);
  font-style: italic;
}

.nc-cell-link {
  color: var(--nc-grid-primary-color, #3b82f6);
  text-decoration: none;
}

.nc-cell-link:hover {
  text-decoration: underline;
}
</style>
