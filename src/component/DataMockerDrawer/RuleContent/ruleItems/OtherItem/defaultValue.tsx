import { OtherRuleType } from './index';

export default function (ruleType: OtherRuleType) {
  switch (ruleType) {
    case OtherRuleType.NULL:
    case OtherRuleType.SKIP: {
      return null;
    }
  }
}
