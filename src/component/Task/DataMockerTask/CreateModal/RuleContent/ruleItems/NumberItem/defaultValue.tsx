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
