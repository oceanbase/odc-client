import { formatMessage } from '@/util/intl';
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

import HelpDoc from '@/component/helpDoc';
import setting from '@/store/setting';
import { Form, InputNumber, Space } from 'antd';
import React from 'react';
interface IProps {
  initialValue?: {
    rowLimit?: number;
    dataSizeLimit?: number;
  };
  maxRowLimit?: number;
  maxDataSizeLimit?: number;
}
const ThrottleFormItem: React.FC<IProps> = (props) => {
  const {
    initialValue,
    maxRowLimit = setting.maxSingleTaskRowLimit,
    maxDataSizeLimit = setting.maxSingleTaskDataSizeLimit,
  } = props;
  return (
    <Form.Item
      label={
        formatMessage({
          id: 'odc.src.component.Task.component.ThrottleFormItem.StreamingStrategy',
          defaultMessage: '限流策略',
        }) /* 限流策略 */
      }
      required
    >
      <Space size={12}>
        <Form.Item
          label={
            <Space size={2}>
              <span>
                {
                  formatMessage({
                    id: 'odc.src.component.Task.component.ThrottleFormItem.RestrictedFlow',
                    defaultMessage: '行限流',
                  }) /* 行限流 */
                }
              </span>
              <HelpDoc leftText isTip doc="TaskLmitRow" />
            </Space>
          }
          required
        >
          <Space size={4} align="center">
            <Form.Item
              name="rowLimit"
              style={{
                marginBottom: 0,
              }}
              initialValue={initialValue?.rowLimit}
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'odc.src.component.Task.component.ThrottleFormItem.PleaseImportTheBobbyFlow',
                    defaultMessage: '请输行限流限流',
                  }), //'请输行限流限流'
                },
              ]}
            >
              <InputNumber min={0} precision={1} max={maxRowLimit} />
            </Form.Item>
            <span>Rows/s</span>
          </Space>
        </Form.Item>
      </Space>
    </Form.Item>
  );
};
export default ThrottleFormItem;
