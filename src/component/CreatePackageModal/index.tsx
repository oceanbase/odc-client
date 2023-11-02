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

import { getPackageCreateSQL } from '@/common/network';
import { openCreatePackagePage } from '@/store/helper/page';
import { ModalStore } from '@/store/modal';
import { useDBSession } from '@/store/sessionManager/hooks';
import { formatMessage } from '@/util/intl';
import { Form, Input, Modal } from 'antd';
import { inject, observer } from 'mobx-react';

interface IProps {
  modalStore?: ModalStore;
}

export enum CheckOption {
  NONE = 'NONE',
}

function CreatePackageModal(props: IProps) {
  const { modalStore } = props;
  const { databaseId, dbName } = modalStore.createPackageModalData;
  const initialValues = {
    packageName: null,
  };

  const [formRef] = Form.useForm();

  const { session } = useDBSession(databaseId);

  const save = () => {
    const { modalStore } = props;
    formRef
      .validateFields()
      .then(async (data) => {
        const packageName = data?.packageName;
        const sql = await getPackageCreateSQL(packageName, session?.sessionId, dbName);
        openCreatePackagePage(sql, databaseId, dbName);
        modalStore.changeCreatePackageModalVisible(false);
      })
      .catch((error) => {
        console.error(JSON.stringify(error));
      });
  };

  return (
    <Modal
      centered={true}
      width={600}
      destroyOnClose={true}
      title={formatMessage({
        id: 'workspace.window.createPackage.modal.title',
      })}
      open={modalStore.createPackageModalVisible}
      okText={formatMessage({
        id: 'odc.component.CreatePackageModal.NextConfirmTheSqlStatement',
      })} /* 下一步：确认 SQL */
      onOk={save}
      onCancel={() => {
        modalStore.changeCreatePackageModalVisible(false);
      }}
    >
      <Form
        layout="vertical"
        requiredMark={'optional'}
        initialValues={initialValues}
        form={formRef}
      >
        <Form.Item
          name="packageName"
          label={formatMessage({
            id: 'workspace.window.createPackage.packageName',
          })}
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'workspace.window.createPackage.packageName.required',
              }),
            },
          ]}
        >
          <Input
            // eslint-disable-next-line
            autoComplete={'off'}
            placeholder={formatMessage({
              id: 'workspace.window.createPackage.packageName.placeholder',
            })}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default inject('modalStore')(observer(CreatePackageModal));
