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

import { isObjectColumn } from '@/util/column';
import { convertColumnType } from '@/util/utils';
import MySQLNumber from './number';
import MySQLString from './string';

export default function convertValueToSQLString(value: string | null, dataType: string) {
  dataType = convertColumnType(dataType);
  switch (dataType) {
    case 'DOUBLE':
    case 'DOUBLE_UNSIGNED':
    case 'FLOAT':
    case 'FLOAT_UNSIGNED':
    case 'DECIMAL':
    case 'DECIMAL_UNSIGNED':
    case 'BIGINT':
    case 'BIGINT_UNSIGNED':
    case 'INT':
    case 'INT_UNSIGNED':
    case 'MEDIUMINT':
    case 'MEDIUMINT_UNSIGNED':
    case 'SMALLINT':
    case 'SMALLINT_UNSIGNED':
    case 'TINYINT':
    case 'TINYINT_UNSIGNED':
    case 'NUMERIC':
    case 'NUMERIC_UNSIGNED': {
      return MySQLNumber(value);
    }
    case 'CHAR':
    case 'VARCHAR':
    case 'TINYTEXT':
    case 'MEDIUMTEXT':
    case 'LONGTEXT':
    case 'TEXT': {
      return MySQLString(value);
    }
    default: {
      if (isObjectColumn(dataType)) {
        return 'NULL';
      } else if (typeof value === 'undefined') {
        return 'DEFAULT';
      }
      return "'" + value + "'";
    }
  }
}
