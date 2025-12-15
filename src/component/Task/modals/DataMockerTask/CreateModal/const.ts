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
import { Rule } from 'antd/es/form';

export const rules = {
  tableName: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.component.DataMockerDrawer.form.SelectATable',
        defaultMessage: '请选择表',
      }),

      // 请选择表
    },
  ],
  batchSize: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.component.DataMockerDrawer.form.EnterTheBatchSize',
        defaultMessage: '请输入批处理大小',
      }),

      // 请输入批处理大小
    },
    {
      max: 1000,
      message: formatMessage({
        id: 'odc.component.DataMockerDrawer.form.TheBatchSizeCannotExceed',
        defaultMessage: '批处理大小不能超过 1000',
      }),

      // 批处理大小不能超过 1000
      type: 'number',
    },
  ],
  columnsRule: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.component.DataMockerDrawer.RuleConfigTable.SelectARule',
        defaultMessage: '请选择规则',
      }), // 请选择规则
    },
  ],
  totalCount: ({ maxMockLimit }): Rule[] => {
    return [
      {
        required: true,
        message: formatMessage({
          id: 'odc.component.DataMockerDrawer.form.EnterTheSimulatedDataVolume',
          defaultMessage: '请输入模拟数据量',
        }),

        // 请输入模拟数据量
      },
      {
        max: maxMockLimit,
        type: 'number',
      },
    ];
  },
};
