import BigNumber from 'bignumber.js';
import { isArray, toString } from 'lodash';
import moment, { isMoment } from 'moment';

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
  } else if (isMoment(value)) {
    return value.format(options?.showTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD');
  }
  return toString(value);
}
/**
 * 获取列表显示文字
 */
export function getTextItem(
  items: [string, string | typeof moment | any[]][],
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
export function disabledDateOfMock(currentDate: moment.Moment) {
  return currentDate?.valueOf?.() < 0;
}

/**
 * 获取时间的时区
 * 例如：GMT+0800
 */
export function getTimeZone(currentDate: moment.Moment) {
  const regexp = /GMT[+-]\d+/i;
  if (isMoment(currentDate)) {
    return regexp.exec(currentDate.toString())?.[0];
  }
  return regexp.exec(new Date().toString())?.[0];
}
