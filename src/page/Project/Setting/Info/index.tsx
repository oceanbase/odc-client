/*
 * Copyright 2024 OceanBase
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

import { setProjectAchived, updateProject } from '@/common/network/project';
import { IProject } from '@/d.ts/project';
import { formatMessage } from '@/util/intl';
import { history } from '@umijs/max';
import { Button, Form, Input, message, Popconfirm, Space } from 'antd';
import { useContext, useEffect, useState } from 'react';
import ProjectContext from '../../ProjectContext';

export default function Info() {
  const [form] = Form.useForm<Pick<IProject, 'name' | 'description'>>();
  const context = useContext(ProjectContext);
  const [isModify, setIsModify] = useState(false);

  useEffect(() => {
    if (context.project) {
      form.setFieldsValue(context.project);
    }
  }, [context.project]);

  async function onSubmit() {
    const data = await form.validateFields();
    const newData = {
      ...context.project,
      ...data,
    };
    const isSuccess = await updateProject(context?.projectId, newData);
    if (isSuccess) {
      message.success(
        formatMessage({ id: 'odc.Setting.Info.UpdatedSuccessfully' }), //更新成功！
      );
      setIsModify(false);
      context?.reloadProject();
    }
  }

  async function deleteProject() {
    const isSuccess = await setProjectAchived({
      projectId: context?.projectId,
      archived: true,
    });
    if (!isSuccess) {
      return;
    }
    message.success(
      formatMessage({ id: 'odc.Setting.Info.OperationSucceeded' }), //操作成功
    );
    history.push('/project');
  }

  return (
    <div style={{ padding: 24 }}>
      <Form
        onValuesChange={() => {
          setIsModify(true);
        }}
        form={form}
        initialValues={context.project}
        layout="vertical"
        requiredMark="optional"
      >
        <Form.Item
          required
          name={'name'}
          label={formatMessage({ id: 'odc.Setting.Info.ProjectName' })} /*项目名称*/
        >
          <Input
            placeholder={formatMessage({ id: 'odc.Setting.Info.EnterAName' })}
            /*请输入名称*/ style={{ width: 400 }}
          />
        </Form.Item>
        <Form.Item
          name={'description'}
          label={formatMessage({ id: 'odc.Setting.Info.Description' })} /*描述*/
        >
          <Input.TextArea
            placeholder={formatMessage({ id: 'odc.Setting.Info.EnterADescription' })} /*请输入描述*/
            style={{ width: 480 }}
            autoSize={{ minRows: 4, maxRows: 8 }}
          />
        </Form.Item>
      </Form>
      <Space size={36} direction="vertical">
        <Button disabled={!isModify} type="primary" onClick={onSubmit}>
          {formatMessage({ id: 'odc.Setting.Info.ConfirmModification' }) /*确认修改*/}
        </Button>
        <Popconfirm
          title={
            formatMessage({ id: 'odc.Setting.Info.ThisOperationCannotBeRestored' }) //该操作无法恢复，确定要归档项目吗？
          }
          onConfirm={deleteProject}
        >
          <Button danger>
            {formatMessage({ id: 'odc.Setting.Info.ArchiveProject' }) /*归档项目*/}
          </Button>
        </Popconfirm>
      </Space>
    </div>
  );
}
