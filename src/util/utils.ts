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
  IPartitionType,
} from '@/d.ts';
import setting from '@/store/setting';
import getIntl, { formatMessage } from '@/util/intl';
import BigNumber from 'bignumber.js';
import { JSEncrypt } from 'jsencrypt';
import { isNil } from 'lodash';
import dayjs from 'dayjs';
import { isSqlEmpty } from './parser/sql';
import { encodeIdentifiers, splitSql } from './sql';
import type { RangePickerProps } from 'antd/es/date-picker';
import { runInAction } from 'mobx';
export const invalidRegexpStr = /[°"§%()\[\]{}=\\?´`'#<>|,;.:+_-]/g;

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
} // export function convertTimestamp({ value }) {
//   return value && dayjs(value).format('YYYY-MM-DD HH:mm:ss');
// }
// export function convertYear({ value }) {
//   return value && dayjs(value).format('YYYY');
// }
// export function convertDate({ value }) {
//   return value && dayjs(value).format('YYYY-MM-DD');
// }
// export function convertDatetime({ value }) {
//   return value && dayjs(value).format('YYYY-MM-DD HH:mm:ss');
// }
// export function convertTime({ value }) {
//   return value;
// }

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
export function convertPartitionType(
  isOracle: boolean,
  partitionType: IPartitionType,
): IPartitionType {
  if (isOracle && partitionType === IPartitionType.RANGE) {
    return IPartitionType.RANGE_COLUMNS;
  }

  if (isOracle && partitionType === IPartitionType.LIST) {
    return IPartitionType.LIST_COLUMNS;
  }

  return partitionType;
} // 根据列名长度计算结果集列的宽度

export function calcColumnWidth(columnName: string): number {
  // 右侧筛选 + 过滤宽度为 30，最小宽度 160
  return Math.max(columnName.length * 10 + 38, 120);
}
export function getFormatDateTime(time: number) {
  return time > 0 ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '';
}
/**
 * 获取国际化时间
 */
export function getLocalFormatDateTime(time: number) {
  if (time <= 0) {
    return '';
  }
  return new Date(time).toLocaleString(getIntl()?.locale, {
    hour12: false,
    month: 'short',
    year: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
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
export function transformSecond(d: number) {
  if (!d) {
    d = 0;
  }

  let h = Math.floor(d / 3600);
  let m = Math.floor((d % 3600) / 60);
  let s = Math.floor((d % 3600) % 60);
  let hDisplay = h > 0 ? h + 'h ' : '';
  let mDisplay = m > 0 ? m + 'm ' : '';
  let sDisplay = s > 0 ? s + 's' : '';
  return hDisplay + mDisplay + sDisplay;
}
export function formatBytes(bytes: number, decimals: number = 2) {
  if (bytes === 0 || !bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
/**
 * 将OB的时间转换成前端展示文案
 * 10d2h5s => 10天2小时5秒
 */

export function transformOBConfigTimeStringToText(timeString: string) {
  const rxp = /\d+(ms|us|[dhms])/gi;
  let result = [];
  let execArr;

  while ((execArr = rxp.exec(timeString))) {
    let dString = execArr[0] as string;
    let unit = execArr[1];
    let num = dString.substring(0, dString.length - unit.length);
    result.push([num, unit]);
  }

  if (!result.length) {
    return '0s';
  }

  return result
    .map(([num, unit]) => {
      switch (unit.toLowerCase()) {
        case 'us': {
          return (
            num + formatMessage({ id: 'odc.src.util.utils.Microseconds', defaultMessage: '微秒' }) //微秒
          );
        }

        case 'ms': {
          return (
            num + formatMessage({ id: 'odc.src.util.utils.Milliseconds', defaultMessage: '毫秒' }) //毫秒
          );
        }

        case 's': {
          return (
            num + formatMessage({ id: 'odc.src.util.utils.Seconds', defaultMessage: '秒' }) //秒
          );
        }

        case 'm': {
          return (
            num + formatMessage({ id: 'odc.src.util.utils.Minutes', defaultMessage: '分钟' }) //分钟
          );
        }

        case 'h': {
          return (
            num + formatMessage({ id: 'odc.src.util.utils.Hours', defaultMessage: '小时' }) //小时
          );
        }

        case 'd': {
          return (
            num + formatMessage({ id: 'odc.src.util.utils.Days', defaultMessage: '天' }) //天
          );
        }
      }
    })
    .join('');
}

export function encodeObjName(str: string) {
  return encodeURIComponent(str);
}

/**
 * TIMESTAMP(10) WITH LOCAL TIME ZONE => TIMESTAMP_WITH_LOCAL_TIME_ZONE
 */
export function convertColumnType(columnType: string) {
  return columnType
    ?.replace(/\(\d+\)/g, '')
    .replace(/\s/g, '_')
    .toUpperCase();
}

export function convertRegexpStr(value: string) {
  return value.replace(invalidRegexpStr, '');
}

export function encodeRegexpStr(value: string) {
  return value.replace(invalidRegexpStr, '\\$&');
}

export function isWin64() {
  return navigator.userAgent.toLowerCase().indexOf('win64') > -1;
}

export function isLinux() {
  return navigator.userAgent.toLowerCase().indexOf('linux') > -1;
}

export function downloadFile(downloadUrl: string) {
  /**
   * 防止触发beforeunload提示
   */
  window._forceRefresh = true;
  const aDom = document.createElement('a');
  aDom.setAttribute('download', '');
  aDom.setAttribute('href', downloadUrl);
  document.body.appendChild(aDom);
  aDom.click();
  setTimeout(() => {
    document.body.removeChild(aDom);
    window._forceRefresh = false;
  });
}

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

export function generateAndDownloadFile(fileName: string, content: string) {
  let aDom = document.createElement('a');
  let fileBlob = new Blob([content]);
  let event = document.createEvent('MouseEvents');
  event.initMouseEvent(
    'click',
    true,
    false,
    document.defaultView,
    0,
    0,
    0,
    0,
    0,
    false,
    false,
    false,
    false,
    0,
    null,
  );
  aDom.download = fileName;
  aDom.href = URL.createObjectURL(fileBlob);
  aDom.dispatchEvent(event);
}

/**
 *  遵循 RFC 3986 标准
 */
export function fixedEncodeURIComponent(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16);
  });
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

// 获取x天前的时间戳
export function getPreTime(day: number = 0) {
  return Date.now() - day * 24 * 60 * 60 * 1000;
}
export function getBlobValueKey(columnKey: string) {
  return columnKey + '%' + 'odc_lob_value_key$$$';
}

export const getPrefixCls = (suffixCls: string, customizePrefixCls?: string) => {
  const prefixCls = 'tech';
  if (customizePrefixCls) return customizePrefixCls;
  return suffixCls ? `${prefixCls}-${suffixCls}` : prefixCls;
};

/**
 *
 * @param time 秒时间
 * @returns
 */
export function formatTimeTemplate(time: number) {
  if (isNaN(time)) {
    return '-';
  }
  if (time === 0) {
    return '0 s';
  }
  let unit = ['s', 'ms', 'us', 'ns'];
  let timeNumber = BigNumber(time);
  while (timeNumber.comparedTo(1) === -1 && unit?.length) {
    timeNumber = timeNumber.multipliedBy(1000);
    unit.shift();
  }
  if (!unit.length) {
    return '0 s';
  } else {
    return `${BigNumber(timeNumber.toFixed(2)).toString()} ${unit?.[0]}`;
  }
}
/**
 *
 * @param time 传入微秒级时间戳，
 * @returns 返回最大单位时间, 例: 6000us => 6ms
 */
export function formatTimeTemplatMicroSeconds(time: number): string {
  return formatTimeTemplate(BigNumber(time).div(1000000).toNumber());
}

export const hourToMilliSeconds = (hour: number) => {
  const milliSeconds = hour ? hour * 60 * 60 * 1000 : undefined;
  return milliSeconds;
};

export const milliSecondsToHour = (seconds: number) => {
  const hour = seconds ? seconds / 60 / 60 / 1000 : undefined;
  return hour;
};

export const hourToSeconds = (hour: number) => {
  const seconds = hour ? hour * 60 * 60 : undefined;
  return seconds;
};

export const secondsToHour = (seconds: number) => {
  const hour = seconds ? seconds / 60 / 60 : undefined;
  return hour;
};

// MB -> KB
export const mbToKb = (value: number) => {
  return value * 1024;
};

// KB -> MB
export const kbToMb = (value: number) => {
  return value / 1024;
};

// MB -> B
export const mbToB = (value: number) => {
  return value * 1024 * 1024;
};

// B -> MB
export const bToMb = (value: number) => {
  return value / 1024 / 1024;
};

/**
 * https://tc39.es/proposal-array-grouping/#sec-object.groupby
 * @param array object array => [{ level: 1, name: 'test1'}, { level: 1, name: 'test2'}, { level: 3, name: 'test3'}]
 * @param property object key => 'level'
 * @returns group by object key
 * @example groupByPropertyName([{ level: 1, name: 'test1'}, { level: 1, name: 'test2'}, { level: 3, name: 'test3'}], 'level')
 * @example return { 1: [{ level: 1, name: 'test1'}, { level: 1, name: 'test2'}], 3: [{ level: 3, name: 'test3'}]}
 */
export function groupByPropertyName(array: any[], property: string): Object {
  if (!Array.isArray(array)) {
    return {};
  }
  return array?.reduce((group, cur) => {
    group[cur[property]] ??= [];
    group?.[cur?.[property]].push(cur);
    return group;
  }, {});
}

export const disabledDate: RangePickerProps['disabledDate'] = (current) => {
  return current && current < dayjs().subtract(1, 'days').endOf('day');
};

const range = (start: number, end: number) => {
  const result = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
};

export const disabledTime = (selectedDate) => {
  const now = dayjs();
  if (!selectedDate) {
    return {
      disabledHours: () => range(0, 24),
      disabledMinutes: () => range(0, 60),
      disabledSeconds: () => range(0, 60),
    };
  }
  if (selectedDate && selectedDate.isSame(now, 'day')) {
    return {
      disabledHours: () => Array.from({ length: now.hour() }, (_, i) => i),
      disabledMinutes: (selectedHour) => {
        if (selectedHour === now.hour()) {
          return Array.from({ length: now.minute() }, (_, i) => i);
        }
        return [];
      },
      disabledSeconds: (selectedHour, selectedMinute) => {
        if (selectedHour === now.hour() && selectedMinute === now.minute()) {
          return Array.from({ length: now.second() }, (_, i) => i);
        }
        return [];
      },
    };
  }
  return {};
};

export const stringSeparatorToCRLF = (separator: string) => {
  return separator?.replace(/\\r/g, '\r')?.replace(/\\n/g, '\n');
};

export const CRLFToSeparatorString = (separator: string) => {
  return separator?.replace(/\r/g, '\\r').replace(/\n/g, '\\n');
};

export const sumTaskStats = (taskStats) => {
  return taskStats.reduce((accumulator, current) => {
    Object.keys(current).forEach((key) => {
      if (typeof current[key] === 'number') {
        // 确保只处理数值类型的键
        if (!accumulator[key]) {
          accumulator[key] = 0;
        }
        accumulator[key] += current[key];
      }
    });
    return accumulator;
  }, {});
};
export function groupBySessionId(filteredRows) {
  const sessionMap = new Map();

  filteredRows.forEach((row) => {
    const sessionId = row?.sessionId;

    if (!sessionMap.has(sessionId)) {
      sessionMap.set(sessionId, {
        ...row,
        children: [],
      });
    } else {
      const existingEntry = sessionMap.get(sessionId);

      if (row.status === 'ACTIVE' && existingEntry.status !== 'ACTIVE') {
        sessionMap.set(sessionId, {
          ...row,
          children: [existingEntry, ...existingEntry.children],
        });
        delete existingEntry.children;
      } else {
        existingEntry?.children?.push(row);
      }
    }
  });

  const cleanedSessions = Array.from(sessionMap.values()).map((entry) => {
    if (entry.children && entry.children.length === 0) {
      delete entry.children;
    }
    return entry;
  });

  return cleanedSessions;
}

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

/** 根据Key去重数组 */
export const uniqueTools = (tools) => {
  return Array.from(new Map(tools.map((obj) => [obj.key, obj])).values());
};

export const flatArray = (array: any[]): any[] => {
  return array?.reduce?.((pre, cur) => pre?.concat(Array.isArray(cur) ? flatArray(cur) : cur), []);
};

export const maskAPIKey = (apiKey: string) => {
  if (apiKey.length <= 3) {
    return apiKey; // 如果长度小于等于3，直接返回原字符串
  }

  const firstPart = apiKey.slice(0, 2); // 取前两位
  const lastPart = apiKey.slice(-1); // 取最后一位
  const maskedPart = '*'.repeat(apiKey.length - 3); // 生成遮盖部分

  return `${firstPart}${maskedPart}${lastPart}`; // 拼接结果
};
