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
              defaultMessage: '该值不能为空',
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
              defaultMessage: '起始值必须为数字类型且不为空',
            }), //起始值必须为数字类型且不为空
          );
          return;
        }
        if (isNil(end)) {
          callback(
            formatMessage({
              id: 'odc.RuleContent.ruleItems.valid.TheMaximumValueMustBe.1',
              defaultMessage: '最大值必须为数字类型且不为空',
            }), //最大值必须为数字类型且不为空
          );
          return;
        }
        const compareResult = compareNumber(start, end);
        if (compareResult === 1 || (compareResult === 0 && isDate)) {
          callback(
            formatMessage({
              id: 'odc.RuleContent.ruleItems.valid.TheMaximumValueCannotBe',
              defaultMessage: '最大值需大于起始值',
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
        defaultMessage: '该值不能为空',
      }),
      // 该值不能为空
    },
  ];
}
