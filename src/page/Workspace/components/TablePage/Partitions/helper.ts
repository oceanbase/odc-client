import { IPartitionType } from '@/d.ts';
import {
  ITableListColumnsPartition,
  ITableListPartition,
  ITableModel,
  ITableRangeColumnsPartition,
  ITableRangePartition,
} from '../../CreateTable/interface';

export function getRowsByPartType(type: IPartitionType, data: ITableModel['partitions']) {
  switch (type) {
    case IPartitionType.LIST:
    case IPartitionType.RANGE: {
      return (data as ITableListPartition | ITableRangePartition)?.partitions?.map(
        (p, position) => {
          position = position + 1;
          return {
            name: p.name,
            position,
            partValues: p.value,
            isNew: p.isNew,
            key: p.ordinalPosition ?? p.key,
          };
        },
      );
    }
    case IPartitionType.LIST_COLUMNS:
      return (data as ITableListColumnsPartition)?.partitions?.map((p, position) => {
        position = position + 1;
        return {
          name: p.name,
          position,
          isNew: p.isNew,
          partValues: p.value
            .map((item) => {
              return Object.entries(item)
                .map(([ColumnName, value]) => {
                  return `${ColumnName}:${value}`;
                })
                .join(',');
            })
            .join(' | '),
          key: p.ordinalPosition ?? p.key,
        };
      });
    case IPartitionType.RANGE_COLUMNS:
      return (data as ITableRangeColumnsPartition)?.partitions?.map((p, position) => {
        position = position + 1;
        return {
          name: p.name,
          position,
          isNew: p.isNew,
          partValues: Object.entries(p.value)
            .map(([ColumnName, value]) => {
              return `${ColumnName}:${value}`;
            })
            .join(' | '),
          key: p.ordinalPosition ?? p.key,
        };
      });
    default: {
      return [];
    }
  }
}
