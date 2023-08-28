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

import { formatMessage } from '@/util/intl';
import { getFormatDateTime } from '@/util/utils';
import parser from 'cron-parser';
import { initial, last } from 'lodash';
import { cronErrorMessage, initCronString, weekOptions } from './const';
import { CronInputName, CrontabDateType, CrontabMode } from './interface';

const CronConstraints = [
  { min: 0, max: 59, chars: [] }, // Second
  { min: 0, max: 59, chars: [] }, // Minute
  { min: 0, max: 23, chars: [] }, // Hour
  { min: 1, max: 31, chars: ['L'] }, // Day of month
  { min: 1, max: 12, chars: [] }, // Month
  { min: 0, max: 7, chars: ['L'] }, // Day of week
];

const cronLabelMap = {
  [CronInputName.second]: [
    formatMessage({ id: 'odc.component.Crontab.utils.Seconds' }), //秒
  ],
  [CronInputName.minute]: [
    formatMessage({ id: 'odc.component.Crontab.utils.Points' }), //分
  ],
  [CronInputName.hour]: [
    formatMessage({ id: 'odc.component.Crontab.utils.Point' }), //点
    formatMessage({ id: 'odc.component.Crontab.utils.Hours' }), //小时
  ],
  [CronInputName.dayOfMonth]: [
    formatMessage({ id: 'odc.component.Crontab.utils.Day' }), //日
  ],
  [CronInputName.month]: [
    formatMessage({ id: 'odc.component.Crontab.utils.Month' }), //月
  ],
  [CronInputName.dayOfWeek]: [
    formatMessage({ id: 'odc.component.Crontab.utils.Zhou' }), //周
  ],
};

enum CRON_SPEED {
  daily = 'daily',
  weekly = 'weekly',
  monthly = 'monthly',
  yearly = 'yearly',
}

const cronSpeedLabelMap = {
  [CRON_SPEED.daily]: formatMessage({
    id: 'odc.component.Crontab.utils.EveryDay',
  }),
  //每天
  [CRON_SPEED.weekly]: formatMessage({
    id: 'odc.component.Crontab.utils.Weekly',
  }),
  //每周
  [CRON_SPEED.monthly]: formatMessage({
    id: 'odc.component.Crontab.utils.Monthly',
  }),
  //每月
  [CRON_SPEED.yearly]: formatMessage({
    id: 'odc.component.Crontab.utils.EveryYear',
  }),
  //每年
};

const reg = /[*?]/;
const charsReg = /[#L]/;

const CronFieldKeys = [
  CronInputName.second,
  CronInputName.minute,
  CronInputName.hour,
  CronInputName.dayOfMonth,
  CronInputName.month,
  CronInputName.dayOfWeek,
];

export function getAllHourValue() {
  return Array(24)
    .fill(0)
    .map((item, i) => i);
}

export function getAllFields() {
  return [
    CronInputName.second,
    CronInputName.minute,
    CronInputName.hour,
    CronInputName.dayOfMonth,
    CronInputName.month,
    CronInputName.dayOfWeek,
  ];
}

export function validateCronFields(value: string) {
  let error = null;
  try {
    const values = value?.split(' ');
    const isDayOfMonthNumber = Number.isInteger(Number(values?.[3]));
    const isDayOfWeekNumber = Number.isInteger(Number(values?.[5]));
    if (values?.[3] === '*' && values?.[5] === '*') {
      error = formatMessage({
        id: 'odc.component.Crontab.utils.TheDayAndWeekCannot',
      });
      //日和周不能同时设置为*
    }
    if (values?.[3] === '?' && values?.[5] === '?') {
      error = formatMessage({ id: 'odc.component.Crontab.utils.CannotBeSetToBoth' }); //日和周不能同时设置为?
    } else if (
      (isDayOfMonthNumber && isDayOfWeekNumber) ||
      (isDayOfMonthNumber && values?.[5] === '*') ||
      (isDayOfWeekNumber && values?.[3] === '*')
    ) {
      error = formatMessage({ id: 'odc.component.Crontab.utils.ToAvoidConflictsYouCannot' }); //为避免冲突, 日和周不能同时指定值，需要将另一个域的值设为?
    } else {
      parser.parseExpression(value);
    }
  } catch (err) {
    error = cronErrorMessage;
  }
  return error;
}

export const getCronString = (values: {
  hour: number[];
  dayOfWeek: number[];
  dayOfMonth: number[];
}) => {
  const { hour, dayOfWeek, dayOfMonth } = values;
  const initInterval = parser.parseExpression(initCronString);
  const fields = JSON.parse(JSON.stringify(initInterval.fields));
  if (hour.length) {
    fields.hour = hour;
    fields.minute = [0];
    fields.second = [0];
  }
  if (dayOfWeek.length) {
    fields.dayOfWeek = dayOfWeek;
  }
  if (dayOfMonth.length) {
    fields.dayOfMonth = dayOfMonth;
  }
  const interval = parser.fieldsToExpression(fields);
  return interval.stringify();
};

export const getCronPlan = (values: string) => {
  const valuesArr = values?.split(' ');
  const cronString =
    valuesArr?.length === 6 && last(valuesArr) === 'L'
      ? [...initial(values), '7'].join(' ')
      : values;
  let interval = parser.parseExpression(cronString);
  const plan = [];
  for (let i = 0; i < 5; i++) {
    const next = interval.next();
    plan.push(getFormatDateTime(next.getTime()));
  }
  return plan;
};

const getCronLabel = (name: CronInputName, value: number | string) => {
  const [label] = cronLabelMap[name];
  // 周
  if (name === CronInputName.dayOfWeek) {
    let weekLabel = weekOptions?.find((item) => item.value === Number(value))?.label;
    // 特殊符号 # L 的处理
    if (charsReg.test(String(value))) {
      if ((value as string)?.indexOf('L') > -1) {
        if (value === 'L') {
          const [_value] = (value as string)?.split('L');
          weekLabel =
            weekOptions?.find((item) => item.value === Number(_value))?.label ??
            formatMessage({ id: 'odc.component.Crontab.utils.Sunday' }); //周日
          weekLabel =
            formatMessage({ id: 'odc.component.Crontab.utils.Weekly' }) + //每周
            weekLabel;
        } else {
          const [_value] = (value as string)?.split('L');
          weekLabel =
            weekOptions?.find((item) => item.value === Number(_value))?.label ??
            formatMessage({ id: 'odc.component.Crontab.utils.Sunday' }); //周日
          weekLabel =
            formatMessage({ id: 'odc.component.Crontab.utils.LastWeek' }) + //最后一周的
            weekLabel;
        }
      }
      if ((value as string)?.indexOf('#') > -1) {
        const [_value, _value2] = (value as string)?.split('#');
        weekLabel = weekOptions?.find((item) => item.value === Number(_value))?.label;
        weekLabel =
          formatMessage(
            {
              id: 'odc.component.Crontab.utils.WeekValue',
            },

            { value: _value2 },
          ) +
          //`第${_value2}周的`
          weekLabel;
      }
    }
    return weekLabel;
  }
  // 日
  if (name === CronInputName.dayOfMonth) {
    const dayLabel = charsReg.test(String(value))
      ? formatMessage({ id: 'odc.component.Crontab.utils.LastDayOfTheMonth' }) //本月最后一天
      : `${value} ${label}`;
    return dayLabel;
  }
  return `${value} ${label}`;
};

export const getCronExecuteCycleUnitByObject = (name: CronInputName, value: number[]) => {
  return value
    ?.sort((a, b) => a - b)
    ?.map((i) => getCronLabel(name, i))
    ?.join('、');
};

export const getCronExecuteCycleByObject = (
  type: CrontabDateType,
  value: {
    hour: number[];
    dayOfWeek: number[];
    dayOfMonth: number[];
  },
) => {
  const { hour, dayOfMonth, dayOfWeek } = value;
  const hourStr = getCronExecuteCycleUnitByObject(CronInputName.hour, hour);
  const dayOfMonthStr = getCronExecuteCycleUnitByObject(CronInputName.dayOfMonth, dayOfMonth);
  const dayOfWeekStr = getCronExecuteCycleUnitByObject(CronInputName.dayOfWeek, dayOfWeek);
  let cycleValue = [];
  if (type === CrontabDateType.daily) {
    cycleValue = [
      formatMessage({ id: 'odc.component.Crontab.utils.EveryDay' }), //每天
      hourStr,
    ];
  } else if (type === CrontabDateType.monthly) {
    cycleValue = [
      formatMessage({ id: 'odc.component.Crontab.utils.Monthly' }), //每月
      dayOfMonthStr,
      hourStr,
    ];
  } else if (type === CrontabDateType.weekly) {
    cycleValue = [
      formatMessage({ id: 'odc.component.Crontab.utils.Weekly' }), //每周
      dayOfWeekStr,
      hourStr,
    ];
  }
  return cycleValue?.join(' ');
};

export const getCronExecuteCycle = (cronString: string, fieldStrs: string[]) => {
  const [second, minute, hour, dayOfMonth, month, dayOfWeek] = cronString?.split(' ');
  const [secondStr, minuteStr, hourStr, dayOfMonthStr, monthStr, dayOfWeekStr] = fieldStrs;
  let cycleValue = [];
  if ([dayOfMonth, month, dayOfWeek].every((item) => reg?.test(item))) {
    // 每天
    cycleValue = [
      reg?.test(hour) ? '' : cronSpeedLabelMap[CRON_SPEED.daily],
      hourStr,
      minuteStr,
      secondStr,
    ].filter(Boolean);
  } else if ([dayOfMonth, month].every((item) => reg?.test(item)) && dayOfWeek !== '*') {
    if (!charsReg.test(dayOfWeek)) {
      // 每周
      cycleValue = [
        cronSpeedLabelMap[CRON_SPEED.weekly],
        dayOfWeekStr,
        hourStr,
        minuteStr,
        secondStr,
      ].filter(Boolean);
    } else {
      // 每月
      cycleValue = [
        cronSpeedLabelMap[CRON_SPEED.monthly],
        dayOfWeekStr,
        hourStr,
        minuteStr,
        secondStr,
      ].filter(Boolean);
    }
  } else if ([month].every((item) => reg?.test(item)) && !reg?.test(dayOfMonth)) {
    // 每月
    cycleValue = [
      cronSpeedLabelMap[CRON_SPEED.monthly],
      dayOfWeekStr,
      dayOfMonthStr,
      hourStr,
      minuteStr,
      secondStr,
    ].filter(Boolean);
  } else if (!reg?.test(month)) {
    // 每年
    cycleValue = [
      cronSpeedLabelMap[CRON_SPEED.yearly],
      monthStr,
      dayOfWeekStr,
      dayOfMonthStr,
      hourStr,
      minuteStr,
      secondStr,
    ].filter(Boolean);
  }
  return cycleValue?.join(' ');
};

class Node {
  name: string;
  value: string;
  min: number;
  max: number;
  interval: number;
  chars: string;

  constructor(options) {
    const { name, value, min, max, interval, chars } = options;
    this.name = name;
    this.value = value;
    this.min = min;
    this.max = max;
    this.interval = interval;
    this.chars = chars;
  }

  getValue = () => {
    const { getValue, ...rest } = this;
    return { ...rest };
  };
}

class Translator {
  mode;

  fields = {
    second: null,
    minute: null,
    hour: null,
    dayOfMonth: null,
    month: null,
    dayOfWeek: null,
  };

  value;

  parse = (
    value:
      | string
      | {
          hour: number[];
          dayOfWeek: number[];
          dayOfMonth: number[];
        },
  ) => {
    if (typeof value === 'string') {
      // 自定义
      this.mode = CrontabMode.custom;
      this.value = value;
      const tokens = value?.split(' ');
      tokens.forEach((token, i) => {
        const name = CronFieldKeys[i];
        const subTokens = token.split(',');
        const nodes = [];
        subTokens.forEach((subToken) => {
          const constraints = CronConstraints[i];
          let subTokenValue = subToken;
          let interval, min, max;
          // * ? 符号处理
          if (subTokenValue.indexOf('*') !== -1) {
            subTokenValue = subTokenValue.replace(/\*/g, constraints.min + '-' + constraints.max);
          } else if (subTokenValue.indexOf('?') !== -1) {
            subTokenValue = subTokenValue.replace(/\?/g, constraints.min + '-' + constraints.max);
          }
          // interval 处理
          if (subTokenValue.indexOf('/') !== -1) {
            const [_subTokenValue, _interval] = subTokenValue.split('/');
            subTokenValue = _subTokenValue;
            min = _subTokenValue;
            interval = Number(_interval);
          }
          // rang 处理
          if (subTokenValue.indexOf('-') !== -1) {
            const [_min, _max] = subTokenValue.split('-');
            (min = _min), (max = _max);
          }
          // chars 处理 ?
          nodes.push(
            new Node({
              name,
              value: subToken,
              min,
              max,
              interval,
              chars: null,
            }),
          );
        });
        this.fields[name] = nodes;
      });
    } else {
      // 默认模式
      // TODO: 下个版本统一
      this.mode = CrontabMode.default;
    }
    return this;
  };

  toLocaleString = () => {
    const fieldStrs = Object.entries(this.fields)?.map(([name, nodes]) => {
      const [label, stepLabel] = cronLabelMap[name];
      return nodes
        ?.map((node) => {
          let str = '';
          if (reg?.test(node.value)) {
            return;
          }
          if (node.interval) {
            if (node.min && node.max) {
              const begin = getCronLabel(name as CronInputName, node.min);
              const end = getCronLabel(name as CronInputName, node.max);
              const interval = node.interval;
              const unit = stepLabel ?? label;
              str = formatMessage(
                {
                  id: 'odc.component.Crontab.utils.BeginToEndEveryInterval',
                },
                { begin: begin, end: end, interval: interval, unit: unit },
              );

              //`${begin}至${end}每${interval}${unit}`
            } else {
              const begin = getCronLabel(name as CronInputName, node.min);
              const interval = node.interval;
              const unit = stepLabel ?? label;
              str = formatMessage(
                {
                  id: 'odc.component.Crontab.utils.BeginStartsEveryIntervalUnit',
                },
                { begin: begin, interval: interval, unit: unit },
              );

              //`${begin}开始 每${interval}${unit}`
            }
          } else if (node.min && node.max && !node.interval) {
            const begin = getCronLabel(name as CronInputName, node.min);
            const end = getCronLabel(name as CronInputName, node.max);
            str = formatMessage(
              {
                id: 'odc.component.Crontab.utils.BeginToEnd',
              },
              { begin: begin, end: end },
            );

            //`${begin}至${end}`
          } else {
            str = getCronLabel(name as CronInputName, node.value);
          }
          return str;
        })
        ?.join('、');
    });

    const localeString = getCronExecuteCycle(this.value, fieldStrs);
    return localeString;
  };
}

export default new Translator();
