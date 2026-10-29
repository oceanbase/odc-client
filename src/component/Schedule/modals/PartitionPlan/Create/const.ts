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
  errorStrategy: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.PartitionTask.CreateModal.6C651A64',
        defaultMessage: '请选择任务错误处理',
      }), //'请选择任务错误处理'
    },
  ],
  timeoutMillis: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.PartitionTask.CreateModal.05B817DF',
        defaultMessage: '请输入超时时间',
      }), //'请输入超时时间'
    },
    {
      type: 'number',
      max: 480,
      message: formatMessage({
        id: 'src.component.Task.PartitionTask.CreateModal.25D1BD6D',
        defaultMessage: '最大不超过480小时',
      }), //'最大不超过480小时'
    },
  ],
};
