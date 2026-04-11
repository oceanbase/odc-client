<script setup lang="ts">
/**
 * HeaderIcon.vue — Column type icon renderer
 */
import { computed } from 'vue';
import type { ColumnType } from 'nocodb-sdk';

const props = defineProps<{
  column: ColumnType;
}>();

const COLUMN_ICONS: Record<string, string> = {
  SingleLineText: 'Aa',
  LongText: '¶',
  Number: '#',
  Decimal: '#.#',
  Currency: '$',
  Percent: '%',
  Email: '@',
  URL: '🔗',
  PhoneNumber: '📞',
  Checkbox: '☑',
  SingleSelect: '▼',
  MultiSelect: '☰',
  Date: '📅',
  DateTime: '📅',
  Time: '⏰',
  Duration: '⏱',
  Year: '📅',
  Rating: '⭐',
  Attachment: '📎',
  Barcode: '▐',
  QrCode: '▣',
  JSON: '{}',
  Formula: 'ƒ',
  Lookup: '↗',
  Rollup: 'Σ',
  Count: '#',
  Links: '🔗',
  LinkToAnotherRecord: '🔗',
  User: '👤',
  CreatedBy: '👤',
  LastModifiedBy: '👤',
  CreatedTime: '🕐',
  LastModifiedTime: '🕐',
  GeoData: '📍',
  Geometry: '📐',
  ID: '🔑',
  AutoNumber: '🔢',
  Button: '🔘',
};

const icon = computed(() => {
  return COLUMN_ICONS[props.column.uidt || ''] || 'Aa';
});
</script>

<template>
  <span class="nc-header-icon" :title="column.uidt">{{ icon }}</span>
</template>

<style scoped>
.nc-header-icon {
  font-size: 11px;
  color: var(--nc-grid-text-secondary, #6b7280);
  flex-shrink: 0;
  width: 16px;
  text-align: center;
}
</style>
