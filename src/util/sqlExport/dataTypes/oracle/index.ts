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
import { isNlsColumn, isObjectColumn } from '@/util/column';
import { convertColumnType } from '@/util/utils';
import OracleDate from './date';
import OracleInterval from './interval';
import OracleNumber from './number';
import OracleString from './string';
import OracleTimestamp from './timestamp';
import OracleTimestampLZ from './timestampLocalZone';
import OracleTimestampTZ from './timestampTimeZone';

export default function convertValueToSQLString(value: string | null, dataType: string) {
  const isNls = isNlsColumn(dataType, ConnectionMode.OB_ORACLE);
  if (isNls) {
    return 'NULL';
  }
  dataType = convertColumnType(dataType);
  switch (dataType) {
    case 'INTEGER':
    case 'NUMBER': {
      return OracleNumber(value);
    }
    case 'CHAR':
    case 'VARCHAR':
    case 'VARCHAR2': {
      return OracleString(value);
    }
    case 'INTERVAL_YEAR_TO_MONTH':
    case 'INTERVAL_DAY_TO_SECOND':
    case 'INTERVALYM':
    case 'INTERVALDS': {
      return OracleInterval(value);
    }
    case 'TIMESTAMP': {
      return OracleTimestamp(value);
    }
    case 'TIMESTAMP_WITH_TIME_ZONE': {
      return OracleTimestampTZ(value);
    }
    case 'TIMESTAMP_WITH_LOCAL_TIME_ZONE': {
      return OracleTimestampLZ(value);
    }
    case 'DATE': {
      return OracleDate(value);
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
