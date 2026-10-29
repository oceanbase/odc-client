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
import { CronInputName, CrontabDateType, CrontabMode, IRuleTip } from './interface';
import { getAllHourValue } from './utils';

const hour = getAllHourValue();

export const fields = [
  CronInputName.second,
  CronInputName.minute,
  CronInputName.hour,
  CronInputName.dayOfMonth,
  CronInputName.month,
  CronInputName.dayOfWeek,
];
export const initCronString = '0 0 0 * * ?'; // 默认每天 0 时

export const cronErrorMessage = formatMessage({
  id: 'odc.component.Crontab.const.CrontabIllegal',
  defaultMessage: 'crontab 不合法',
}); //crontab 不合法
export const modeOptions = [
  {
    label: formatMessage({
      id: 'odc.component.Crontab.const.DefaultMode',
      defaultMessage: '默认模式',
    }), //默认模式
    value: CrontabMode.default,
  },

  {
    label: formatMessage({
      id: 'odc.component.Crontab.const.CustomMode',
      defaultMessage: '自定义模式',
    }), //自定义模式
    value: CrontabMode.custom,
  },
];

export const weekOptions = [
  formatMessage({ id: 'odc.component.Crontab.const.Monday', defaultMessage: '周一' }), //周一
  formatMessage({ id: 'odc.component.Crontab.const.Tuesday', defaultMessage: '周二' }), //周二
  formatMessage({ id: 'odc.component.Crontab.const.Wednesday', defaultMessage: '周三' }), //周三
  formatMessage({ id: 'odc.component.Crontab.const.Thursday', defaultMessage: '周四' }), //周四
  formatMessage({ id: 'odc.component.Crontab.const.Friday', defaultMessage: '周五' }), //周五
  formatMessage({ id: 'odc.component.Crontab.const.Saturday', defaultMessage: '周六' }), //周六
  formatMessage({ id: 'odc.component.Crontab.const.Sunday', defaultMessage: '周日' }), //周日
].map((item, i) => {
  return { label: item, value: i + 1 };
});

export const hourOptions = hour.map((item, i) => {
  return {
    label: `${i}: 00`,
    value: i,
  };
});

export const dayOptions = Array(31)
  .fill(0)
  .map((item, i) => {
    return {
      label: i + 1,
      value: i + 1,
    };
  });

export const dateOptions = [
  {
    label: formatMessage({ id: 'odc.component.Crontab.const.EveryDay', defaultMessage: '每天' }), //每天
    value: CrontabDateType.daily,
  },

  {
    label: formatMessage({ id: 'odc.component.Crontab.const.Weekly', defaultMessage: '每周' }), //每周
    value: CrontabDateType.weekly,
  },

  {
    label: formatMessage({ id: 'odc.component.Crontab.const.Monthly', defaultMessage: '每月' }), //每月
    value: CrontabDateType.monthly,
  },
];

export const commonTip: IRuleTip = [
  [
    '*',
    formatMessage({ id: 'odc.component.Crontab.const.ArbitraryValue', defaultMessage: '任意值' }), //任意值
  ],
  [
    ',',
    formatMessage({
      id: 'odc.component.Crontab.const.DelimiterBetweenMultipleValues',
      defaultMessage: '多个值之间的分隔符',
    }), //多个值之间的分隔符
  ],
  [
    '-',
    formatMessage({
      id: 'odc.component.Crontab.const.TheConnectorOfTheInterval',
      defaultMessage: '区间值的连接符',
    }), //区间值的连接符
  ],
  [
    '/',
    formatMessage({
      id: 'odc.component.Crontab.const.AverageDistribution',
      defaultMessage: '平均分配',
    }), //平均分配
  ],
];

const secondTip: IRuleTip = [
  ...commonTip,
  [
    '0-59',
    formatMessage({ id: 'odc.component.Crontab.const.AllowedRange', defaultMessage: '允许范围' }), //允许范围
  ],
];

const minuteTip: IRuleTip = [
  ...commonTip,
  [
    '0-59',
    formatMessage({ id: 'odc.component.Crontab.const.AllowedRange', defaultMessage: '允许范围' }), //允许范围
  ],
];

const hourTip: IRuleTip = [
  ...commonTip,
  [
    '0-23',
    formatMessage({ id: 'odc.component.Crontab.const.AllowedRange', defaultMessage: '允许范围' }), //允许范围
  ],
];

const dayOfMonthTip: IRuleTip = [
  ...commonTip,
  [
    '?',
    formatMessage({ id: 'odc.component.Crontab.const.NotSpecified', defaultMessage: '不指定' }), //不指定
  ],
  [
    'L',
    formatMessage({
      id: 'odc.component.Crontab.const.LastDayOfTheMonth',
      defaultMessage: '本月最后一天',
    }), //本月最后一天
  ],
  [
    '1-31',
    formatMessage({ id: 'odc.component.Crontab.const.AllowedRange', defaultMessage: '允许范围' }), //允许范围
  ],
];

const monthTip: IRuleTip = [
  ...commonTip,
  [
    '1-12',
    formatMessage({ id: 'odc.component.Crontab.const.AllowedRange', defaultMessage: '允许范围' }), //允许范围
  ],
];

const dayOfWeekTip: IRuleTip = [
  ...commonTip,
  [
    '?',
    formatMessage({ id: 'odc.component.Crontab.const.NotSpecified', defaultMessage: '不指定' }), //不指定
  ],
  [
    'L',
    formatMessage({
      id: 'odc.component.Crontab.const.ExampleLMondayOfThe',
      defaultMessage: '例：1L（最后一周的周一）',
    }), //例：1L(最后一周的周一)
  ],
  [
    '#',
    formatMessage({
      id: 'odc.component.Crontab.const.ExampleMondayOfTheThird',
      defaultMessage: '例：1#3(第三周的周一)',
    }), //例：1#3(第三周的周一)
  ],
  [
    '1-7',
    formatMessage({ id: 'odc.component.Crontab.const.AllowedRange', defaultMessage: '允许范围' }), //允许范围
  ],
];

export const cronRuleMap = {
  second: {
    label: formatMessage({ id: 'odc.component.Crontab.const.Seconds', defaultMessage: '秒' }), //秒
    rule: /^[0-9\*\,\-\/]+$/,
    tip: secondTip,
    index: 0,
  },

  minute: {
    label: formatMessage({ id: 'odc.component.Crontab.const.Points', defaultMessage: '分' }), //分
    rule: /^[0-9\*\,\-\/]+$/,
    tip: minuteTip,
    index: 1,
  },

  hour: {
    label: formatMessage({ id: 'odc.component.Crontab.const.Time', defaultMessage: '时' }), //时
    rule: /^[0-9\*\,\-\/]+$/,
    tip: hourTip,
    index: 2,
  },

  dayOfMonth: {
    label: formatMessage({ id: 'odc.component.Crontab.const.Day', defaultMessage: '日' }), //日
    rule: /^[0-9\*\,\-\/\?LW]+$/,
    tip: dayOfMonthTip,
    index: 3,
  },

  month: {
    label: formatMessage({ id: 'odc.component.Crontab.const.Month', defaultMessage: '月' }), //月
    rule: /^[0-9\*\,\-\/]+$/,
    tip: monthTip,
    index: 4,
  },

  dayOfWeek: {
    label: formatMessage({ id: 'odc.component.Crontab.const.Zhou', defaultMessage: '周' }), //周
    rule: /^[1-7\*\,\-\/\?L\#]+$/,
    tip: dayOfWeekTip,
    index: 5,
  },
};

export const defaultQuickValueMap = {
  [CrontabMode.default]: {
    Hourly: {
      dateType: CrontabDateType.daily,
      dayOfMonth: [],
      dayOfWeek: [],
      hour,
    },

    Nightly: {
      dateType: CrontabDateType.daily,
      dayOfMonth: [],
      dayOfWeek: [],
      hour: [23],
    },

    Fridays: {
      dateType: CrontabDateType.weekly,
      dayOfMonth: [],
      dayOfWeek: [5],
      hour: [23],
    },
  },

  [CrontabMode.custom]: {
    Hourly: {
      cronString: '0 0 0-23 * * ?', // 每天
    },
    Nightly: {
      cronString: '0 0 23 * * ?', // 每晚
    },
    Fridays: {
      cronString: '0 0 23 ? * 5', // 每周五
    },
  },
};

// 0-59 /\b([0-9]|[1-5][0-9])\b/
// 0-23 /\b([0-2]|[1-2][0-3])\b/
// 1-31 /\b([1-9]|[1-2][0-9]|[3][0-1])\b/
// 1-12 /\b([1-9]|[1][0-2])\b/
// 1-7 /\b([1-7])\b/
