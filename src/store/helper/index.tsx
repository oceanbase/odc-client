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

import { ConnectionMode, INlsObject, IResultSet, ISqlExecuteResultStatus } from '@/d.ts';
import { getNlsValueKey, isNlsColumn } from '@/util/column';
import { generateUniqKey } from '@/util/utils';

export function generateResultSetColumns(
  record,
  dbMode: ConnectionMode,
  oldKey?: string,
): IResultSet[] {
  if (!record) {
    return null;
  }
  return record
    .map((r) => {
      let columnList = r?.resultSetMetaData?.columnList;
      const columns = r?.resultSetMetaData?.fieldMetaDataList?.map((field, index) => {
        return {
          key: `${field.columnName}_${index}`,
          name: field.columnLabel,
          columnName: field.columnName,
          columnType: field.columnTypeName.replace(/\s/g, '_'),
          columnIndex: index,
          columnComment: field.columnComment,
          internal: field.internal,
          readonly: field.editable === false,
          masked: field.masked,
          tableName: field.tableName,
        };
      });
      if (!r || !columns?.length || r.status !== ISqlExecuteResultStatus.SUCCESS) {
        return null;
      }
      if (!columnList && r?.resultSetMetaData?.fieldMetaDataList) {
        // 在关闭“获取结果集列信息”场景下，resultSetMetaData?.columnList 为 null，经和后端确定，使用 fieldMetaDataList 替代之前的 columnList，个别关键字段做兼容，如下:
        // 关键字段(/api/v1/data/batchGetModifySql 场景): columnName, dataType, primaryKey(前端不必传给后端)
        columnList = r?.resultSetMetaData?.fieldMetaDataList?.map(({ columnTypeName, ...rest }) => {
          return {
            dataType: columnTypeName,
            ...rest,
          };
        }) as any[];
      }
      return {
        ...r,
        resultSetMetaData: {
          ...r?.resultSetMetaData,
          columnList,
        },
        schemaName: record?.table?.tableName,
        columns,
        rows: r.rows?.map((row, i) => {
          return row.reduce(
            (newRowMap, value, rowIdx) => {
              const column = columns[rowIdx];
              const columnKey = column.key;
              const isNlsColumnType = isNlsColumn(columns[rowIdx]?.columnType, dbMode);
              if (isNlsColumnType && !column.masked) {
                /**
                 * 脱敏之后的当字符串处理
                 */
                newRowMap[getNlsValueKey(columnKey)] = value;
                newRowMap[columnKey] = (value as INlsObject)?.formattedContent;
              } else {
                newRowMap[columnKey] = value;
              }
              return newRowMap;
            },
            { _rowIndex: i },
          );
        }),
        uniqKey: oldKey || generateUniqKey('resultset'),
        initialSql: r.executeSql,
      };
    })
    .filter(Boolean);
}
