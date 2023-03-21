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
