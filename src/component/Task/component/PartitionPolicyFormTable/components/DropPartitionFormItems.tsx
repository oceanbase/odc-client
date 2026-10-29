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

import FormItemPanel from '@/component/FormItemPanel';
import HelpDoc from '@/component/helpDoc';
import { formatMessage } from '@/util/intl';
import { Form, InputNumber, Radio, Space } from 'antd';
import { rules } from '../const';

const DropPatitionFormItems = () => {
  return (
    <FormItemPanel
      keepExpand
      label={
        formatMessage({
          id: 'src.component.Task.component.PartitionPolicyFormTable.40F7E641',
          defaultMessage: '删除分区',
        }) /*"删除分区"*/
      }
    >
      <Space size={40} align="start">
        <Form.Item
          required
          name="keepLatestCount"
          label={
            <HelpDoc doc="partitionKeepLatestCount" leftText>
              {
                formatMessage({
                  id: 'src.component.Task.component.PartitionPolicyFormTable.7D6F23AE' /*分区保留数量*/,
                  defaultMessage: '分区保留数量',
                }) /* 分区保留数量 */
              }
            </HelpDoc>
          }
          rules={rules.keepLatestCount}
        >
          <InputNumber
            placeholder={
              formatMessage({
                id: 'src.component.Task.component.PartitionPolicyFormTable.94B98AF7',
                defaultMessage: '请输入',
              }) /*"请输入"*/
            }
            min={0}
            style={{ width: 100 }}
          />
        </Form.Item>
        <Form.Item
          required
          name="reloadIndexes"
          label={
            formatMessage({
              id: 'src.component.Task.component.PartitionPolicyFormTable.3C92777E',
              defaultMessage: '删除后是否重建索引',
            }) /*"删除后是否重建索引"*/
          }
          rules={rules.reloadIndexes}
        >
          <Radio.Group
            options={[
              {
                value: true,
                label: formatMessage({
                  id: 'src.component.Task.component.PartitionPolicyFormTable.77C8BE4D' /*是*/,
                  defaultMessage: '是',
                }) /* 是 */,
              },
              {
                value: false,
                label: formatMessage({
                  id: 'src.component.Task.component.PartitionPolicyFormTable.E374E7C8' /*否*/,
                  defaultMessage: '否',
                }) /* 否 */,
              },
            ]}
          />
        </Form.Item>
      </Space>
    </FormItemPanel>
  );
};

export default DropPatitionFormItems;
