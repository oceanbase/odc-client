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

import { ConnectionMode, IColumn, IColumnSizeMap } from '@/d.ts';
import BigNumber from 'bignumber.js';
import { isNil } from 'lodash';
import { convertColumnType } from './utils';

/**
 * 获取数字类型字段的最大值
 */
export function getColumnMaxValue(
  precision: number | string,
  scale: number,
  limit?: string,
): string {
  if (typeof precision === 'string') {
    precision = parseInt(precision);
  }
  if (!precision) {
    return null;
  }
  const width = precision - scale;
  let maxValue = new BigNumber(10).pow(width).minus(1);
  if (scale !== 0) {
    /**
     * 精度不等于0，需要额外加上小数点
     * 1 - 1/x^2
     */
    maxValue = maxValue.plus(
      new BigNumber(1).minus(new BigNumber(1).dividedBy(new BigNumber(10).pow(scale))),
    );
  }
  if (!isNil(limit)) {
    /**
     * 添加最大数参数限制，服务端使用long类型，客户端要限制一下，防止溢出
     */
    maxValue = BigNumber.min(limit, maxValue);
  }
  return maxValue.toString();
}
/**
 * 获取字段长度映射表
 * precision 长度
 * scale 精度
 * length 长度
 */
export function getColumnSizeMapFromColumns(columns: any[]): IColumnSizeMap {
  let tmpColummSizeMap: IColumnSizeMap = {};
  columns.forEach((column) => {
    const { precision, scale, length, dataType, columnName } = column;
    const columnType = convertColumnType(dataType);
    switch (columnType) {
      case 'TINYINT': {
        tmpColummSizeMap[columnName] = {
          isNumber: true,
          maxValue: '127',
          minValue: '-128',
          scale: 0,
        };
        break;
      }
      case 'TINYINT_UNSIGNED': {
        tmpColummSizeMap[columnName] = {
          isNumber: true,
          maxValue: '255',
          minValue: '0',
          scale: 0,
        };
        break;
      }
      case 'SMALLINT': {
        tmpColummSizeMap[columnName] = {
          isNumber: true,
          maxValue: '32767',
          minValue: '-32768',
          scale: 0,
        };
        break;
      }
      case 'SMALLINT_UNSIGNED': {
        tmpColummSizeMap[columnName] = {
          isNumber: true,
          maxValue: '65535',
          minValue: '0',
          scale: 0,
        };
        break;
      }
      case 'MEDIUMINT': {
        tmpColummSizeMap[columnName] = {
          isNumber: true,
          maxValue: '8388607',
          minValue: '-8388608',
          scale: 0,
        };
        break;
      }
      case 'MEDIUMINT_UNSIGNED': {
        tmpColummSizeMap[columnName] = {
          isNumber: true,
          maxValue: '16777215',
          minValue: '0',
          scale: 0,
        };
        break;
      }
      case 'INT': {
        tmpColummSizeMap[columnName] = {
          isNumber: true,
          maxValue: '2147483647',
          minValue: '-2147483648',
          scale: 0,
        };
        break;
      }
      case 'INT_UNSIGNED': {
        tmpColummSizeMap[columnName] = {
          isNumber: true,
          maxValue: '0',
          minValue: '4294967295',
          scale: 0,
        };
        break;
      }
      case 'BIGINT': {
        tmpColummSizeMap[columnName] = {
          isNumber: true,
          maxValue: '9223372036854775807',
          minValue: '-9223372036854775808',
          scale: 0,
        };
        break;
      }
      case 'BIGINT_UNSIGNED': {
        tmpColummSizeMap[columnName] = {
          isNumber: true,
          maxValue: '18446744073709551615',
          minValue: '0',
          scale: 0,
        };
        break;
      }
      case 'BIT': {
        tmpColummSizeMap[columnName] = {
          isNumber: true,
          maxValue: new BigNumber(2).pow(precision).minus(1).toString(),
          minValue: '0',
          scale: 0,
        };
        break;
      }
      case 'TINYTEXT':
      case 'TINYBLOB': {
        /**
         * 这里 OB 返回的 width 是 256，但是 MySQL 其实限制是 255，算是 OB 的一个 BUG，等待 OB 修复。
         */
        tmpColummSizeMap[columnName] = 255;
        break;
      }
      case 'NUMBER': {
        if (precision == null && scale == null) {
          tmpColummSizeMap[columnName] = {
            isNumber: true,
            maxValue: new BigNumber('10').pow(126).toString(),
            minValue: new BigNumber('10').pow(126).multipliedBy(-1).toString(),
            scale: 0,
          };
          break;
        }
      }
      default: {
        if (precision != null) {
          const maxValue = getColumnMaxValue(precision, parseInt(scale) || 0);
          tmpColummSizeMap[columnName] = {
            isNumber: true,
            maxValue: maxValue,
            minValue: new BigNumber(maxValue).multipliedBy(-1).toString(),
            scale: parseInt(scale) || 0,
          };
        } else {
          if (length == null) {
            tmpColummSizeMap[columnName] = Infinity;
          } else {
            tmpColummSizeMap[columnName] = parseInt(/\d+/.exec(length)?.[0]);
          }
        }
      }
    }
  });
  return tmpColummSizeMap;
}

/**
 * 生成字段展示的内容
 */
export function convertColumnShowDataType(column: IColumn, isOracle: boolean = true) {
  if (!column) {
    return '';
  }
  if (['NUMBER', 'DECIMAL', 'DEC', 'NUMERIC'].includes(column.nativeDataType)) {
    const lengthText = [column.precision, column.scale].filter((a) => !isNil(a)).join(', ');
    return lengthText ? `${column.nativeDataType}(${lengthText})` : column.nativeDataType;
  }
  return `${column.dataType}(${column.length})`;
}

export function isObjectColumn(columnType: string) {
  columnType = convertColumnType(columnType);
  return ['TINYBLOB', 'BLOB', 'MEDIUMBLOB', 'LONGBLOB', 'CLOB', 'RAW'].includes(columnType);
}

export function isNlsColumn(columnType: string, dbMode: ConnectionMode) {
  if (dbMode !== ConnectionMode.OB_ORACLE) {
    return false;
  }
  columnType = convertColumnType(columnType);
  return [
    'TIMESTAMP_WITH_TIME_ZONE',
    'TIMESTAMP_WITH_LOCAL_TIME_ZONE',
    'TIMESTAMP',
    'DATE',
  ].includes(columnType);
}

export function getNlsValueKey(columnKey: string) {
  return columnKey + '%' + 'odc_nls_value_key$$$';
}
