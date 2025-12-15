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
import { FormInstance } from 'antd';
import { convertCronToMinutes } from '@/component/Crontab/utils';
import { ICrontab } from '@/component/Crontab/interface';
import setting from '@/store/setting';

export const ChineseAndEnglishAndNumberAndUnderline = {
  pattern: /^[\w\u4e00-\u9fa5]*$/,
  message: formatMessage({
    id: 'odc.src.util.validRule.OnlyAllowInputChinese',
    defaultMessage: '只允许输入中文，字母，数字与下划线',
  }), //'只允许输入中文，字母，数字与下划线'
};
export const Required = {
  required: true,
};

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

/**
 * 校验 crontab 调度间隔是否符合最小间隔要求
 * @param crontab - crontab 配置对象
 * @param form - Ant Design 表单实例
 * @param fieldName - 要设置错误的字段名，默认为 'crontab'
 * @param clearErrorOnSuccess - 校验通过时是否清除错误，默认为 true
 * @returns 校验是否通过
 */
export function validateCrontabInterval(
  crontab: ICrontab | null,
  form: FormInstance,
  fieldName: string = 'crontab',
): boolean {
  if (!crontab?.cronString) {
    return true;
  }

  const intervalMinutes = convertCronToMinutes(crontab.cronString);
  const minSchedulingIntervalMinutes =
    setting?.spaceConfigurations?.['odc.schedule.minSchedulingIntervalMinutes'];
  const limit = Number(minSchedulingIntervalMinutes);

  if (intervalMinutes && minSchedulingIntervalMinutes && intervalMinutes < limit) {
    form.setFields([
      {
        name: fieldName,
        errors: [
          formatMessage(
            { id: 'src.util.0BB62F3F', defaultMessage: '作业任务最小调度间隔不小于 {limit} 分钟' },
            { limit },
          ),
        ],
      },
    ]);
    return false;
  }

  form.setFields([
    {
      name: fieldName,
      errors: [],
    },
  ]);

  return true;
}
