import { getColumnMaxValue } from '@/util/column';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import { CharRuleType } from './index';

export default function (ruleType: CharRuleType, maxLength?: string | number) {
  switch (ruleType) {
    case CharRuleType.NORMAL_TEXT: {
      return {
        genParams: {
          fixText: 'Hello'.slice(0, parseInt(maxLength + '') || 5),
        },
      };
    }
    case CharRuleType.RANDOM_TEXT: {
      return {
        range: [1, Math.min(parseInt(maxLength + ''), 1000)],
        genParams: {
          caseOption: 'ALL_LOWER_CASE',
        },
      };
    }
    case CharRuleType.REGEXP_TEXT: {
      return {
        genParams: {
          regText: 'Hello'.slice(0, parseInt(maxLength + '') || 5),
        },
      };
    }
    case CharRuleType.NORMAL_BOOL: {
      return {
        genParams: {
          fixText: 'TRUE',
        },
      };
    }
    case CharRuleType.NORMAL_DATE: {
      return {
        genParams: {
          timestamp: moment('1980-01-01'),
        },
      };
    }
    case CharRuleType.RANDOM_DATE: {
      return {
        range: [moment('1980-01-01'), moment('2060-01-01')],
      };
    }
    case CharRuleType.ORDER_DATE: {
      return {
        genParams: {
          step: 1,
          timeUnit: 'DAYS',
        },
        lowValue: moment('1980-01-01'),
        order: 'asc',
      };
    }
    case CharRuleType.NORMAL_NUMBER: {
      return {
        genParams: {
          fixNum: 0,
        },
      };
    }
    case CharRuleType.RANDOM_NUMBER: {
      return {
        range: ['0', BigNumber.min(getColumnMaxValue(maxLength, 0), '100000')],
      };
    }
    case CharRuleType.ORDER_NUMBER: {
      return {
        genParams: {
          step: 1,
        },
        order: 'asc',
        lowValue: '1',
      };
    }
    case CharRuleType.RANDOM_BOOL:
    case CharRuleType.NULL:
    case CharRuleType.SKIP: {
      return null;
    }
  }
}
