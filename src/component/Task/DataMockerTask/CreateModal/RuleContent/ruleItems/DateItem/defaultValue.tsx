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

import dayjs from 'dayjs';
import { DateRuleType } from './index';

export default function (ruleType: DateRuleType) {
  switch (ruleType) {
    case DateRuleType.NORMAL: {
      return {
        genParams: {
          timestamp: dayjs('1980-01-01'),
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
        lowValue: dayjs('1980-01-01'),
      };
    }
    case DateRuleType.RANDOM: {
      return {
        range: [dayjs('1980-01-01'), dayjs('2060-01-01')],
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
