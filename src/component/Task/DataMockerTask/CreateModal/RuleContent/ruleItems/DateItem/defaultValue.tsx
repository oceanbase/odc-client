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
