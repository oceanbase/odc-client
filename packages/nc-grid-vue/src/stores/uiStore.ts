/**
 * UI store — manages column widths, row heights, scroll, expanded form, and toolbar UI
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { RowHeightType, Row } from '../types';
import { ROW_HEIGHT_MAP } from '../types';

export const useUIStore = defineStore('nc-grid-ui', () => {
  // ── State ──
  const rowHeight = ref<RowHeightType>('short');
  const showToolbar = ref(true);
  const showPagination = ref(true);
  const showExpandedForm = ref(false);
  const expandedFormRow = ref<Row | null>(null);
  const expandedFormRowIndex = ref(-1);
  const scrollTop = ref(0);
  const scrollLeft = ref(0);
  const containerWidth = ref(0);
  const containerHeight = ref(0);
  const isFullscreen = ref(false);
  const showFieldsMenu = ref(false);
  const showFilterMenu = ref(false);
  const showSortMenu = ref(false);
  const showGroupByMenu = ref(false);
  const showSearchBar = ref(false);
  const showRowHeightMenu = ref(false);

  // ── Computed ──
  const rowHeightPx = computed(() => ROW_HEIGHT_MAP[rowHeight.value]);

  // ── Actions ──

  function setRowHeight(height: RowHeightType): void {
    rowHeight.value = height;
  }

  function setShowToolbar(show: boolean): void {
    showToolbar.value = show;
  }

  function setShowPagination(show: boolean): void {
    showPagination.value = show;
  }

  function openExpandedForm(row: Row, rowIndex: number): void {
    expandedFormRow.value = row;
    expandedFormRowIndex.value = rowIndex;
    showExpandedForm.value = true;
  }

  function closeExpandedForm(): void {
    showExpandedForm.value = false;
    expandedFormRow.value = null;
    expandedFormRowIndex.value = -1;
  }

  function navigateExpandedForm(direction: 'prev' | 'next', totalRows: number): void {
    if (direction === 'prev') {
      expandedFormRowIndex.value = Math.max(0, expandedFormRowIndex.value - 1);
    } else {
      expandedFormRowIndex.value = Math.min(totalRows - 1, expandedFormRowIndex.value + 1);
    }
  }

  function updateScroll(top: number, left: number): void {
    scrollTop.value = top;
    scrollLeft.value = left;
  }

  function updateContainerSize(width: number, height: number): void {
    containerWidth.value = width;
    containerHeight.value = height;
  }

  function toggleFullscreen(): void {
    isFullscreen.value = !isFullscreen.value;
  }

  function toggleFieldsMenu(): void {
    showFieldsMenu.value = !showFieldsMenu.value;
    closeOtherMenus('fields');
  }

  function toggleFilterMenu(): void {
    showFilterMenu.value = !showFilterMenu.value;
    closeOtherMenus('filter');
  }

  function toggleSortMenu(): void {
    showSortMenu.value = !showSortMenu.value;
    closeOtherMenus('sort');
  }

  function toggleGroupByMenu(): void {
    showGroupByMenu.value = !showGroupByMenu.value;
    closeOtherMenus('groupBy');
  }

  function toggleSearchBar(): void {
    showSearchBar.value = !showSearchBar.value;
  }

  function toggleRowHeightMenu(): void {
    showRowHeightMenu.value = !showRowHeightMenu.value;
    closeOtherMenus('rowHeight');
  }

  function closeAllMenus(): void {
    showFieldsMenu.value = false;
    showFilterMenu.value = false;
    showSortMenu.value = false;
    showGroupByMenu.value = false;
    showRowHeightMenu.value = false;
  }

  function closeOtherMenus(except: string): void {
    if (except !== 'fields') showFieldsMenu.value = false;
    if (except !== 'filter') showFilterMenu.value = false;
    if (except !== 'sort') showSortMenu.value = false;
    if (except !== 'groupBy') showGroupByMenu.value = false;
    if (except !== 'rowHeight') showRowHeightMenu.value = false;
  }

  function $reset(): void {
    rowHeight.value = 'short';
    showToolbar.value = true;
    showPagination.value = true;
    showExpandedForm.value = false;
    expandedFormRow.value = null;
    expandedFormRowIndex.value = -1;
    scrollTop.value = 0;
    scrollLeft.value = 0;
    containerWidth.value = 0;
    containerHeight.value = 0;
    isFullscreen.value = false;
    closeAllMenus();
    showSearchBar.value = false;
  }

  return {
    // State
    rowHeight,
    showToolbar,
    showPagination,
    showExpandedForm,
    expandedFormRow,
    expandedFormRowIndex,
    scrollTop,
    scrollLeft,
    containerWidth,
    containerHeight,
    isFullscreen,
    showFieldsMenu,
    showFilterMenu,
    showSortMenu,
    showGroupByMenu,
    showSearchBar,
    showRowHeightMenu,
    // Computed
    rowHeightPx,
    // Actions
    setRowHeight,
    setShowToolbar,
    setShowPagination,
    openExpandedForm,
    closeExpandedForm,
    navigateExpandedForm,
    updateScroll,
    updateContainerSize,
    toggleFullscreen,
    toggleFieldsMenu,
    toggleFilterMenu,
    toggleSortMenu,
    toggleGroupByMenu,
    toggleSearchBar,
    toggleRowHeightMenu,
    closeAllMenus,
    $reset,
  };
});
