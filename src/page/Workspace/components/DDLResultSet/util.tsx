import { ConnectionMode, ResultSetColumn } from '@/d.ts';
import { getNlsValueKey } from '@/util/column';
import exportToSQL from '@/util/sqlExport';
import { getBlobValueKey } from '@/util/utils';
import { DataGridRef, getSelectedRangeData } from '@oceanbase-odc/ob-react-data-grid';
import copy from 'copy-to-clipboard';

export function getColumnNameByColumnKey(columnKey: string, columns: ResultSetColumn[]) {
  return columns.find((c) => {
    return c?.key === columnKey;
  })?.columnName;
}

/**
 * 添加columnName
 */
export function wrapRow(row, columns: ResultSetColumn[]) {
  if (!row) {
    return null;
  }
  const newRow = { ...row };
  columns.forEach((column) => {
    newRow[column.columnName] = newRow[column.key];
    newRow[getBlobValueKey(column.columnName)] = newRow[getBlobValueKey(column.key)];
    newRow[getNlsValueKey(column.columnName)] = newRow[getNlsValueKey(column.key)];
  });
  return newRow;
}

export function copyToSQL(
  gridRef: DataGridRef,
  columns: ResultSetColumn[],
  tableName: string = 'tmp_table',
  dbMode: ConnectionMode,
) {
  const selectData = getSelectedRangeData(gridRef);
  if (!selectData) {
    return;
  }
  copy(exportToSQL(selectData, columns, tableName, dbMode));
}
