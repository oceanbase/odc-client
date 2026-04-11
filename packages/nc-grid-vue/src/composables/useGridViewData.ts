/**
 * useGridViewData — Core data fetching, caching, pagination, and CRUD composable
 */
import { watch, onMounted } from 'vue';
import { useGridStore } from '../stores/gridStore';
import { useViewStore } from '../stores/viewStore';

export function useGridViewData() {
  const gridStore = useGridStore();
  const viewStore = useViewStore();

  async function loadData(page?: number): Promise<void> {
    const where = viewStore.whereString;
    const sort = viewStore.sortString;
    await gridStore.loadRows({ page, where: where || undefined, sort: sort || undefined });
  }

  async function reloadData(): Promise<void> {
    await loadData(gridStore.paginationData.page);
  }

  async function changePage(page: number): Promise<void> {
    await loadData(page);
  }

  async function changePageSize(size: number): Promise<void> {
    gridStore.setPageSize(size);
    await loadData(1);
  }

  // Watch for sort/filter changes to reload data
  watch(
    () => [viewStore.sortString, viewStore.whereString],
    () => {
      loadData(1);
    }
  );

  return {
    loadData,
    reloadData,
    changePage,
    changePageSize,
  };
}
