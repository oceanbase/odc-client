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

import { getConnectionList } from '@/common/network/connection';
import { ConnectType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { useRequest } from 'ahooks';
import { Form, Modal, Select } from 'antd';

interface IProps {
  open: boolean;
  isSupport?: (type: ConnectType) => boolean;
  onOk: (v: number) => void;
  onClose: () => void;
}

export default function SelectModal({ open, onOk, onClose, isSupport }: IProps) {
  const { data, loading } = useRequest(getConnectionList, {
    defaultParams: [
      {
        page: 1,
        size: 9999,
        minPrivilege: 'update',
      },
    ],
  });
  const [form] = Form.useForm<{ dataSourceId: number }>();

  return (
    <Modal
      title={formatMessage({
        id: 'odc.component.SelectDatabase.component.SelectADataSource',
      })} /*选择数据源*/
      open={open}
      onCancel={onClose}
      onOk={async () => {
        const data = await form.validateFields();
        if (!data?.dataSourceId) {
          return;
        }
        onOk(data?.dataSourceId);
      }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name={'dataSourceId'}
          rules={[{ required: true }]}
          label={formatMessage({
            id: 'odc.component.SelectDatabase.component.DataSource',
          })} /*数据源*/
        >
          <Select
            showSearch
            optionFilterProp="children"
            loading={loading}
            placeholder={formatMessage({
              id: 'odc.component.SelectDatabase.component.PleaseSelect',
            })} /*请选择*/
            style={{ width: 320 }}
          >
            {data?.contents
              ?.map((item) => {
                const support = isSupport ? isSupport?.(item?.type) : true;
                if (!support) {
                  return null;
                }
                return (
                  <Select.Option value={item.id} key={item.id}>
                    {item.name}
                  </Select.Option>
                );
              })
              .filter(Boolean)}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
