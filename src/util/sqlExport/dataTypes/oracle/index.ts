import { isObjectColumn } from '@/util/column';
import { convertColumnType } from '@/util/utils';
import OracleDate from './date';
import OracleInterval from './interval';
import OracleNumber from './number';
import OracleString from './string';
import OracleTimestamp from './timestamp';
import OracleTimestampLZ from './timestampLocalZone';
import OracleTimestampTZ from './timestampTimeZone';

export default function convertValueToSQLString(value: string | null, dataType: string) {
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
