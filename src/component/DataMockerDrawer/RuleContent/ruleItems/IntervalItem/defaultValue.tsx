import { IntervalRuleType } from './index';

export default function (ruleType: IntervalRuleType, isTime: boolean) {
  switch (ruleType) {
    case IntervalRuleType.NORMAL: {
      return {
        genParams: {
          fixText: isTime
            ? "INTERVAL '01 00:00:00' DAY TO SECOND"
            : "INTERVAL '80-1' YEAR TO MONTH",
        },
      };
    }
    case IntervalRuleType.SKIP: {
      return null;
    }
  }
}
