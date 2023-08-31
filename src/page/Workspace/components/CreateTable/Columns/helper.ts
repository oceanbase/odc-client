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

import { getDataSourceModeConfigByConnectionMode } from '@/common/datasource';
import { dataTypesIns } from '@/util/dataType';

export function getTypeByColumnName(columnName: string, dialectType) {
  if (!columnName) {
    return null;
  }
  const config = getDataSourceModeConfigByConnectionMode(dialectType)?.schema?.table
    ?.type2ColumnType;
  const matchArr = [
    {
      type: config?.['id'],
      regexp: /id$/i,
    },
    {
      type: config?.['name'],
      regexp: /name/i,
    },
    {
      type: config?.['date'],
      regexp: /date/i,
    },
    {
      type: config?.['time'],
      regexp: /time/i,
    },
    {
      type: config?.['name'],
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
