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

const getSelectedColumnsData = (selectedColumns, rows, columns) => {
  const data = [];
  const selectedColumnsDataHead = [];
  for (let i = 0; i < columns?.length; i++) {
    if (selectedColumns.has(columns[i].key)) {
      selectedColumnsDataHead.push(columns[i].name);
    }
  }
  data.push(selectedColumnsDataHead);
  for (let i = 0; i < rows?.length; i++) {
    const selectedRow = [];
    for (const item of selectedColumns) {
      selectedRow.push(rows?.[i]?.[item]);
    }
    data.push(selectedRow);
  }
  return data;
};

export function copyToSQL(
  gridRef: DataGridRef,
  columns: ResultSetColumn[],
  tableName: string = 'tmp_table',
  dbMode: ConnectionMode,
  allRows?: any,
) {
  let newRows = [];
  const { selectedRows, selectedColumns, rows } = gridRef;

  // export SQL by selected columns
  if (selectedColumns?.size > 0) {
    const selectedColumnsData = getSelectedColumnsData(selectedColumns, rows, columns);
    newRows = rows;
    copy(exportToSQL(selectedColumnsData, columns, tableName, dbMode, newRows));
    return;
  }

  const selectData = getSelectedRangeData(gridRef);
  if (!selectData) return;

  // export SQL by selected rows
  if (selectedRows?.size > 0) {
    for (let item of selectedRows) {
      newRows.push(allRows?.[item]);
    }
    copy(exportToSQL(selectData, columns, tableName, dbMode, newRows));
    return;
  }

  // export SQL by selected cells
  const { rowIdx, endRowIdx } = gridRef.selectedRange;
  if (rowIdx > -1 && endRowIdx > -1) {
    newRows = gridRef?.rows?.slice(rowIdx, endRowIdx + 1);
    copy(exportToSQL(selectData, columns, tableName, dbMode, newRows));
    return;
  }
}
