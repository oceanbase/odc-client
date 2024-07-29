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
import { getProject, listProjects } from '@/common/network/project';
import { IDatabase } from '@/d.ts/database';
import { formatMessage } from '@/util/intl';
import { useRequest } from 'ahooks';
import { Form, message, Modal, Select } from 'antd';
import { isUndefined } from 'lodash';
import { useContext, useEffect, useMemo, useState } from 'react';
import ProjectSelect from './ProjectSelect';
import { DB_OWNER_MAX_COUNT } from '@/page/Project/Database/const';
import ProjectContext from '@/page/Project/ProjectContext';
import { DatabaseOwnerSelect } from '@/page/Project/Database/components/DatabaseOwnerSelect.tsx';
import { IProject } from '@/d.ts/project';

interface IProps {
  visible: boolean;
  database: IDatabase;
  close: () => void;
  onSuccess: () => void;
}
export default function ChangeProjectModal({ visible, database, close, onSuccess }: IProps) {
  const [projectInfo, setProjectInfo] = useState<IProject>();
  const [ownerSelectStatus, setOwnerSelectStatus] = useState<boolean>(false);
  const [form] = Form.useForm();

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
      if (database?.project?.id) {
        getProjectDetail(database?.project?.id);
      } else {
        setOwnerSelectStatus(true);
      }
    }
  }, [visible]);

  const getProjectDetail = async (project) => {
    const res = await getProject(project);
    res && setProjectInfo(res);
  };

  const onClose = () => {
    close();
    setProjectInfo(null);
    setOwnerSelectStatus(false);
    form.resetFields();
  };
  return (
    <Modal
      title={
        formatMessage({
          id: 'odc.src.page.Datasource.Info.ChangeProjectModal.ModifyTheProject',
          defaultMessage: '修改所属项目',
        }) //'修改所属项目'
      }
      open={visible}
      onCancel={onClose}
      onOk={async () => {
        const value = await form.validateFields();
        const isSuccess = await updateDataBase([database?.id], value.project, value.ownerIds);
        if (isSuccess) {
          message.success(
            formatMessage({
              id: 'odc.Info.ChangeProjectModal.OperationSucceeded',
              defaultMessage: '操作成功',
            }), //操作成功
          );
          onClose();
          onSuccess();
        }
      }}
    >
      <Form
        requiredMark="optional"
        form={form}
        layout="vertical"
        onValuesChange={async (changedValues, allValues) => {
          if (changedValues.hasOwnProperty('project')) {
            if (changedValues.project) {
              getProjectDetail(changedValues.project);
            } else {
              setProjectInfo(undefined);
            }
            form.setFieldValue('ownerIds', []);
          }
        }}
      >
        <Form.Item>
          {
            formatMessage({
              id: 'odc.Info.ChangeProjectModal.DatabaseName',
              defaultMessage: '数据库名称：',
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
                      defaultMessage: '请选择项目',
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
              defaultMessage: '项目',
            }) //'项目'
          }
          name={'project'}
        >
          <ProjectSelect
            projects={data?.contents}
            currentDatabase={database}
            setDisabledStatus={(status) => setOwnerSelectStatus(status)}
          />
        </Form.Item>
        <DatabaseOwnerSelect
          projectInfo={projectInfo}
          hasDefaultSet={false}
          setFormOwnerIds={(value) => {
            form.setFieldsValue({
              ownerIds: value,
            });
          }}
          disabled={ownerSelectStatus}
        />
      </Form>
    </Modal>
  );
}
