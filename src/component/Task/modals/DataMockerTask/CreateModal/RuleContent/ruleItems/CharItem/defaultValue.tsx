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

import { getColumnMaxValue } from '@/util/database/column';
import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
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
          timestamp: dayjs('1980-01-01'),
        },
      };
    }
    case CharRuleType.RANDOM_DATE: {
      return {
        range: [dayjs('1980-01-01'), dayjs('2060-01-01')],
      };
    }
    case CharRuleType.ORDER_DATE: {
      return {
        genParams: {
          step: 1,
          timeUnit: 'DAYS',
        },
        lowValue: dayjs('1980-01-01'),
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
