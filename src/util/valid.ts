import { formatMessage } from '@/util/intl';

export function checkNumberRange(min: number, max: number) {
  return (rule, value) => {
    const numberValue = parseInt(value);
    if (isNaN(numberValue)) {
      return Promise.reject(
        new Error(
          formatMessage({ id: 'odc.src.util.valid.EnterAValidNumber' }), //请输入有效的数字
        ),
      );
    } else if (numberValue < min || numberValue > max) {
      return Promise.reject(
        new Error(
          formatMessage(
            {
              id: 'odc.src.util.valid.EnterANumberBetweenMin',
            },
            { min: min, max: max },
          ), //`请输入 ${min} ~ ${max} 之间的数字`
        ),
      );
    }
    return Promise.resolve();
  };
}

export function validTrimEmptyWithWarn(msg) {
  return async (rule: any, value: string, callback: any) => {
    if (value?.trim()?.length !== value.length) {
      return Promise.reject(new Error(msg));
    }
    callback();
  };
}

export function validTrimEmptyWithErrorWhenNeed(msg, needValid) {
  return async (rule: any, value: string) => {
    if (!needValid()) {
      return;
    }
    if (!value || !value.trim()) {
      throw new Error(msg);
    }
  };
}
