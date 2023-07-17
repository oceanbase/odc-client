import { ConnectionMode, INlsObject, ISqlExecuteResultStatus } from '@/d.ts';
import { getNlsValueKey, isNlsColumn } from '@/util/column';
import { generateUniqKey } from '@/util/utils';

export function generateResultSetColumns(record, dbMode: ConnectionMode, oldKey?: string) {
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
              const columnKey = columns[rowIdx].key;
              const isNlsColumnType = isNlsColumn(columns[rowIdx]?.columnType, dbMode);
              if (isNlsColumnType) {
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
