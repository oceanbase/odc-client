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

export function checkNumberRange(min: number, max: number) {
  return (rule, value) => {
    const numberValue = parseInt(value);
    if (isNaN(numberValue)) {
      return Promise.reject(
        new Error(
          formatMessage({
            id: 'odc.src.util.valid.EnterAValidNumber',
            defaultMessage: '请输入有效的数字',
          }),
        ), //请输入有效的数字
      );
    } else if (numberValue < min || numberValue > max) {
      return Promise.reject(
        new Error(
          formatMessage(
            {
              id: 'odc.src.util.valid.EnterANumberBetweenMin',
              defaultMessage: '请输入 {min} ~ {max} 之间的数字',
            },
            { min, max },
          ),
        ), //`请输入 ${min} ~ ${max} 之间的数字`
      );
    }
    return Promise.resolve();
  };
}

export function validTrimEmptyWithWarn(msg) {
  return async (rule: any, value: string, callback: any) => {
    if (value?.trim()?.length !== value?.length) {
      return Promise.reject(new Error(msg));
    }
    callback();
  };
}

export function validTrimEmptyWithErrorWhenNeed(msg, needValid) {
  return async (rule: any, value: string) => {
    if (!needValid()) {
      return;
    }
    if (!value || !value.trim()) {
      throw new Error(msg);
    }
  };
}
