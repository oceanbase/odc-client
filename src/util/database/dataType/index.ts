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
import { isNil } from 'lodash';
import { IDataTypes } from './interface';
import { dataTypes as MySQLDataTypes } from './mysql';
import { dataTypes as OracleDataTypes } from './oracle';

/**
 * [type, 是否有长度，是否有精度]
 */
type DataType = string | [string, boolean, boolean];
interface Language {
  numeric: DataType[];
  string: DataType[];
  bigType: DataType[];
  date: DataType[];
}
const _MySQL: Language = {
  numeric: [
    ['BIT', true, false],
    'BOOL',
    'BOOLEAN',
    'TINYINT',
    'SMALLINT',
    'MEDIUMINT',
    'INT',
    'INTEGER',
    'BIGINT',
    ['DECIMAL', true, true],
    ['NUMERIC', true, true],
    ['DEC', true, true],
    'FLOAT',
    'DOUBLE',
  ],
  string: [
    ['CHAR', true, false],
    ['VARCHAR', true, false],
    ['BINARY', true, false],
    ['VARBINARY', true, false],
    'ENUM',
  ],
  bigType: [
    'BLOB',
    'TINYBLOB',
    'MEDIUMBLOB',
    'LONGBLOB',
    'TEXT',
    'TINYTEXT',
    'MEDIUMTEXT',
    'LONGTEXT',
  ],
  date: ['DATE', 'DATETIME', 'TIMESTAMP', 'TIME', 'YEAR'],
};

const _Oracle: Language = {
  numeric: [
    ['NUMBER', true, true],
    'INTEGER',
    'BINARY_FLOAT',
    'BINARY_DOUBLE',
    ['FLOAT', true, false],
  ],
  string: [
    ['CHAR', true, false],
    ['NCHAR', true, false],
    ['NVARCHAR2', true, false],
    ['VARCHAR', true, false],
    ['VARCHAR2', true, false],
  ],
  bigType: [['RAW', true, false], 'BLOB', 'CLOB'],
  date: [
    'DATE',
    'TIMESTAMP',
    'TIMESTAMP WITH TIME ZONE',
    'TIMESTAMP WITH LOCAL TIME ZONE',
    'INTERVAL YEAR TO MONTH',
    'INTERVAL DAY TO SECOND',
  ],
};

function getAllType(lang: Language) {
  return lang.numeric
    .concat(lang.string)
    .concat(lang.bigType)
    .concat(lang.date)
    .map((d) => {
      if (typeof d === 'string') {
        return d;
      }
      return d[0];
    });
}

function getHaveDataLengthFunc(lang: Language) {
  return function (dataType: string) {
    const arr = /^([\w]+)(\(([^)]+)\))?$/.exec(dataType.toUpperCase());
    if (!arr) {
      return false;
    }
    dataType = arr[1];
    return !!lang.numeric
      .concat(lang.string)
      .concat(lang.bigType)
      .concat(lang.date)
      .find((a) => {
        if (typeof a === 'string') {
          return false;
        }
        return a[0] === dataType && a[1];
      });
  };
}

export const MySQL = {
  ..._MySQL,
  allType: getAllType(_MySQL),
  haveDataLength: getHaveDataLengthFunc(_MySQL),
};

export const Oracle = {
  ..._Oracle,
  allType: getAllType(_Oracle),
  haveDataLength: getHaveDataLengthFunc(_Oracle),
};

/**
 * 合并数据长度+数据精度+数据类型为真正的类型表达式
 */
export function mergeDataType(
  dbMode: ConnectionMode,
  dataType: string,
  dataLength: string | number,
  precision: string | number,
) {
  if (!/\w/.test(dataType)) {
    /**
     * 非法类型，直接返回原样内容
     */
    return dataType;
  }
  const extraInfo = [dataLength, precision].filter((a) => !isNil(a)).join(',');
  return extraInfo ? `${dataType}(${extraInfo})` : dataType;
}

/**
 * mergeDataType 解析
 */
export function parseDataType(dataType: string) {
  const result = {
    dataType: null,
    dataLength: null,
    precision: null,
  };
  const arr = /([\w]+)(\(([\w\s]+)(,([\w\s]+))?\))?/.exec(dataType);
  return {
    dataType: arr[1],
    dataLength: arr[3],
    precision: arr[5],
  };
}

class DataTypes {
  public dataTypes: Partial<Record<ConnectionMode, IDataTypes>> = {
    [ConnectionMode.OB_MYSQL]: MySQLDataTypes,
    [ConnectionMode.MYSQL]: MySQLDataTypes,
    [ConnectionMode.OB_ORACLE]: OracleDataTypes,
  };
  public getParamsCount(mode: ConnectionMode, dataTypeName: string) {
    if (!dataTypeName) {
      return 0;
    }
    const dataType = this.getDataType(mode, dataTypeName);
    if (!dataType) {
      /**
       * 不在表内的话，默认为2个，避免阻塞业务流程。
       */
      return 2;
    }
    return dataType?.params?.length;
  }

  public getDataType(mode: ConnectionMode, dataType: string) {
    dataType = dataType
      ?.replace(/\([^)]*\)/, '')
      .replace(/\s/g, '_')
      .toLowerCase();
    return this.dataTypes[mode]?.[dataType];
  }
}

export const dataTypesIns = new DataTypes();
