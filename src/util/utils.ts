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
import {
  ColumnShowType,
  ConnectionMode,
  IConnectionPropertyType,
  IDataType,
  IndexRange,
} from '@/d.ts';
import setting from '@/store/setting';
import { JSEncrypt } from 'jsencrypt';
import { isNil } from 'lodash';
import { isSqlEmpty } from './parser/sql';
import { encodeIdentifiers, splitSql } from '@/util/data/sql';
import { runInAction } from 'mobx';

/**
 * 解析 SID 为 key/value
 * @example sid:1000002-1:d:ZJCG:var:session
 */

export function extractResourceId(id: string): {
  [key: string]: string;
} {
  const r = {};
  if (!id) {
    return r;
  }
  const s = id.split(':');

  for (let i = 0; i <= s.length; i += 2) {
    r[s[i]] = s[i + 1];
  }

  return r;
}
/**
 * 尝试查找编辑器内当前光标位置所在的 SQL 语句
 * @see aone/issue/22171605
 *
 * 需要考虑以下情况：
 * select 1;【A】
 * 【B】
 * select 2;【C】
 * sele【F】ct *
 * from 【D】
 * test;【E】
 */
export async function getCurrentSQL(
  rawSQL: string,
  offset: number,
  isMysql: boolean = true,
  delimiter: string,
): Promise<{
  sql: string;
  begin: number;
  end: number;
}> {
  const splitSqls = await splitSql(rawSQL, !isMysql, delimiter);

  if (!splitSqls?.length) {
    return null;
  }

  let realOffset = offset;
  /**
   * 寻找最近的一个非空字符, 先向后查找同行, 然后向前查找
   */

  for (let i = offset; i < rawSQL.length; i++) {
    const char = rawSQL[i];

    if (/\n/.test(char)) {
      break;
    }

    if (!char || /\s/.test(char)) {
      continue;
    } else {
      realOffset = i;
      break;
    }
  }

  if (realOffset == offset) {
    /**
     * 向后查找失败，开始向前查找
     */
    for (let i = offset; i >= 0; i--) {
      const char = rawSQL[i];

      if (!char || /\s/.test(char)) {
        continue;
      } else {
        realOffset = i;
        break;
      }
    }
  }

  let beginIndex = 0;

  if (splitSqls.length > 1) {
    /**
     * 最后一个sql为空的时候，我们就执行倒数第二个
     */
    const lastSql = rawSQL.substring(
      splitSqls[splitSqls.length - 2] + 1,
      splitSqls[splitSqls.length - 1] + 1,
    );
    const isEmpty = await isSqlEmpty(lastSql, isMysql);

    if (isEmpty) {
      splitSqls.pop();
    }
  }

  for (let i = 0; i < splitSqls.length; i++) {
    const sqlOffset = splitSqls[i] + 1;

    if (realOffset < sqlOffset || i + 1 == splitSqls.length) {
      /**
       * 处于区间, 或者到最后一个了，直接取最后一个。
       */
      let sql = rawSQL.substring(beginIndex, sqlOffset);

      if (await isSqlEmpty(sql, isMysql, true)) {
        /**
         * 假如没什么东西，就不需要执行了，返回null给上层
         */
        return null;
      }

      return {
        sql: sql?.replace(/\r\n/g, '\n'),
        begin: beginIndex,
        end: sqlOffset,
      };
    }

    beginIndex = sqlOffset;
  }
  /**
   * 什么都没
   */

  return null;
}

/**
 * dataShowType 到表格自定义编辑组件类型的映射
 */

const convertMap = {
  [ColumnShowType.BOOLEAN]: IConnectionPropertyType.BOOLEAN,
  [ColumnShowType.NUMERIC]: IConnectionPropertyType.NUMERIC,
  // 字符串需要支持换行
  [ColumnShowType.TEXT]: IConnectionPropertyType.TEXT,
  [ColumnShowType.OBJECT]: IConnectionPropertyType.OBJECT,
  [ColumnShowType.TIMESTAMP]: IConnectionPropertyType.TIMESTAMP,
  [ColumnShowType.TIME]: IConnectionPropertyType.TIME,
  [ColumnShowType.DATE]: IConnectionPropertyType.DATE,
  [ColumnShowType.DATETIME]: IConnectionPropertyType.DATETIME,
  [ColumnShowType.YEAR]: IConnectionPropertyType.YEAR,
};
export function convertShowTypeToEditType(type: ColumnShowType): IConnectionPropertyType {
  return convertMap[type];
}
/**
 * 实际数据类型转换成后端维护的类型，主要是去掉可变长度，包含以下三种情况：
 * varchar2(100) -> varchar2()
 * timestamp(6)  -> timestamp
 * date          -> date
 */

export function convertDataTypeToDataShowType(dt: string = '', map: IDataType[]): ColumnShowType {
  // Oracle 模式会返回全大写数据格式，而后端规定的 map 为全小写，需要转换
  dt = (dt && dt.toLowerCase()) || ''; // 尝试去除括号里的精度匹配，例如 varchar(100)

  let r = map?.find(({ databaseType }) => {
    dt = dt.replace(/\([^)]*\)/, '()');
    return dt === databaseType?.toLowerCase();
  }); // 如果未匹配上，连括号一起去除继续尝试匹配，例如 timestamp(6)

  if (!r) {
    r = map?.find(({ databaseType }) => {
      dt = dt.replace(/\(\)/, '');
      return dt === databaseType?.toLowerCase();
    });
  }

  return (r && r.showType) || ColumnShowType.TEXT;
}

export function isRangeDisabled(partitioned: boolean, dbMode: ConnectionMode | undefined): boolean {
  return !partitioned; // return !(partitioned && dbMode === ConnectionMode.OB_ORACLE);
}
/**
 * 范围选择逻辑如下：
 * 非分区表&mysql mode：不能进行范围选择，默认是全局；
 * 非分区表&oracle mode：不能进行范围选择，默认是全局；
 * 分区表&mysql mode:不能进行范围选择，默认是全局；
 * 分区表&oracle mode：支持范围选择，默认是局部；
 * @see aone/issue/22383865
 */

export function getRangeInitialValue(
  partitioned: boolean,
  dbMode: ConnectionMode | undefined,
): IndexRange {
  return isRangeDisabled(partitioned, dbMode) ? IndexRange.GLOBAL : IndexRange.LOCAL;
}
export function sortString(a: string = '', b: string = ''): number {
  return (a || '').localeCompare(b || '');
}

export function sortNumber(a: number = 0, b: number = 0): number {
  if (a < b) {
    return -1;
  }

  if (a > b) {
    return 1;
  }

  return 0;
}

export function isSupportAutoIncrement(dataType: string = ''): boolean {
  return (
    ['int', 'tinyint', 'smallint', 'bigint', 'mediumint', 'float', 'double'].indexOf(
      (dataType || '').toLowerCase(),
    ) > -1
  );
}

/**
 * 生成一个唯一key
 * @param suffixStr key后缀
 */
export const generateUniqKey = (function () {
  let key = 0;
  return function (suffixStr: string = ''): string {
    key = key + 1;
    return `${key}-${Date.now()}-${~~(Math.random() * 10000)}-${suffixStr || ''}`;
  };
})();

export function safeParseJson(str: string, defaultValue = null) {
  try {
    return JSON.parse(str);
  } catch (e) {
    console.log('parse json error', e);
    return defaultValue;
  }
}

export function generateRandomPassword() {
  // 随机密码: 至少包含2位数字、2位大写字母、2位小写字母和2位特殊字(即：._+@#$%)
  const data = Math.random().toString().slice(2);
  const randomPassword = `
     ${data.slice(0, 2)}
     ${String.fromCharCode(65 + Math.floor(Math.random() * 25))}
     ${String.fromCharCode(65 + Math.floor(Math.random() * 25))}
     ${String.fromCharCode(65 + Math.floor(Math.random() * 25)).toLowerCase()}
     ${String.fromCharCode(65 + Math.floor(Math.random() * 25)).toLowerCase()}
     ${String.fromCharCode(35 + Math.floor(Math.random() * 3))}
     ${String.fromCharCode(35 + Math.floor(Math.random() * 3))}
     `;
  return randomPassword.replace(/\s+/g, '');
}

/**
 * 将后端回显的tableName添加正确的双引号
 */
export function getQuoteTableName(tableName: string, dbMode: ConnectionMode) {
  const char = getDataSourceModeConfigByConnectionMode(dbMode)?.sql?.escapeChar;
  tableName = encodeIdentifiers(tableName, char);
  return char + tableName + char;
}

/**
 * blowfish 加密
 * 采用 zeropadding 的方式
 */
export function encrypt(str: string) {
  if (!setting.encryptionPublicKey || isNil(str)) {
    return str;
  }
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(setting.encryptionPublicKey);
  return encrypt.encrypt(str) || '';
}
// 已废弃
export function decrypt(str: string) {
  return str;
}

export function getBlobValueKey(columnKey: string) {
  return columnKey + '%' + 'odc_lob_value_key$$$';
}

export const getPrefixCls = (suffixCls: string, customizePrefixCls?: string) => {
  const prefixCls = 'tech';
  if (customizePrefixCls) return customizePrefixCls;
  return suffixCls ? `${prefixCls}-${suffixCls}` : prefixCls;
};

export async function getSpaceConfigForFormInitialValue(isShow, callback) {
  if (isShow) {
    await setting.getSpaceConfig();

    runInAction(() => {
      callback();
    });
  } else {
    callback();
  }
}
