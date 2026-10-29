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

export const rules = {
  name: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.CreateShadowSyncModal.SelectPanel.EnterAShadowTableName',
        defaultMessage: '请输入影子表名',
      }),

      //请输入影子表名
    },
    {
      pattern: /^[\w]*$/,
      message: formatMessage({
        id: 'odc.CreateShadowSyncModal.SelectPanel.OnlyEnglishNumbersAndUnderscores',
        defaultMessage: '仅支持英文/数字/下划线',
      }),

      //仅支持英文/数字/下划线
    },
    {
      max: 32,
      message: formatMessage({
        id: 'odc.CreateShadowSyncModal.SelectPanel.NoMoreThanCharacters',
        defaultMessage: '不超过 32 个字符',
      }),

      //不超过 32 个字符
    },
  ],
  errorStrategy: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.components.CreateAsyncTaskModal.SelectTaskErrorHandling',
        defaultMessage: '请选择任务错误处理',
      }),

      // 请选择任务错误处理
    },
  ],
};
