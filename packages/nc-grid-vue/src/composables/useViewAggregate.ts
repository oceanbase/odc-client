/**
 * useViewAggregate — Column aggregation (sum, avg, count, min, max, etc.)
 */
import { ref, computed } from 'vue';
import { useGridStore } from '../stores/gridStore';
import type { AggregationType, ColumnAggregation } from '../types';
import type { ColumnType } from 'nocodb-sdk';

export function useViewAggregate() {
  const gridStore = useGridStore();

  const aggregations = ref<Map<string, ColumnAggregation>>(new Map());

  /** Get aggregation result for a column */
  function getAggregation(columnId: string): ColumnAggregation | undefined {
    return aggregations.value.get(columnId);
  }

  /** Set aggregation type for a column */
  function setAggregation(columnId: string, type: AggregationType): void {
    const current = aggregations.value.get(columnId);
    aggregations.value.set(columnId, {
      ...current,
      fk_column_id: columnId,
      type,
      result: undefined,
    });
    // Trigger reactivity
    aggregations.value = new Map(aggregations.value);
    // Compute result
    computeAggregation(columnId);
  }

  /** Remove aggregation for a column */
  function removeAggregation(columnId: string): void {
    aggregations.value.delete(columnId);
    aggregations.value = new Map(aggregations.value);
  }

  /** Compute aggregation from local data */
  function computeAggregation(columnId: string): void {
    const agg = aggregations.value.get(columnId);
    if (!agg) return;

    const column = gridStore.columns.find((c) => c.id === columnId);
    if (!column?.title) return;

    const values = gridStore.rows
      .map((r) => r.row[column.title!])
      .filter((v) => v !== null && v !== undefined);

    let result: unknown;

    switch (agg.type) {
      case 'count':
        result = gridStore.rows.length;
        break;
      case 'count_empty':
        result = gridStore.rows.length - values.length;
        break;
      case 'count_filled':
        result = values.length;
        break;
      case 'count_unique':
        result = new Set(values.map(String)).size;
        break;
      case 'percent_empty':
        result = gridStore.rows.length > 0
          ? (((gridStore.rows.length - values.length) / gridStore.rows.length) * 100).toFixed(1) + '%'
          : '0%';
        break;
      case 'percent_filled':
        result = gridStore.rows.length > 0
          ? ((values.length / gridStore.rows.length) * 100).toFixed(1) + '%'
          : '0%';
        break;
      case 'percent_unique':
        result = values.length > 0
          ? ((new Set(values.map(String)).size / values.length) * 100).toFixed(1) + '%'
          : '0%';
        break;
      case 'sum': {
        const nums = values.map(Number).filter((n) => !isNaN(n));
        result = nums.reduce((a, b) => a + b, 0);
        break;
      }
      case 'avg': {
        const nums = values.map(Number).filter((n) => !isNaN(n));
        result = nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
        break;
      }
      case 'min': {
        const nums = values.map(Number).filter((n) => !isNaN(n));
        result = nums.length > 0 ? Math.min(...nums) : null;
        break;
      }
      case 'max': {
        const nums = values.map(Number).filter((n) => !isNaN(n));
        result = nums.length > 0 ? Math.max(...nums) : null;
        break;
      }
      case 'none':
      default:
        result = undefined;
        break;
    }

    agg.result = result;
    aggregations.value = new Map(aggregations.value);
  }

  /** Compute all aggregations (call after data changes) */
  function computeAll(): void {
    for (const [columnId] of aggregations.value) {
      computeAggregation(columnId);
    }
  }

  /** Get available aggregation types for a column type */
  function getAvailableTypes(column: ColumnType): AggregationType[] {
    const base: AggregationType[] = [
      'none', 'count', 'count_empty', 'count_filled', 'count_unique',
      'percent_empty', 'percent_filled', 'percent_unique',
    ];

    const numericTypes = ['Number', 'Decimal', 'Currency', 'Percent', 'Duration', 'Rating'];
    if (numericTypes.includes(column.uidt || '')) {
      return [...base, 'sum', 'avg', 'min', 'max'];
    }

    return base;
  }

  return {
    aggregations,
    getAggregation,
    setAggregation,
    removeAggregation,
    computeAll,
    getAvailableTypes,
  };
}
