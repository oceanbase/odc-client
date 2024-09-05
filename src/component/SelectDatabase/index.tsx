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
import SessionSelect from '@/page/Workspace/components/SessionContextWrap/SessionSelect/SelectItem';
import { ModalStore } from '@/store/modal';
import { formatMessage } from '@/util/intl';
import { useRequest } from 'ahooks';
import { Form, Modal } from 'antd';
import { inject, observer } from 'mobx-react';

interface IProps {
  modalStore?: ModalStore;
}

function SelectModal({ modalStore }: IProps) {
  const onClose = () => {
    form.resetFields();
    modalStore.changeSelectDatabaseVisible(false);
  };
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
        defaultMessage: '选择数据源',
      })} /*选择数据源*/
      open={modalStore.selectDatabaseVisible}
      onCancel={onClose}
      onOk={async () => {
        const data = await form.validateFields();
        if (!data?.dataSourceId) {
          return;
        }
        await modalStore.selectDatabaseModalData?.onOk(data?.dataSourceId);
        modalStore.changeSelectDatabaseVisible(false);
        form.resetFields();
      }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name={'dataSourceId'}
          rules={[{ required: true }]}
          label={formatMessage({
            id: 'odc.component.SelectDatabase.component.DataSource',
            defaultMessage: '数据源',
          })} /*数据源*/
        >
          <SessionSelect
            datasourceMode={true}
            filters={
              modalStore?.selectDatabaseModalData?.features
                ? { feature: modalStore?.selectDatabaseModalData?.features }
                : null
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default inject('modalStore')(observer(SelectModal));
