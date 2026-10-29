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

import { formatMessage } from '@/util/intl';
import HelpDoc from '@/component/helpDoc';
import { MigrationInsertAction } from '@/d.ts';
import { timeUnitOptions } from './VariableConfig';

export enum PreCheckStatus {
  FAIL = 'FAIL',
  SUCCESS = 'SUCCESS',
}

export const InsertActionOptions = [
  {
    label: formatMessage({
      id: 'src.component.Schedule.modals.DataArchive.Create.43C7A315',
      defaultMessage: '重复时忽略插入',
    }),
    value: MigrationInsertAction.INSERT_IGNORE,
  },
  {
    label: formatMessage({
      id: 'src.component.Schedule.modals.DataArchive.Create.D77FF905',
      defaultMessage: '重复时更新目标表端数据',
    }),
    value: MigrationInsertAction.INSERT_DUPLICATE_UPDATE,
  },
];

export const cleanUpTimingOptions = [
  {
    label: (
      <div>
        {formatMessage({
          id: 'src.component.Schedule.modals.DataArchive.Create.C19360AA',
          defaultMessage: '归档完成后',
        })}

        <HelpDoc leftText isTip doc="TimingforCleanAfterArchive"></HelpDoc>
      </div>
    ),

    value: 'afterArchive',
  },

  {
    label: (
      <div>
        {formatMessage({
          id: 'src.component.Schedule.modals.DataArchive.Create.31FD789E',
          defaultMessage: '边归档边清理',
        })}

        <HelpDoc leftText isTip doc="TimingforCleanAfterCleanUp"></HelpDoc>
      </div>
    ),

    value: 'afterCleanUp',
  },
];

export const getVariables = (
  value: {
    name: string;
    format: string;
    pattern: {
      operator: string;
      step: number;
      unit: string;
    }[];
  }[],
) => {
  return value?.map(({ name, format, pattern }) => {
    let _pattern = null;
    try {
      _pattern = pattern
        ?.map((item) => {
          return `${item.operator}${item.step ?? 0}${item.unit}`;
        })
        ?.join(' ');
    } catch (error) {}
    return {
      name,
      pattern: `${format}|${_pattern}`,
    };
  });
};

export const variable = {
  name: '',
  format: '',
  pattern: [
    {
      operator: '',
      step: '',
      unit: '',
    },
  ],
};

export const getVariableValue = (
  value: {
    name: string;
    pattern: string;
  }[],
) => {
  var reg = /([+-])?(\d+)?(.+)?/;
  return value?.map(({ name, pattern }) => {
    const [format, _pattern] = pattern?.split('|');
    let patternValue = {
      operator: '',
      step: '',
      unit: '',
    };
    if (_pattern) {
      const res = _pattern?.match(reg);
      const operator = res[1] ?? '';
      const step = res[2] ?? '';
      const unit = timeUnitOptions.map((item) => item.value).includes(res[3]) ? res[3] : '';
      patternValue = {
        operator,
        step,
        unit,
      };
    }
    return {
      name,
      format,
      pattern: [patternValue],
    };
  });
};
