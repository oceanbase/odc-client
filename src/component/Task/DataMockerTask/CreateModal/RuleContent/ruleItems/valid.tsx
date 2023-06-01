import { compareNumber } from '@/util/bigNumber';
import { formatMessage } from '@/util/intl';
import { Rule } from 'antd/lib/form';
import { isNil } from 'lodash';

export function getRangeInputRules(isDate: boolean = false): Rule[] {
  return [
    {
      validator(rule, value, callback) {
        if (!value) {
          callback(
            formatMessage({
              id: 'odc.RuleContent.ruleItems.valid.TheValueMustBeSpecified',
            }),
            // 该值不能为空
          );
          return;
        }
        const start = value[0];
        const end = value[1];
        if (isNil(start)) {
          callback(
            formatMessage({
              id: 'odc.RuleContent.ruleItems.valid.TheStartValueMustBe.1',
            }), //起始值必须为数字类型且不为空
          );
          return;
        }
        if (isNil(end)) {
          callback(
            formatMessage({
              id: 'odc.RuleContent.ruleItems.valid.TheMaximumValueMustBe.1',
            }), //最大值必须为数字类型且不为空
          );
          return;
        }
        const compareResult = compareNumber(start, end);
        if (compareResult === 1 || (compareResult === 0 && isDate)) {
          callback(
            formatMessage({
              id: 'odc.RuleContent.ruleItems.valid.TheMaximumValueCannotBe',
            }),
            // 最大值不能小于或等于起始值
          );
          return;
        }
        callback();
      },
    },
  ];
}

export function getRequiredRules(): Rule[] {
  return [
    {
      required: true,
      message: formatMessage({
        id: 'odc.RuleContent.ruleItems.valid.TheValueMustBeSpecified',
      }),
      // 该值不能为空
    },
  ];
}
