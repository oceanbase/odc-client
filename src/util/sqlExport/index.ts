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

import { ConnectionMode, ResultSetColumn } from '@/d.ts';
import { generateAndDownloadFile, getQuoteTableName } from '../utils';
import mysqlConvertValueToSQLString from './dataTypes/mysql';
import oracleConvertValueToSQLString from './dataTypes/oracle';
import { isConnectionModeBeMySQLType } from '../connection';
import { getNlsValueKey } from '../column';

export default function exportToSQL(
  selectData: any[][],
  columns: ResultSetColumn[],
  tableName: string = 'tmp_table',
  dbMode: ConnectionMode,
  rows?: any,
) {
  const headerColumnNames = selectData[0];
  if (!headerColumnNames) {
    return;
  }
  const isMySQL = isConnectionModeBeMySQLType(dbMode);
  const columnMap: {
    [key: string]: ResultSetColumn;
  } = {};

  columns.forEach((column: ResultSetColumn, index: number) => {
    columnMap[column.name] = column;
  });

  const columnsText = headerColumnNames
    .map((columnName) => getQuoteTableName(columnName, dbMode))
    .join(',');

  const handleRowsText = (rowData, columnIndex) => {
    const rowsText = rowData
      .map((item, i: number) => {
        const columnName = headerColumnNames[i];
        const column = columnMap[columnName];
        const isMasked = column.masked;
        if (isMasked) {
          return item || 'NULL';
        }
        const nlsValueKey = getNlsValueKey(column.key);
        const timestamp = rows[columnIndex]?.[nlsValueKey]?.timestamp;
        return isMySQL
          ? mysqlConvertValueToSQLString(item, column.columnType)
          : oracleConvertValueToSQLString(item, column.columnType, timestamp);
      })
      .join(',');
    return `insert into ${getQuoteTableName(
      tableName,
      dbMode,
    )}(${columnsText}) values(${rowsText})`;
  };

  return selectData
    .slice(1)
    .map((rowData, columnIndex) => handleRowsText(rowData, columnIndex))
    .join(';\n');
}

export function downloadPLDDL(plName: string, plType, ddl: string, dbName: string) {
  generateAndDownloadFile(`${dbName}_${plType}_${plName}.sql`, ddl);
}
