<script setup lang="ts">
/**
 * ExpandedForm.vue — Full record detail modal with all fields, comments, and navigation
 */
import { ref, computed, watch, inject, onMounted } from 'vue';
import { useGridStore } from '../../stores/gridStore';
import { useUIStore } from '../../stores/uiStore';
import { useEditStore } from '../../stores/editStore';
import { useRowComments } from '../../composables/useRowComments';
import { INJECTION_KEYS, READONLY_COLUMN_TYPES } from '../../types';
import type { Row } from '../../types';

const props = defineProps<{
  row: Row;
  rowIndex: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const gridStore = useGridStore();
const uiStore = useUIStore();
const editStore = useEditStore();
const isReadOnly = inject(INJECTION_KEYS.IS_READONLY, ref(false));

const { comments, loading: commentsLoading, loadComments, addComment } = useRowComments();
const showComments = ref(false);
const newComment = ref('');
const activeTab = ref<'fields' | 'comments' | 'audit'>('fields');

const primaryKey = computed(() => gridStore.primaryKey);
const rowId = computed(() => {
  if (primaryKey.value?.title) {
    return String(props.row.row[primaryKey.value.title] || '');
  }
  return '';
});

const editableColumns = computed(() =>
  gridStore.columns.filter((c) => !c.system)
);

const fieldValues = ref<Record<string, unknown>>({});

// Initialize field values
watch(() => props.row, (newRow) => {
  fieldValues.value = { ...newRow.row };
}, { immediate: true });

// Load comments when switching to comments tab
watch(activeTab, (tab) => {
  if (tab === 'comments' && rowId.value) {
    loadComments(rowId.value);
  }
});

function navigatePrev(): void {
  if (props.rowIndex > 0) {
    const prevRow = gridStore.rows[props.rowIndex - 1];
    if (prevRow) {
      uiStore.openExpandedForm(prevRow, props.rowIndex - 1);
    }
  }
}

function navigateNext(): void {
  if (props.rowIndex < gridStore.rows.length - 1) {
    const nextRow = gridStore.rows[props.rowIndex + 1];
    if (nextRow) {
      uiStore.openExpandedForm(nextRow, props.rowIndex + 1);
    }
  }
}

async function saveField(field: string): Promise<void> {
  if (isReadOnly.value) return;
  const newValue = fieldValues.value[field];
  const oldValue = props.row.row[field];
  if (newValue === oldValue) return;

  try {
    await gridStore.updateRow(props.rowIndex, field, newValue);
    props.row.row[field] = newValue;
  } catch {
    fieldValues.value[field] = oldValue;
  }
}

async function submitComment(): Promise<void> {
  if (!newComment.value.trim() || !rowId.value) return;
  await addComment(rowId.value, newComment.value.trim());
  newComment.value = '';
}

function onOverlayClick(event: MouseEvent): void {
  if (event.target === event.currentTarget) {
    emit('close');
  }
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') emit('close');
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown);
});
</script>

<template>
  <div class="nc-expanded-form-overlay" @click="onOverlayClick">
    <div class="nc-expanded-form" @click.stop>
      <!-- Header -->
      <div class="nc-ef-header">
        <div class="nc-ef-nav">
          <button
            class="nc-ef-nav-btn"
            :disabled="rowIndex <= 0"
            @click="navigatePrev"
            title="Previous record"
          >
            ‹
          </button>
          <span class="nc-ef-record-info">
            Record {{ rowIndex + 1 }} of {{ gridStore.rows.length }}
          </span>
          <button
            class="nc-ef-nav-btn"
            :disabled="rowIndex >= gridStore.rows.length - 1"
            @click="navigateNext"
            title="Next record"
          >
            ›
          </button>
        </div>
        <button class="nc-ef-close-btn" @click="emit('close')" title="Close">
          ✕
        </button>
      </div>

      <!-- Tabs -->
      <div class="nc-ef-tabs">
        <button
          class="nc-ef-tab"
          :class="{ 'nc-ef-tab-active': activeTab === 'fields' }"
          @click="activeTab = 'fields'"
        >
          Fields
        </button>
        <button
          class="nc-ef-tab"
          :class="{ 'nc-ef-tab-active': activeTab === 'comments' }"
          @click="activeTab = 'comments'"
        >
          Comments
        </button>
        <button
          class="nc-ef-tab"
          :class="{ 'nc-ef-tab-active': activeTab === 'audit' }"
          @click="activeTab = 'audit'"
        >
          Audit
        </button>
      </div>

      <!-- Content -->
      <div class="nc-ef-content">
        <!-- Fields tab -->
        <div v-if="activeTab === 'fields'" class="nc-ef-fields">
          <div
            v-for="col in editableColumns"
            :key="col.id"
            class="nc-ef-field"
          >
            <label class="nc-ef-field-label">
              {{ col.title }}
              <span v-if="col.pk" class="nc-ef-pk-badge">PK</span>
              <span v-if="col.rqd" class="nc-ef-required">*</span>
            </label>
            <div class="nc-ef-field-value">
              <!-- Checkbox -->
              <input
                v-if="col.uidt === 'Checkbox'"
                type="checkbox"
                :checked="!!fieldValues[col.title || '']"
                :disabled="isReadOnly || !!col.pk || !!col.ai"
                @change="fieldValues[col.title || ''] = !fieldValues[col.title || '']; saveField(col.title || '')"
                class="nc-ef-checkbox"
              />
              <!-- Long Text -->
              <textarea
                v-else-if="col.uidt === 'LongText'"
                v-model="fieldValues[col.title || '']"
                :disabled="isReadOnly || !!col.pk || !!col.ai"
                class="nc-ef-textarea"
                @blur="saveField(col.title || '')"
              />
              <!-- Read-only fields -->
              <div
                v-else-if="col.pk || col.ai || col.system || (READONLY_COLUMN_TYPES as readonly string[]).includes(col.uidt || '')"
                class="nc-ef-readonly-value"
              >
                {{ fieldValues[col.title || ''] ?? '—' }}
              </div>
              <!-- Default input -->
              <input
                v-else
                v-model="fieldValues[col.title || '']"
                :type="['Number', 'Decimal', 'Currency', 'Percent'].includes(col.uidt || '') ? 'number' : 'text'"
                :disabled="isReadOnly"
                class="nc-ef-input"
                @blur="saveField(col.title || '')"
              />
            </div>
          </div>
        </div>

        <!-- Comments tab -->
        <div v-if="activeTab === 'comments'" class="nc-ef-comments">
          <div v-if="commentsLoading" class="nc-ef-comments-loading">
            Loading comments...
          </div>
          <div v-else-if="comments.length === 0" class="nc-ef-comments-empty">
            No comments yet
          </div>
          <div v-else class="nc-ef-comments-list">
            <div
              v-for="(comment, idx) in comments"
              :key="idx"
              class="nc-ef-comment"
            >
              <div class="nc-ef-comment-header">
                <span class="nc-ef-comment-author">{{ (comment as Record<string, unknown>).created_by_email || 'User' }}</span>
                <span class="nc-ef-comment-time">{{ (comment as Record<string, unknown>).created_at || '' }}</span>
              </div>
              <div class="nc-ef-comment-body">
                {{ (comment as Record<string, unknown>).comment || '' }}
              </div>
            </div>
          </div>

          <!-- Add comment -->
          <div class="nc-ef-add-comment">
            <textarea
              v-model="newComment"
              class="nc-ef-comment-input"
              placeholder="Write a comment..."
              @keydown.enter.ctrl="submitComment"
            />
            <button
              class="nc-grid-btn nc-grid-btn-primary nc-ef-comment-submit"
              :disabled="!newComment.trim()"
              @click="submitComment"
            >
              Send
            </button>
          </div>
        </div>

        <!-- Audit tab -->
        <div v-if="activeTab === 'audit'" class="nc-ef-audit">
          <div class="nc-ef-audit-placeholder">
            Audit log is not available in standalone mode.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nc-expanded-form-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.nc-expanded-form {
  background: var(--nc-grid-bg-color, #ffffff);
  border-radius: 8px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 720px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.nc-ef-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--nc-grid-border-color, #e5e7eb);
}

.nc-ef-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nc-ef-nav-btn {
  background: none;
  border: 1px solid var(--nc-grid-border-color, #e5e7eb);
  border-radius: 4px;
  cursor: pointer;
  padding: 4px 10px;
  font-size: 18px;
  color: var(--nc-grid-text-color, #1f2937);
}

.nc-ef-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nc-ef-nav-btn:hover:not(:disabled) {
  background: var(--nc-grid-hover-bg, #f3f4f6);
}

.nc-ef-record-info {
  font-size: 13px;
  color: var(--nc-grid-text-secondary, #6b7280);
}

.nc-ef-close-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: var(--nc-grid-text-secondary, #6b7280);
  padding: 4px 8px;
}

.nc-ef-close-btn:hover {
  color: var(--nc-grid-text-color, #1f2937);
}

/* Tabs */
.nc-ef-tabs {
  display: flex;
  border-bottom: 1px solid var(--nc-grid-border-color, #e5e7eb);
  padding: 0 16px;
}

.nc-ef-tab {
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 13px;
  color: var(--nc-grid-text-secondary, #6b7280);
  transition: all 0.15s;
}

.nc-ef-tab:hover {
  color: var(--nc-grid-text-color, #1f2937);
}

.nc-ef-tab-active {
  color: var(--nc-grid-primary-color, #3b82f6);
  border-bottom-color: var(--nc-grid-primary-color, #3b82f6);
}

/* Content */
.nc-ef-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

/* Fields */
.nc-ef-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.nc-ef-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nc-ef-field-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--nc-grid-text-secondary, #6b7280);
  display: flex;
  align-items: center;
  gap: 4px;
}

.nc-ef-pk-badge {
  font-size: 10px;
  background: var(--nc-grid-primary-bg, #eff6ff);
  color: var(--nc-grid-primary-color, #3b82f6);
  padding: 0 4px;
  border-radius: 2px;
}

.nc-ef-required {
  color: var(--nc-grid-error-color, #dc2626);
}

.nc-ef-input,
.nc-ef-textarea {
  padding: 8px 10px;
  border: 1px solid var(--nc-grid-border-color, #e5e7eb);
  border-radius: 4px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}

.nc-ef-input:focus,
.nc-ef-textarea:focus {
  border-color: var(--nc-grid-primary-color, #3b82f6);
}

.nc-ef-input:disabled,
.nc-ef-textarea:disabled {
  background: var(--nc-grid-header-bg, #f9fafb);
  cursor: not-allowed;
}

.nc-ef-textarea {
  min-height: 80px;
  resize: vertical;
}

.nc-ef-checkbox {
  width: 18px;
  height: 18px;
  accent-color: var(--nc-grid-primary-color, #3b82f6);
}

.nc-ef-readonly-value {
  padding: 8px 10px;
  background: var(--nc-grid-header-bg, #f9fafb);
  border-radius: 4px;
  font-size: 13px;
  color: var(--nc-grid-text-secondary, #6b7280);
  min-height: 36px;
  display: flex;
  align-items: center;
}

/* Comments */
.nc-ef-comments {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.nc-ef-comments-loading,
.nc-ef-comments-empty {
  text-align: center;
  color: var(--nc-grid-text-secondary, #6b7280);
  padding: 24px;
}

.nc-ef-comments-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.nc-ef-comment {
  padding: 10px;
  border: 1px solid var(--nc-grid-border-color, #e5e7eb);
  border-radius: 6px;
}

.nc-ef-comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.nc-ef-comment-author {
  font-size: 12px;
  font-weight: 500;
  color: var(--nc-grid-text-color, #1f2937);
}

.nc-ef-comment-time {
  font-size: 11px;
  color: var(--nc-grid-text-secondary, #9ca3af);
}

.nc-ef-comment-body {
  font-size: 13px;
  color: var(--nc-grid-text-color, #374151);
}

.nc-ef-add-comment {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.nc-ef-comment-input {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid var(--nc-grid-border-color, #e5e7eb);
  border-radius: 4px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  resize: none;
  min-height: 40px;
}

.nc-ef-comment-input:focus {
  border-color: var(--nc-grid-primary-color, #3b82f6);
}

.nc-ef-comment-submit {
  white-space: nowrap;
}

/* Audit */
.nc-ef-audit-placeholder {
  text-align: center;
  color: var(--nc-grid-text-secondary, #6b7280);
  padding: 24px;
}

.nc-grid-btn {
  padding: 6px 16px;
  border-radius: 4px;
  border: 1px solid var(--nc-grid-border-color, #e5e7eb);
  background: var(--nc-grid-bg-color, #ffffff);
  cursor: pointer;
  font-size: 13px;
}

.nc-grid-btn-primary {
  background: var(--nc-grid-primary-color, #3b82f6);
  color: #ffffff;
  border-color: var(--nc-grid-primary-color, #3b82f6);
}

.nc-grid-btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
