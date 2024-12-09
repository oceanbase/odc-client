/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ConnectionMode, IPartitionType } from '@/d.ts';
import {
  ITableListColumnsPartition,
  ITableListPartition,
  ITableModel,
  ITableRangeColumnsPartition,
  ITableRangePartition,
} from '../../CreateTable/interface';

export function getRowsByPartType(
  type: IPartitionType,
  data: ITableModel['partitions'],
  connectionMode: ConnectionMode,
) {
  const formatMultiListValue = (value) => {
    return value
      .map((item) => {
        return Object.entries(item)
          .map(([ColumnName, value]) => {
            return `${ColumnName}:${value}`;
          })
          .join(',');
      })
      .join(' | ');
  };

  const formatMultiRangeValue = (value) => {
    return Object.entries(value)
      .map(([ColumnName, value]) => {
        return `${ColumnName}:${value}`;
      })
      .join(' | ');
  };

  switch (type) {
    case IPartitionType.HASH:
    case IPartitionType.KEY:
      return (data as ITableListPartition | ITableRangePartition)?.partitions?.map(
        (p, position) => {
          position = position + 1;
          return {
            name: p.name,
            position,
            key: position,
            parentName: p?.parentName,
          };
        },
      );
    case IPartitionType.LIST:
      return (data as ITableListPartition | ITableRangePartition)?.partitions?.map(
        (p, position) => {
          position = position + 1;
          return {
            name: p.name,
            position,
            partValues:
              connectionMode === ConnectionMode.OB_ORACLE ? formatMultiListValue(p.value) : p.value,
            isNew: p.isNew,
            key: position,
            parentName: p?.parentName,
          };
        },
      );
    case IPartitionType.RANGE: {
      return (data as ITableListPartition | ITableRangePartition)?.partitions?.map(
        (p, position) => {
          position = position + 1;
          return {
            name: p.name,
            position,
            partValues:
              connectionMode === ConnectionMode.OB_ORACLE
                ? formatMultiRangeValue(p.value)
                : p.value,
            isNew: p.isNew,
            key: position,
            parentName: p?.parentName,
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
          partValues: formatMultiListValue(p.value),
          key: position,
          parentName: p?.parentName,
        };
      });
    case IPartitionType.RANGE_COLUMNS:
      return (data as ITableRangeColumnsPartition)?.partitions?.map((p, position) => {
        position = position + 1;
        return {
          name: p.name,
          position,
          isNew: p.isNew,
          partValues: formatMultiRangeValue(p.value),
          key: position,
          parentName: p?.parentName,
        };
      });
    default: {
      return [];
    }
  }
}
