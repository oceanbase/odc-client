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
import { Checkbox, Form, FormInstance, InputNumber, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less';
import ExecuteTimeoutSchedulingStrategy from '@/component/Schedule/components/ExecuteTimeoutSchedulingStrategy';

interface IProps {
  form: FormInstance<any>;
}
const TaskDurationItem: React.FC<IProps> = ({ form }) => {
  useEffect(() => {
    setTaskDuration(Boolean(form.getFieldValue('timeoutMillis')));
  }, [form.getFieldValue('timeoutMillis')]);

  const [hasTaskDuration, setTaskDuration] = useState<boolean>(false);
  return (
    <>
      <Form.Item
        extra={formatMessage({
          id: 'src.component.Task.component.TaskdurationItem.7B7A6912',
          defaultMessage: '任务启动指定时长后，若未完成则会暂停调度，等待下一次调度',
        })}
        style={{ marginBottom: hasTaskDuration ? 8 : 24 }}
      >
        <Checkbox checked={hasTaskDuration} onChange={(e) => setTaskDuration(e.target.checked)}>
          {formatMessage({
            id: 'src.component.Task.component.TaskdurationItem.4569BC79',
            defaultMessage: '指定任务时长',
          })}
        </Checkbox>
      </Form.Item>
      {hasTaskDuration && (
        <Space size={4} align="center" style={{ marginBottom: 24 }}>
          <Form.Item
            style={{
              marginBottom: 0,
            }}
            name="timeoutMillis"
            rules={[
              {
                validator: (_, value) =>
                  value > 0
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(
                          formatMessage({
                            id: 'src.component.Task.component.TaskdurationItem.90E3EDCE',
                            defaultMessage: '请输入时长 (值不小于0)',
                          }),
                        ),
                      ),
              },
            ]}
            initialValue={2}
          >
            <InputNumber
              min={0}
              controls={true}
              precision={1}
              className={styles.durationInputNumber}
            />
          </Form.Item>
          <span>
            {formatMessage({
              id: 'src.component.Task.component.TaskdurationItem.5C35A19A',
              defaultMessage: '小时',
            })}
          </span>
        </Space>
      )}
      {hasTaskDuration && <ExecuteTimeoutSchedulingStrategy />}
    </>
  );
};
export default TaskDurationItem;
