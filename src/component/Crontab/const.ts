import { formatMessage } from '@/util/intl';
import { CrontabDateType, CrontabMode, IRuleTip } from './interface';
import { getAllFields, getAllHourValue } from './utils';

const hour = getAllHourValue();

export const fields = getAllFields();

export const initCronString = '0 0 0 * * ?'; // 默认每天 0 时

export const cronErrorMessage = formatMessage({
  id: 'odc.component.Crontab.const.CrontabIllegal',
}); //crontab 不合法
export const modeOptions = [
  {
    label: formatMessage({ id: 'odc.component.Crontab.const.DefaultMode' }), //默认模式
    value: CrontabMode.default,
  },

  {
    label: formatMessage({ id: 'odc.component.Crontab.const.CustomMode' }), //自定义模式
    value: CrontabMode.custom,
  },
];

export const weekOptions = [
  formatMessage({ id: 'odc.component.Crontab.const.Monday' }), //周一
  formatMessage({ id: 'odc.component.Crontab.const.Tuesday' }), //周二
  formatMessage({ id: 'odc.component.Crontab.const.Wednesday' }), //周三
  formatMessage({ id: 'odc.component.Crontab.const.Thursday' }), //周四
  formatMessage({ id: 'odc.component.Crontab.const.Friday' }), //周五
  formatMessage({ id: 'odc.component.Crontab.const.Saturday' }), //周六
  formatMessage({ id: 'odc.component.Crontab.const.Sunday' }), //周日
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
    label: formatMessage({ id: 'odc.component.Crontab.const.EveryDay' }), //每天
    value: CrontabDateType.daily,
  },

  {
    label: formatMessage({ id: 'odc.component.Crontab.const.Weekly' }), //每周
    value: CrontabDateType.weekly,
  },

  {
    label: formatMessage({ id: 'odc.component.Crontab.const.Monthly' }), //每月
    value: CrontabDateType.monthly,
  },
];

export const commonTip: IRuleTip = [
  [
    '*',
    formatMessage({ id: 'odc.component.Crontab.const.ArbitraryValue' }), //任意值
  ],
  [
    ',',
    formatMessage({
      id: 'odc.component.Crontab.const.DelimiterBetweenMultipleValues',
    }), //多个值之间的分隔符
  ],
  [
    '-',
    formatMessage({
      id: 'odc.component.Crontab.const.TheConnectorOfTheInterval',
    }), //区间值的连接符
  ],
  [
    '/',
    formatMessage({ id: 'odc.component.Crontab.const.AverageDistribution' }), //平均分配
  ],
];

const secondTip: IRuleTip = [
  ...commonTip,
  [
    '0-59',
    formatMessage({ id: 'odc.component.Crontab.const.AllowedRange' }), //允许范围
  ],
];
const minuteTip: IRuleTip = [
  ...commonTip,
  [
    '0-59',
    formatMessage({ id: 'odc.component.Crontab.const.AllowedRange' }), //允许范围
  ],
];
const hourTip: IRuleTip = [
  ...commonTip,
  [
    '0-23',
    formatMessage({ id: 'odc.component.Crontab.const.AllowedRange' }), //允许范围
  ],
];
const dayOfMonthTip: IRuleTip = [
  ...commonTip,
  [
    '?',
    formatMessage({ id: 'odc.component.Crontab.const.NotSpecified' }), //不指定
  ],
  [
    'L',
    formatMessage({ id: 'odc.component.Crontab.const.LastDayOfTheMonth' }), //本月最后一天
  ],
  [
    '1-31',
    formatMessage({ id: 'odc.component.Crontab.const.AllowedRange' }), //允许范围
  ],
];
const monthTip: IRuleTip = [
  ...commonTip,
  [
    '1-12',
    formatMessage({ id: 'odc.component.Crontab.const.AllowedRange' }), //允许范围
  ],
];
const dayOfWeekTip: IRuleTip = [
  ...commonTip,
  [
    '?',
    formatMessage({ id: 'odc.component.Crontab.const.NotSpecified' }), //不指定
  ],
  [
    'L',
    formatMessage({ id: 'odc.component.Crontab.const.ExampleLMondayOfThe' }), //例：1L(最后一周的周一)
  ],
  [
    '#',
    formatMessage({ id: 'odc.component.Crontab.const.ExampleMondayOfTheThird' }), //例：1#3(第三周的周一)
  ],
  [
    '1-7',
    formatMessage({ id: 'odc.component.Crontab.const.AllowedRange' }), //允许范围
  ],
];

export const cronRuleMap = {
  second: {
    label: formatMessage({ id: 'odc.component.Crontab.const.Seconds' }), //秒
    rule: /^[0-9\*\,\-\/]+$/,
    tip: secondTip,
    index: 0,
  },

  minute: {
    label: formatMessage({ id: 'odc.component.Crontab.const.Points' }), //分
    rule: /^[0-9\*\,\-\/]+$/,
    tip: minuteTip,
    index: 1,
  },

  hour: {
    label: formatMessage({ id: 'odc.component.Crontab.const.Time' }), //时
    rule: /^[0-9\*\,\-\/]+$/,
    tip: hourTip,
    index: 2,
  },

  dayOfMonth: {
    label: formatMessage({ id: 'odc.component.Crontab.const.Day' }), //日
    rule: /^[0-9\*\,\-\/\?LW]+$/,
    tip: dayOfMonthTip,
    index: 3,
  },

  month: {
    label: formatMessage({ id: 'odc.component.Crontab.const.Month' }), //月
    rule: /^[0-9\*\,\-\/]+$/,
    tip: monthTip,
    index: 4,
  },

  dayOfWeek: {
    label: formatMessage({ id: 'odc.component.Crontab.const.Zhou' }), //周
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
