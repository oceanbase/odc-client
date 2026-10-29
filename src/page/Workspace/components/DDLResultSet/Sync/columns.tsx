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

export function useColumns() {
  const a = [
    {
      key: 'refreshId',
      name: 'REFRESH_ID',
      width: 120,
      columnType: 'INT',
    },
    {
      key: 'refreshMethod',
      name: 'REFRESH_METHOD',
      width: 180,
      columnType: 'char',
    },
    {
      key: 'startTime',
      name: 'START_TIME',
      width: 180,
      columnType: 'char',
    },
    {
      key: 'endTime',
      name: 'END_TIME',
      width: 180,
      columnType: 'char',
    },
    {
      key: 'elapsedTime',
      name: 'ELAPSED_TIME',
      width: 180,
      columnType: 'INT',
    },
    {
      key: 'logPurgeTime',
      name: 'LOG_PURGE_TIME',
      width: 180,
      columnType: 'INT',
    },
    {
      key: 'initialNumRows',
      name: 'INITIAL_NUM_ROWS',
      width: 180,
      columnType: 'INT',
    },
    {
      key: 'finalNumRows',
      name: 'FINAL_NUM_ROWS',
      width: 180,
      columnType: 'INT',
    },
  ];
  return a.map((item, index) => ({
    ...item,
    columnName: item.name,
    columnIndex: index,
    readonly: true,
  }));
}
