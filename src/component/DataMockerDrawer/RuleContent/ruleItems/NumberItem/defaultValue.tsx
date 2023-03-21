import { IColumnSizeValue } from '@/d.ts';
import BigNumber from 'bignumber.js';
import { NumberRuleType } from './index';

export default function (ruleType: NumberRuleType, size: IColumnSizeValue) {
  let maxSize: string | number = size as number;
  if (typeof size !== 'number') {
    const { maxValue } = size;
    maxSize = maxValue;
  }

  switch (ruleType) {
    case NumberRuleType.NORMAL: {
      return {
        genParams: {
          fixNum: '0',
        },
      };
    }
    case NumberRuleType.ORDER: {
      return {
        genParams: {
          step: '1',
        },
        lowValue: '1',
        order: 'asc',
      };
    }
    case NumberRuleType.RANDOM: {
      return {
        range: ['0', BigNumber.min(maxSize, '100000')],
      };
    }
    case NumberRuleType.NULL: {
      return null;
    }
    case NumberRuleType.SKIP: {
      return null;
    }
  }
}
