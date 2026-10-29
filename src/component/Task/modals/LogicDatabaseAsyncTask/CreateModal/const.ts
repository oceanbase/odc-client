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
  delimiter: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.3AA56015',
        defaultMessage: '请输入分隔符',
      }),
    },
  ],
  timeoutMillis: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.5AF8C707',
        defaultMessage: '请输入超时时间',
      }),
    },
    {
      type: 'number',
      max: 480,
      message: formatMessage({
        id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.7BAA8D0E',
        defaultMessage: '最大不超过480小时',
      }),
    },
  ],
  sqlContentType: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.FED011D0',
        defaultMessage: '请选择 SQL 内容',
      }),
    },
  ],
  sqlContent: ({ required }) => {
    return [
      {
        required,
        message: formatMessage({
          id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.FD315879',
          defaultMessage: '请填写 SQL 内容',
        }),
      },
    ];
  },
};
