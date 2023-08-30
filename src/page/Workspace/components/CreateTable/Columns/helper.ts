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

import { ConnectionMode } from '@/d.ts';
import { isConnectionModeBeMySQLType } from '@/util/connection';
import { dataTypesIns } from '@/util/dataType';

export function getTypeByColumnName(columnName: string, dialectType) {
  if (!columnName) {
    return null;
  }
  const isMySQL = isConnectionModeBeMySQLType(dialectType);
  const matchArr = [
    {
      type: isMySQL ? 'int' : 'NUMBER',
      regexp: /id$/i,
    },
    {
      type: isMySQL ? 'varchar' : 'VARCHAR',
      regexp: /name/i,
    },
    {
      type: isMySQL ? 'datetime' : 'DATE',
      regexp: /date/i,
    },
    {
      type: isMySQL ? 'timestamp' : 'TIMESTAMP',
      regexp: /time/i,
    },
    {
      type: isMySQL ? 'varchar' : 'VARCHAR',
      regexp: /.*/i,
    },
  ];
  for (let item of matchArr) {
    if (item.regexp.test(columnName)) {
      return { type: dataTypesIns.getDataType(dialectType, item.type), name: item.type };
    }
  }
  return null;
}
