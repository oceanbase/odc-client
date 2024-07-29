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

import { Form, InputNumber, Space } from 'antd';
import React from 'react';
import HelpDoc from '@/component/helpDoc';
import setting from '@/store/setting';
interface IProps {
  initialValue?: {
    rowLimit?: number;
    dataSizeLimit?: number;
  };
}
const ThrottleFormItem: React.FC<IProps> = (props) => {
  const { initialValue } = props;
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
              <InputNumber min={0} precision={1} max={setting.maxSingleTaskRowLimit} />
            </Form.Item>
            <span>Rows/s</span>
          </Space>
        </Form.Item>
        <Form.Item
          label={
            <Space size={2}>
              <span>
                {
                  formatMessage({
                    id: 'odc.src.component.Task.component.ThrottleFormItem.DataSizeLimit',
                    defaultMessage: '数据大小限流',
                  }) /* 数据大小限流 */
                }
              </span>
              <HelpDoc leftText isTip doc="TaskLmitData" />
            </Space>
          }
          required
        >
          <Space size={4} align="center">
            <Form.Item
              name="dataSizeLimit"
              style={{
                marginBottom: 0,
              }}
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'odc.src.component.Task.component.ThrottleFormItem.PleaseLoseTheDataSize',
                    defaultMessage: '请输数据大小限流',
                  }), //'请输数据大小限流'
                },
              ]}
              initialValue={initialValue?.dataSizeLimit}
            >
              <InputNumber min={1} max={setting.maxSingleTaskDataSizeLimit} precision={1} />
            </Form.Item>
            <span>MB/s</span>
          </Space>
        </Form.Item>
      </Space>
    </Form.Item>
  );
};
export default ThrottleFormItem;
