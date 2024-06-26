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

import { TaskExecStrategy } from '@/d.ts';
import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { FieldTimeOutlined } from '@ant-design/icons';
import { DatePicker, Form, Radio } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import moment from 'moment';
import React from 'react';

interface IProps {
  isReadonlyPublicConn?: boolean;
}

const disabledDate: RangePickerProps['disabledDate'] = (current) => {
  return current && current < moment();
};

const TimerSelect: React.FC<IProps> = (props) => {
  const label = formatMessage({
    id: 'odc.components.TaskTimer.ExecutionMethodAfterTheApproval',
  });
  return (
    <>
      <Form.Item label={label} name="executionStrategy" required>
        <Radio.Group>
          <Radio value={TaskExecStrategy.AUTO}>
            {
              formatMessage({
                id: 'odc.components.TaskTimer.ExecuteNow',
              }) /*立即执行*/
            }
          </Radio>
          {!isClient() ? (
            <Radio value={TaskExecStrategy.TIMER}>
              {
                formatMessage({
                  id: 'odc.components.TaskTimer.ScheduledExecution',
                }) /*定时执行*/
              }
            </Radio>
          ) : null}
          <Radio value={TaskExecStrategy.MANUAL}>
            {
              formatMessage({
                id: 'odc.components.TaskTimer.ManualExecution',
              }) /*手动执行*/
            }
          </Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item noStyle shouldUpdate>
        {({ getFieldValue }) => {
          const strategy = getFieldValue('executionStrategy');
          return (
            strategy === TaskExecStrategy.TIMER && (
              <Form.Item
                name="executionTime"
                label={formatMessage({
                  id: 'odc.components.TaskTimer.ExecutionTime',
                })} /*执行时间*/
                rules={[
                  {
                    required: true,
                    message: formatMessage({
                      id: 'odc.components.TaskTimer.SelectAnExecutionTime',
                    }), //请选择执行时间
                  },
                ]}
                extra={
                  formatMessage({
                    id: 'odc.components.TaskTimer.IfTheApprovalIsNot',
                  }) //若执行时间前未完成审批，则任务将终止不执行
                }
              >
                <DatePicker
                  disabledDate={disabledDate}
                  showTime
                  suffixIcon={<FieldTimeOutlined />}
                />
              </Form.Item>
            )
          );
        }}
      </Form.Item>
    </>
  );
};

export default TimerSelect;
