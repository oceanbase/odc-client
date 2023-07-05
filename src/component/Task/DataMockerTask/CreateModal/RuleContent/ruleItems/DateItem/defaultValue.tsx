import moment from 'moment';
import { DateRuleType } from './index';

export default function (ruleType: DateRuleType) {
  switch (ruleType) {
    case DateRuleType.NORMAL: {
      return {
        genParams: {
          timestamp: moment('1980-01-01'),
        },
      };
    }
    case DateRuleType.ORDER: {
      return {
        genParams: {
          step: 1,
          timeUnit: 'DAYS',
        },
        order: 'asc',
        lowValue: moment('1980-01-01'),
      };
    }
    case DateRuleType.RANDOM: {
      return {
        range: [moment('1980-01-01'), moment('2060-01-01')],
      };
    }
    case DateRuleType.NULL: {
      return null;
    }
    case DateRuleType.SKIP: {
      return null;
    }
  }
}
