/*
 * Copyright 2024 OceanBase
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
