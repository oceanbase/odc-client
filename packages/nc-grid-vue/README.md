# nc-grid-vue

A standalone NocoDB-compatible grid/table view component for Vue 3. Provides all NocoDB grid view features as a drop-in component — just pass `serverUrl`, `token`, `tableName`, and `baseName`.

## Features

- **Full CRUD** — Create, read, update, delete rows with inline editing
- **Sorting** — Multi-column sorting with ascending/descending toggle
- **Filtering** — Complex filter conditions with and/or logic
- **Group By** — Multi-level grouping with collapsible sections
- **Column Management** — Create, rename, delete, duplicate, hide/show, resize, reorder columns
- **Cell Types** — Support for all NocoDB column types (text, number, checkbox, select, date, attachment, rating, URL, email, formula, lookup, rollup, etc.)
- **Selection** — Single cell, row, and range selection with keyboard navigation
- **Copy/Paste** — Copy selection as TSV/CSV, paste with type coercion
- **Undo/Redo** — Full undo/redo stack for all operations
- **Keyboard Navigation** — Arrow keys, Tab, Enter, Escape, Ctrl+C/V/Z
- **Expanded Form** — Full record detail modal with comments
- **Row Operations** — Expand, duplicate, delete rows
- **Infinite Scroll** — Optional infinite scroll instead of pagination
- **Pagination** — Configurable page size with navigation
- **Aggregation** — Per-column aggregation in footer (sum, avg, count, min, max, etc.)
- **Search** — Global search across all fields
- **Export** — Export to CSV and Excel
- **Theming** — Full CSS variable theming with dark/light mode support
- **Row Height** — Configurable row height (short, medium, tall, extra)
- **Drag & Drop** — Column and row reordering via drag-and-drop
- **Toolbar** — Full toolbar with fields, filter, sort, group by, search, export

## Installation

```bash
npm install nc-grid-vue nocodb-sdk vue pinia
```

## Quick Start

```vue
<script setup>
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import NcGrid from 'nc-grid-vue';
import 'nc-grid-vue/style.css';
</script>

<template>
  <NcGrid
    server-url="https://your-nocodb-instance.com"
    token="your-api-token"
    base-name="My Project"
    table-name="My Table"
    :page-size="25"
    :show-toolbar="true"
    :show-pagination="true"
    row-height="short"
    @row-click="handleRowClick"
    @cell-change="handleCellChange"
    @loaded="handleLoaded"
    @error="handleError"
  />
</template>
```

### Using as a Vue Plugin

```ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { NcGridPlugin } from 'nc-grid-vue';
import 'nc-grid-vue/style.css';
import App from './App.vue';

const app = createApp(App);
app.use(createPinia());
app.use(NcGridPlugin);
app.mount('#app');

// Now you can use <NcGrid /> anywhere in your templates
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `serverUrl` | `string` | **required** | NocoDB server URL |
| `token` | `string` | **required** | API token or JWT |
| `tableName` | `string` | **required** | Name of the table |
| `baseName` | `string` | **required** | Name of the base (project) |
| `viewName` | `string` | `undefined` | Specific view to use (defaults to first grid view) |
| `pageSize` | `number` | `25` | Rows per page |
| `infiniteScroll` | `boolean` | `false` | Use infinite scroll instead of pagination |
| `readOnly` | `boolean` | `false` | Read-only mode (disables editing) |
| `rowHeight` | `'short' \| 'medium' \| 'tall' \| 'extra'` | `'short'` | Row height |
| `showToolbar` | `boolean` | `true` | Show the toolbar |
| `showPagination` | `boolean` | `true` | Show pagination controls |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `row-click` | `(row: Row, index: number)` | Row clicked |
| `row-select` | `(rows: Row[])` | Row selection changed |
| `cell-change` | `(row: Row, field: string, value: unknown, oldValue: unknown)` | Cell value changed |
| `row-create` | `(row: Row)` | New row created |
| `row-delete` | `(row: Row)` | Row deleted |
| `row-update` | `(row: Row)` | Row updated |
| `loaded` | `({ totalRows: number, columns: ColumnType[] })` | Data loaded |
| `error` | `(error: Error)` | Error occurred |
| `view-change` | `(view: ViewType)` | Active view changed |
| `sort-change` | `(sorts: SortType[])` | Sorts changed |
| `filter-change` | `(filters: FilterType[])` | Filters changed |

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `loading` | — | Custom loading state |
| `error` | `{ error: Error }` | Custom error state |
| `empty` | — | Custom empty state |

## Theming

Override CSS custom properties to customize the appearance:

```css
.my-grid {
  --nc-grid-primary-color: #8b5cf6;
  --nc-grid-bg-color: #fefefe;
  --nc-grid-border-color: #d4d4d8;
  --nc-grid-text-color: #18181b;
  --nc-grid-header-bg: #f4f4f5;
  --nc-grid-hover-bg: #f4f4f5;
  --nc-grid-selection-bg: #ede9fe;
}
```

### Dark Mode

The component supports dark mode automatically via `prefers-color-scheme: dark`. You can also manually apply dark mode by adding the `nc-grid-dark` class:

```vue
<NcGrid class="nc-grid-dark" ... />
```

### Available CSS Variables

| Variable | Default (Light) | Description |
|----------|----------------|-------------|
| `--nc-grid-primary-color` | `#3b82f6` | Primary accent color |
| `--nc-grid-primary-hover` | `#2563eb` | Primary hover color |
| `--nc-grid-primary-bg` | `#eff6ff` | Primary background (light tint) |
| `--nc-grid-text-color` | `#1f2937` | Main text color |
| `--nc-grid-text-secondary` | `#6b7280` | Secondary text color |
| `--nc-grid-bg-color` | `#ffffff` | Background color |
| `--nc-grid-header-bg` | `#f9fafb` | Header/footer background |
| `--nc-grid-border-color` | `#e5e7eb` | Border color |
| `--nc-grid-hover-bg` | `#f3f4f6` | Row/cell hover background |
| `--nc-grid-selection-bg` | `#dbeafe` | Selection highlight color |
| `--nc-grid-error-color` | `#dc2626` | Error/danger color |
| `--nc-grid-font-family` | system fonts | Font family |
| `--nc-grid-font-size` | `13px` | Base font size |

## Advanced Usage

### Using Individual Composables

```ts
import { useGridStore, useViewSorts, useCopy } from 'nc-grid-vue';

// In your component setup
const gridStore = useGridStore();
const { addSort, clearAll } = useViewSorts();
const { copySelection } = useCopy();
```

### Using the API Client Directly

```ts
import { createNcApiClient } from 'nc-grid-vue';

const client = createNcApiClient({
  serverUrl: 'https://your-nocodb.com',
  token: 'your-token',
});

await client.initialize('My Base', 'My Table');
const rows = await client.listRows();
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Arrow keys | Navigate cells |
| Tab / Shift+Tab | Navigate to next/previous cell |
| Enter | Start editing / commit and move down |
| Escape | Cancel editing / clear selection |
| Delete / Backspace | Clear cell value |
| Ctrl+C | Copy selection |
| Ctrl+V | Paste |
| Ctrl+Z | Undo |
| Ctrl+Shift+Z / Ctrl+Y | Redo |
| Ctrl+A | Select all rows |
| Space | Toggle row selection |
| Double-click | Start cell editing |

## Architecture

```
packages/nc-grid-vue/
├── src/
│   ├── api/
│   │   └── client.ts           # NocoDB API client wrapper (nocodb-sdk)
│   ├── stores/
│   │   ├── gridStore.ts        # Row/column/pagination state
│   │   ├── viewStore.ts        # View config (sorts, filters, groupBy)
│   │   ├── selectionStore.ts   # Cell/row/range selection
│   │   ├── editStore.ts        # Edit state, undo/redo
│   │   └── uiStore.ts          # UI state (toolbar, expanded form)
│   ├── composables/
│   │   ├── useGridViewData.ts  # Data fetching & pagination
│   │   ├── useInfiniteData.ts  # Infinite scroll loading
│   │   ├── useViewSorts.ts     # Sort management
│   │   ├── useViewFilters.ts   # Filter management
│   │   ├── useViewGroupBy.ts   # Group-by operations
│   │   ├── useViewColumns.ts   # Column visibility/order
│   │   ├── useMultiSelect.ts   # Selection logic
│   │   ├── useCopy.ts          # Copy to clipboard
│   │   ├── usePaste.ts         # Paste with validation
│   │   ├── useUndoRedo.ts      # Undo/redo
│   │   ├── useColumnDrag.ts    # Column drag-and-drop
│   │   ├── useRowDragging.ts   # Row drag-and-drop
│   │   ├── useKeyboardNavigation.ts  # Keyboard shortcuts
│   │   ├── useRowExpand.ts     # Expanded form
│   │   ├── useViewAggregate.ts # Column aggregations
│   │   └── useRowComments.ts   # Row comments
│   ├── components/
│   │   ├── NcGrid.vue          # Main entry component
│   │   ├── Pagination.vue      # Pagination controls
│   │   ├── Aggregation.vue     # Column aggregation footer
│   │   ├── grid/
│   │   │   ├── Table.vue       # Paginated table
│   │   │   ├── InfiniteTable.vue # Infinite scroll table
│   │   │   ├── GroupByTable.vue  # Grouped table
│   │   │   └── GroupByLabel.vue  # Group header
│   │   ├── header/
│   │   │   ├── HeaderCell.vue  # Column header
│   │   │   ├── HeaderMenu.vue  # Column context menu
│   │   │   ├── HeaderIcon.vue  # Column type icon
│   │   │   └── AddColumn.vue   # Add column dialog
│   │   ├── cell/
│   │   │   ├── Cell.vue        # Universal cell (all types)
│   │   │   └── VirtualCell.vue # Virtual column cell
│   │   ├── row/
│   │   │   ├── RowActions.vue  # Row action buttons
│   │   │   ├── PlaceholderRow.vue # New row placeholder
│   │   │   └── ExpandedForm.vue # Record detail modal
│   │   └── toolbar/
│   │       ├── Toolbar.vue     # Main toolbar
│   │       ├── FilterBar.vue   # Filter editor
│   │       ├── SortBar.vue     # Sort editor
│   │       ├── GroupByBar.vue  # Group-by config
│   │       ├── FieldsMenu.vue  # Column visibility
│   │       ├── SearchBar.vue   # Global search
│   │       ├── RowHeight.vue   # Row height selector
│   │       └── ExportMenu.vue  # Export CSV/Excel
│   ├── styles/
│   │   └── variables.css       # CSS custom properties
│   ├── types/
│   │   └── index.ts            # TypeScript types
│   └── index.ts                # Package entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Dependencies

- **Vue 3** (^3.3.0) — peer dependency
- **Pinia** (^2.1.0) — peer dependency (state management)
- **nocodb-sdk** (^0.301.3) — NocoDB API client

## License

MIT
