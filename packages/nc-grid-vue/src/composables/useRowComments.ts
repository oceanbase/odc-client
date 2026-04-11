/**
 * useRowComments — Comment CRUD for rows
 */
import { ref } from 'vue';
import { useGridStore } from '../stores/gridStore';

export interface RowComment {
  id?: string;
  comment: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  created_by_email?: string;
}

export function useRowComments() {
  const gridStore = useGridStore();

  const comments = ref<RowComment[]>([]);
  const loading = ref(false);
  const currentRowId = ref<string | null>(null);

  async function loadComments(rowId: string): Promise<void> {
    loading.value = true;
    currentRowId.value = rowId;
    try {
      const client = gridStore.getApiClient();
      const result = await client.getComments(rowId);
      comments.value = (result as RowComment[]) || [];
    } catch {
      comments.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function addComment(rowId: string, text: string): Promise<void> {
    const client = gridStore.getApiClient();
    await client.createComment(rowId, text);
    // Reload to get the new comment with metadata
    await loadComments(rowId);
  }

  function clearComments(): void {
    comments.value = [];
    currentRowId.value = null;
  }

  return {
    comments,
    loading,
    currentRowId,
    loadComments,
    addComment,
    clearComments,
  };
}
