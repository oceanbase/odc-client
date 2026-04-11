/**
 * useRowDragging — Row reorder via drag-and-drop
 */
import { ref } from 'vue';
import { useGridStore } from '../stores/gridStore';

export function useRowDragging() {
  const gridStore = useGridStore();

  const isDragging = ref(false);
  const dragRowIndex = ref(-1);
  const dragOverRowIndex = ref(-1);

  function onDragStart(index: number, event: DragEvent): void {
    isDragging.value = true;
    dragRowIndex.value = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(index));
    }
  }

  function onDragOver(index: number, event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    dragOverRowIndex.value = index;
  }

  function onDragLeave(): void {
    dragOverRowIndex.value = -1;
  }

  function onDrop(toIndex: number, event: DragEvent): void {
    event.preventDefault();
    isDragging.value = false;
    dragOverRowIndex.value = -1;

    if (dragRowIndex.value >= 0 && dragRowIndex.value !== toIndex) {
      // Reorder rows locally
      const rows = [...gridStore.rows];
      const [movedRow] = rows.splice(dragRowIndex.value, 1);
      rows.splice(toIndex, 0, movedRow);
      gridStore.rows.splice(0, gridStore.rows.length, ...rows);
    }
    dragRowIndex.value = -1;
  }

  function onDragEnd(): void {
    isDragging.value = false;
    dragRowIndex.value = -1;
    dragOverRowIndex.value = -1;
  }

  return {
    isDragging,
    dragRowIndex,
    dragOverRowIndex,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd,
  };
}
