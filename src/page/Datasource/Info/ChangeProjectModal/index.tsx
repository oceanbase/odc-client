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

import { updateDataBase } from '@/common/network/database';
import { listProjects } from '@/common/network/project';
import { IDatabase } from '@/d.ts/database';
import { formatMessage } from '@/util/intl';
import { useRequest } from 'ahooks';
import { Form, message, Modal, Select } from 'antd';
import { isUndefined } from 'lodash';
import { useContext, useEffect, useMemo, useState } from 'react';
import ProjectSelect from './ProjectSelect';
import { DefaultOptionType } from 'antd/es/select';
import { DB_OWNER_MAX_COUNT } from '@/page/Project/Database/const';
import ProjectContext from '@/page/Project/ProjectContext';
interface IProps {
  visible: boolean;
  database: IDatabase;
  close: () => void;
  onSuccess: () => void;
  maxOwnerCount?: number;
}
export default function ChangeProjectModal({
  visible,
  database,
  close,
  onSuccess,
  maxOwnerCount = DB_OWNER_MAX_COUNT,
}: IProps) {
  const { project } = useContext(ProjectContext);

  const [form] = Form.useForm();
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
  const { data, loading, run } = useRequest(listProjects, {
    manual: true,
  });
  useEffect(() => {
    if (visible) {
      run(null, 1, 9999);
      const owner_ids = database?.owners?.map(({ id }) => id) || [];
      form.setFieldsValue({
        project: database?.project?.id || null,
        ownerIds: owner_ids,
      });
      setOwnerIds(owner_ids);
    }
  }, [visible]);
  return (
    <Modal
      title={
        formatMessage({
          id: 'odc.src.page.Datasource.Info.ChangeProjectModal.ModifyTheProject',
        }) //'修改所属项目'
      }
      open={visible}
      onCancel={close}
      onOk={async () => {
        const value = await form.validateFields();
        console.log(value);
        const isSuccess = await updateDataBase([database?.id], value.project, value.ownerIds);
        if (isSuccess) {
          message.success(
            formatMessage({
              id: 'odc.Info.ChangeProjectModal.OperationSucceeded',
            }), //操作成功
          );

          close();
          onSuccess();
        }
      }}
    >
      <Form
        requiredMark="optional"
        form={form}
        layout="vertical"
        onValuesChange={(changedValues) => {
          if (changedValues.hasOwnProperty('ownerIds')) {
            setOwnerIds(changedValues.ownerIds);
          }
        }}
      >
        <Form.Item>
          {
            formatMessage({
              id: 'odc.Info.ChangeProjectModal.DatabaseName',
            }) /*数据库名称：*/
          }
          {database?.name}
        </Form.Item>
        <Form.Item
          required
          rules={[
            {
              validator(rule, value, callback) {
                if (isUndefined(value)) {
                  callback(
                    formatMessage({
                      id: 'odc.Info.ChangeProjectModal.PleaseSelectAProject',
                    }), //请选择项目
                  );

                  return;
                }
                callback();
              },
            },
          ]}
          label={
            formatMessage({
              id: 'odc.src.page.Datasource.Info.ChangeProjectModal.Project',
            }) //'项目'
          }
          name={'project'}
        >
          <ProjectSelect projects={data?.contents} currentDatabase={database} />
        </Form.Item>
        <Form.Item name="ownerIds" label="数据库管理员（未设置时默认是项目管理员）">
          <Select
            allowClear
            mode="multiple"
            placeholder="请选择数据库管理员"
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
