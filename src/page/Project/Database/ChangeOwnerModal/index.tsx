/* Copyright 2023 OceanBase
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

import { updateDataBaseOwner } from '@/common/network/database';
import { IDatabase } from '@/d.ts/database';
import { formatMessage } from '@/util/intl';
import { useRequest } from 'ahooks';
import { Form, message, Modal } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { DatabaseOwnerSelect } from '../components/DatabaseOwnerSelect.tsx';
import styles from '../index.less';

interface IProps {
  visible: boolean;
  database: IDatabase;
  close: () => void;
  onSuccess: () => void;
}

export default function ChangeOwnerModal({ visible, database, close, onSuccess }: IProps) {
  const [notSetAdmin, setNotSetAdmin] = useState(true);
  const { run: startUpdateDataBase, loading: saveOwnerLoading } = useRequest(updateDataBaseOwner, {
    manual: true,
  });

  const [form] = Form.useForm<{ ownerIds: number[] }>();

  /**
   * 提交按钮点击
   */
  const handleSubmitForm = useCallback(async () => {
    const value = await form.validateFields();
    const isSuccess = await startUpdateDataBase(
      [database?.id],
      database?.project?.id,
      value.ownerIds,
    );
    if (isSuccess) {
      message.success(
        formatMessage({
          id: 'src.page.Project.Database.ChangeOwnerModal.22191CF9',
          defaultMessage: '修改数据库管理员成功',
        }),
      );
      form.resetFields();
      close();
      onSuccess();
    }
  }, [form, startUpdateDataBase, database?.id, database?.project?.id, close, onSuccess]);

  const setFormOwnerIds = (value: number[]) => {
    form.setFieldsValue({
      ownerIds: value,
    });
  };
  useEffect(() => {
    if (visible) {
      const owner_ids = database?.owners?.map(({ id }) => id) || [];
      setFormOwnerIds(owner_ids);
      setNotSetAdmin(!owner_ids.length);
    }
  }, [database?.owners, form, visible]);

  return (
    <Modal
      maskClosable={false}
      title={formatMessage({
        id: 'src.page.Project.Database.ChangeOwnerModal.2EFFDBF5',
        defaultMessage: '设置库管理员',
      })}
      open={visible}
      confirmLoading={saveOwnerLoading}
      onCancel={() => {
        form.resetFields();
        close();
      }}
      onOk={handleSubmitForm}
      destroyOnClose
    >
      <Form requiredMark="optional" form={form} layout="vertical" className={styles.roleForm}>
        <Form.Item>
          {
            formatMessage({
              id: 'odc.Info.ChangeOwnerModal.DatabaseName',
              defaultMessage: '数据库名称：',
            }) /*数据库名称*/
          }

          {database?.name}
        </Form.Item>
        <DatabaseOwnerSelect
          notSetAdmin={notSetAdmin}
          setNotSetAdmin={setNotSetAdmin}
          ownerIds={form.getFieldValue('ownerIds')}
          setFormOwnerIds={setFormOwnerIds}
        />
      </Form>
    </Modal>
  );
}
