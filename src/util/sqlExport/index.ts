import { ConnectionMode, ResultSetColumn } from '@/d.ts';
import connection from '@/store/connection';
import { generateAndDownloadFile, getQuoteTableName } from '../utils';
import mysqlConvertValueToSQLString from './dataTypes/mysql';
import oracleConvertValueToSQLString from './dataTypes/oracle';

export default function exportToSQL(
  selectData: any[][],
  columns: ResultSetColumn[],
  tableName: string = 'tmp_table',
) {
  const headerColumnNames = selectData[0];
  if (!headerColumnNames) {
    return;
  }
  const isMySQL = connection.connection.dbMode === ConnectionMode.OB_MYSQL;
  const columnMap: {
    [key: string]: ResultSetColumn;
  } = {};
  columns.forEach((column: ResultSetColumn, index: number) => {
    columnMap[column.name] = column;
  });
  const columnsText = headerColumnNames
    .map((columnName) => getQuoteTableName(columnName))
    .join(',');
  return selectData
    .slice(1)
    .map((rowData) => {
      const rowsText = rowData
        .map((item, i: number) => {
          const columnName = headerColumnNames[i];
          const column = columnMap[columnName];
          return isMySQL
            ? mysqlConvertValueToSQLString(item, column.columnType)
            : oracleConvertValueToSQLString(item, column.columnType);
        })
        .join(',');
      return `insert into ${getQuoteTableName(tableName)}(${columnsText}) values(${rowsText})`;
    })
    .join(';\n');
}

export function downloadPLDDL(plName: string, plType, ddl: string, dbName: string) {
  generateAndDownloadFile(`${dbName}_${plType}_${plName}.sql`, ddl);
}
