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

import BigNumber from 'bignumber.js';
import { isArray, toString } from 'lodash';
import dayjs, { isDayjs } from 'dayjs';

/**
 * 获取 value 的显示值
 */
function getValueText(value, options?: { showTime: boolean }) {
  if (isArray(value)) {
    return value
      .map((v) => {
        return getValueText(v, options);
      })
      .join(' ~ ');
  } else if (isDayjs(value)) {
    return value.format(options?.showTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD');
  }
  return toString(value);
}
/**
 * 获取列表显示文字
 */
export function getTextItem(
  items: [string, string | typeof dayjs | any[]][],
  options?: { showTime: boolean },
) {
  return items
    ?.map((item) => {
      let value = item[1];
      value = getValueText(value, options);
      if (!value) {
        return null;
      }
      return `${item[0]}: ${value}`;
    })
    .filter(Boolean)
    .join(' | ');
}

export function getSignWithOrder(order: 'asc' | 'desc') {
  return order === 'asc' ? 1 : -1;
}

export function getOrderWithSign(sign: string | number) {
  return new BigNumber(sign).comparedTo(0) === 1 ? 'asc' : 'desc';
}

/**
 * 部分日期因为时区偏差问题不能选择
 */
export function disabledDateOfMock(currentDate: dayjs.Dayjs) {
  return currentDate?.valueOf?.() < 0;
}

/**
 * 获取时间的时区
 * 例如：GMT+0800
 */
export function getTimeZone(currentDate: dayjs.Dayjs) {
  const regexp = /GMT[+-]\d+/i;
  if (isDayjs(currentDate)) {
    return regexp.exec(currentDate.toString())?.[0];
  }
  return regexp.exec(new Date().toString())?.[0];
}
