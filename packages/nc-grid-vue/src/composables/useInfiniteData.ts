/**
 * useInfiniteData — Chunk-based infinite scroll data loading
 */
import { ref, computed, onUnmounted } from 'vue';
import { useGridStore } from '../stores/gridStore';
import { useViewStore } from '../stores/viewStore';
import type { Row } from '../types';

const CHUNK_SIZE = 50;

export function useInfiniteData() {
  const gridStore = useGridStore();
  const viewStore = useViewStore();

  const allRows = ref<Row[]>([]);
  const loadingMore = ref(false);
  const hasMore = ref(true);
  const currentOffset = ref(0);
  const totalLoaded = computed(() => allRows.value.length);

  async function loadInitial(): Promise<void> {
    currentOffset.value = 0;
    allRows.value = [];
    hasMore.value = true;
    await loadNextChunk();
  }

  async function loadNextChunk(): Promise<void> {
    if (loadingMore.value || !hasMore.value) return;

    loadingMore.value = true;
    try {
      const client = gridStore.getApiClient();
      const result = await client.listRows(undefined, {
        offset: currentOffset.value,
        limit: CHUNK_SIZE,
        where: viewStore.whereString || undefined,
        sort: viewStore.sortString || undefined,
      });

      const newRows: Row[] = result.list.map((record, index) => ({
        row: { ...record },
        oldRow: { ...record },
        rowMeta: {
          new: false,
          selected: false,
          commentCount: 0,
          saving: false,
          changed: false,
          rowIndex: currentOffset.value + index,
        },
      }));

      allRows.value = [...allRows.value, ...newRows];
      currentOffset.value += newRows.length;
      hasMore.value = newRows.length === CHUNK_SIZE;
    } finally {
      loadingMore.value = false;
    }
  }

  function handleScroll(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target) return;

    const { scrollTop, scrollHeight, clientHeight } = target;
    const threshold = 200; // pixels from bottom

    if (scrollHeight - scrollTop - clientHeight < threshold) {
      loadNextChunk();
    }
  }

  async function reset(): Promise<void> {
    await loadInitial();
  }

  return {
    allRows,
    loadingMore,
    hasMore,
    totalLoaded,
    loadInitial,
    loadNextChunk,
    handleScroll,
    reset,
  };
}
