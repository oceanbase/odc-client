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
  tableName: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.src.component.Task.DataArchiveTask.CreateModal.PleaseSelectTheTable',
        defaultMessage: '请选择表',
      }), //'请选择表'
    },
  ],
  migrationInsertAction: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.src.component.Task.DataArchiveTask.CreateModal.PleaseSelectInsertionStrategy',
        defaultMessage: '请选择插入策略',
      }), //'请选择插入策略'
    },
  ],
  unit: ({ required }) => {
    return [
      {
        required,
        message: formatMessage({
          id: 'odc.src.component.Task.DataClearTask.CreateModal.PleaseChoose.1',
          defaultMessage: '请选择',
        }), //'请选择'
      },
    ];
  },
  operator: ({ required }) => {
    return [
      {
        required,
        message: formatMessage({
          id: 'odc.src.component.Task.DataClearTask.CreateModal.PleaseChoose',
          defaultMessage: '请选择',
        }), //'请选择'
      },
    ];
  },
  step: ({ required }) => {
    return [
      {
        required,
        message: formatMessage({
          id: 'odc.src.component.Task.DataClearTask.CreateModal.PleaseEnter',
          defaultMessage: '请输入',
        }), //'请输入'
      },
    ];
  },
};
