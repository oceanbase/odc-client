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
import { DB_OWNER_MAX_COUNT } from '@/page/Project/Database/const';
import { formatMessage } from '@/util/intl';
import { useRequest } from 'ahooks';
import { Form, Modal, Select, message } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import ProjectContext from '../../ProjectContext';

interface IProps {
  visible: boolean;
  database: IDatabase;
  close: () => void;
  onSuccess: () => void;
  maxOwnerCount?: number;
}

export default function ChangeOwnerModal({
  visible,
  database,
  close,
  onSuccess,
  maxOwnerCount = DB_OWNER_MAX_COUNT,
}: IProps) {
  const { project } = useContext(ProjectContext);

  const { run: startUpdateDataBase, loading: saveOwnerLoading } = useRequest(updateDataBaseOwner, {
    manual: true,
  });

  const [form] = Form.useForm<{ ownerIds: number[] }>();
  /**
   * 存储当前选择的数据的的负责人
   * 目前用于限制负责人的个数
   */
  const [ownerIds, setOwnerIds] = useState<number[]>([]);
  /**
   *  去重后的项目成员作为库Owner的可选项
   */
  const projectUserOptions: DefaultOptionType[] = useMemo(() => {
    const userMap = new Map<number, DefaultOptionType>();
    project?.members?.forEach((mem) => {
      const { id, name } = mem;
      if (!userMap.has(id)) {
        userMap.set(id, {
          value: id,
          label: name,
          disabled: !(ownerIds.length < maxOwnerCount || ownerIds.includes(id)),
        });
      }
    });
    return [...userMap.values()];
  }, [project?.members, ownerIds, maxOwnerCount]);
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
          id: 'odc.Database.ChangeOwnerModal.OperationSucceeded',
        }), // 修改负责人成功
      );
      form.resetFields();
      close();
      onSuccess();
    }
  }, [database?.id, database?.project?.id, close, onSuccess]);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        ownerIds: database?.owners?.map(({ id }) => id) || [],
      });
    }
  }, [visible]);

  return (
    <Modal
      maskClosable={false}
      title={
        formatMessage({
          id: 'odc.Database.ChangeOwnerModal.ModifyOwner',
        }) //'修改负责人'
      }
      open={visible}
      confirmLoading={saveOwnerLoading}
      onCancel={() => {
        form.resetFields();
        close();
      }}
      onOk={handleSubmitForm}
    >
      <Form requiredMark="optional" form={form} layout="vertical">
        <Form.Item>
          {
            formatMessage({
              id: 'odc.Info.ChangeOwnerModal.DatabaseName',
            }) /*数据库名称*/
          }
          {database?.name}
        </Form.Item>
        <Form.Item
          name="ownerIds"
          label={formatMessage({
            id: 'odc.Database.ChangeOwnerModal.DatabaseOwner',
          })} /*数据库负责人*/
        >
          <Select
            allowClear
            mode="multiple"
            placeholder={formatMessage({
              id: 'odc.Database.ChangeOwnerModal.SelectDatabaseOwner',
            })}
            /* 请选择数据库负责人*/
            style={{
              width: '100%',
            }}
            optionFilterProp="label"
            options={projectUserOptions}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
