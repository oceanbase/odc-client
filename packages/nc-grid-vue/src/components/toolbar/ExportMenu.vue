<script setup lang="ts">
/**
 * ExportMenu.vue — Export to CSV/Excel
 */
import { ref } from 'vue';
import { useGridStore } from '../../stores/gridStore';

const gridStore = useGridStore();
const showMenu = ref(false);
const exporting = ref(false);

async function exportCsv(): Promise<void> {
  exporting.value = true;
  try {
    const client = gridStore.getApiClient();
    const blob = await client.exportCsv();
    downloadBlob(blob, 'export.csv');
  } finally {
    exporting.value = false;
    showMenu.value = false;
  }
}

async function exportExcel(): Promise<void> {
  exporting.value = true;
  try {
    const client = gridStore.getApiClient();
    const blob = await client.exportExcel();
    downloadBlob(blob, 'export.xlsx');
  } finally {
    exporting.value = false;
    showMenu.value = false;
  }
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
</script>

<template>
  <div class="nc-export-menu-wrapper">
    <button
      class="nc-toolbar-btn"
      @click="showMenu = !showMenu"
    >
      📥 Export
    </button>

    <div v-if="showMenu" class="nc-export-dropdown">
      <button class="nc-export-item" @click="exportCsv" :disabled="exporting">
        📄 Export as CSV
      </button>
      <button class="nc-export-item" @click="exportExcel" :disabled="exporting">
        📊 Export as Excel
      </button>
    </div>
  </div>
</template>

<style scoped>
.nc-export-menu-wrapper {
  position: relative;
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
}

.nc-toolbar-btn:hover {
  background: var(--nc-grid-hover-bg, #f3f4f6);
  color: var(--nc-grid-text-color, #1f2937);
}

.nc-export-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 180px;
  background: var(--nc-grid-bg-color, #ffffff);
  border: 1px solid var(--nc-grid-border-color, #e5e7eb);
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  z-index: 100;
  padding: 4px 0;
  margin-top: 4px;
}

.nc-export-item {
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
}

.nc-export-item:hover:not(:disabled) {
  background: var(--nc-grid-hover-bg, #f3f4f6);
}

.nc-export-item:disabled {
  opacity: 0.5;
  cursor: wait;
}
</style>
