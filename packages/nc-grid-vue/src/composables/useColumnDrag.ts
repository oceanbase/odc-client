/**
 * useColumnDrag — Column reorder via drag-and-drop
 */
import { ref } from 'vue';
import { useViewColumns } from './useViewColumns';

export function useColumnDrag() {
  const { moveColumn, resizeColumn } = useViewColumns();

  const isDragging = ref(false);
  const dragColumnIndex = ref(-1);
  const dragOverIndex = ref(-1);
  const isResizing = ref(false);
  const resizeColumnId = ref('');
  const resizeStartX = ref(0);
  const resizeStartWidth = ref(0);

  // ── Column reorder drag ──

  function onDragStart(index: number, event: DragEvent): void {
    isDragging.value = true;
    dragColumnIndex.value = index;
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
    dragOverIndex.value = index;
  }

  function onDragLeave(): void {
    dragOverIndex.value = -1;
  }

  async function onDrop(toIndex: number, event: DragEvent): Promise<void> {
    event.preventDefault();
    isDragging.value = false;
    dragOverIndex.value = -1;

    if (dragColumnIndex.value >= 0 && dragColumnIndex.value !== toIndex) {
      await moveColumn(dragColumnIndex.value, toIndex);
    }
    dragColumnIndex.value = -1;
  }

  function onDragEnd(): void {
    isDragging.value = false;
    dragColumnIndex.value = -1;
    dragOverIndex.value = -1;
  }

  // ── Column resize ──

  function onResizeStart(columnId: string, startX: number, currentWidth: number): void {
    isResizing.value = true;
    resizeColumnId.value = columnId;
    resizeStartX.value = startX;
    resizeStartWidth.value = currentWidth;

    const onMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - resizeStartX.value;
      const newWidth = Math.max(60, resizeStartWidth.value + diff);
      // Update width locally (visual feedback during drag)
      document.documentElement.style.setProperty(
        `--nc-col-${columnId}-width`,
        `${newWidth}px`
      );
    };

    const onMouseUp = async (e: MouseEvent) => {
      const diff = e.clientX - resizeStartX.value;
      const newWidth = Math.max(60, resizeStartWidth.value + diff);
      isResizing.value = false;

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      // Persist width to server
      await resizeColumn(resizeColumnId.value, newWidth);
      resizeColumnId.value = '';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  return {
    isDragging,
    dragColumnIndex,
    dragOverIndex,
    isResizing,
    resizeColumnId,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd,
    onResizeStart,
  };
}
