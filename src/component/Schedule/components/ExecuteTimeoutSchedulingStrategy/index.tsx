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
import { Form, Radio, Space } from 'antd';
import HelpDoc from '@/component/helpDoc';

export const executeTimeoutStrategyOptions = [
  {
    label: formatMessage({
      id: 'src.component.Schedule.components.ExecuteTimeoutSchedulingStrategy.E60DE59D',
      defaultMessage: '忽略当前超时任务，发起新任务',
    }),
    value: true,
  },
  {
    label: formatMessage({
      id: 'src.component.Schedule.components.ExecuteTimeoutSchedulingStrategy.C7F59CD6',
      defaultMessage: '重启当前超时任务',
    }),
    value: false,
  },
];

const ExecuteTimeoutSchedulingStrategy = () => {
  return (
    <Form.Item
      label={
        <>
          <span>
            {formatMessage({
              id: 'src.component.Schedule.components.ExecuteTimeoutSchedulingStrategy.2CDAB267',
              defaultMessage: '执行超时调度策略',
            })}
          </span>
          <HelpDoc leftText isTip doc="ExecutionTimeoutSchedulingStrategy"></HelpDoc>
        </>
      }
      name="scheduleIgnoreTimeoutTask"
      required
    >
      <Radio.Group options={executeTimeoutStrategyOptions} />
    </Form.Item>
  );
};

export default ExecuteTimeoutSchedulingStrategy;
