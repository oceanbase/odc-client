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

import getIntl, { formatMessage } from '@/util/intl';
import dayjs from 'dayjs';
import type { RangePickerProps } from 'antd/es/date-picker';
import BigNumber from 'bignumber.js';

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

// 获取x天前的时间戳
export function getPreTime(day: number = 0) {
  return Date.now() - day * 24 * 60 * 60 * 1000;
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

export const disabledDate: RangePickerProps['disabledDate'] = (current) => {
  return current && current < dayjs().subtract(1, 'days').endOf('day');
};
