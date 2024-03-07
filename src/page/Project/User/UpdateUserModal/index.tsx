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

import { updateProjectMember } from '@/common/network/project';
import HelpDoc from '@/component/helpDoc';
import { ProjectRole } from '@/d.ts/project';
import { formatMessage } from '@/util/intl';
import { Checkbox, Form, message, Modal } from 'antd';
import { useEffect } from 'react';
import { projectRoleTextMap } from '..';
interface IProps {
  close: () => void;
  onSuccess: () => void;
  roles: ProjectRole[];
  projectId: number;
  userId: number;
  visible: boolean;
}

export default function UpdateUserModal({
  close,
  onSuccess,
  visible,
  roles,
  projectId,
  userId,
}: IProps) {
  const [form] = Form.useForm<{
    roles: ProjectRole[];
  }>();

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        roles: roles,
      });
    }
  }, [visible]);

  async function submit() {
    const formData = await form.validateFields();
    if (!formData) {
      return;
    }
    const roles = formData.roles;
    const isSuccess = await updateProjectMember({
      projectId,
      userId,
      members: roles?.map((role) => ({
        id: userId,
        role: role,
      })),
    });
    if (isSuccess) {
      message.success(
        formatMessage({ id: 'odc.User.UpdateUserModal.OperationSucceeded' }), //操作成功
      );
      close();
      onSuccess();
    }
  }

  return (
    <Modal
      title={formatMessage({ id: 'odc.User.UpdateUserModal.EditMember' })}
      /*编辑成员*/ onCancel={() => close()}
      onOk={submit}
      open={visible}
      width={520}
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          rules={[{ required: true }]}
          name={'roles'}
          label={formatMessage({ id: 'odc.User.UpdateUserModal.ProjectRole' })} /*项目角色*/
        >
          <Checkbox.Group
            options={[
              {
                label: (
                  <HelpDoc leftText doc="projectOwner">
                    {formatMessage({ id: 'odc.User.UpdateUserModal.Administrator' }) /*管理员*/}
                  </HelpDoc>
                ),

                value: ProjectRole.OWNER,
              },
              {
                label: (
                  <HelpDoc leftText doc="projectDBA">
                    DBA
                  </HelpDoc>
                ),

                value: ProjectRole.DBA,
              },
              {
                label: (
                  <HelpDoc leftText doc="projectDev">
                    {
                      formatMessage({
                        id: 'src.page.Project.User.UpdateUserModal.09F81F9F' /*开发者*/,
                      }) /* 开发者 */
                    }
                  </HelpDoc>
                ),

                value: ProjectRole.DEVELOPER,
              },
              {
                label: (
                  <HelpDoc leftText doc="projectSA">
                    {projectRoleTextMap[ProjectRole.SECURITY_ADMINISTRATOR]}
                  </HelpDoc>
                ),

                value: ProjectRole.SECURITY_ADMINISTRATOR,
              },
              {
                label: (
                  <HelpDoc leftText doc="participant">
                    {projectRoleTextMap[ProjectRole.PARTICIPANT]}
                  </HelpDoc>
                ),

                value: ProjectRole.PARTICIPANT,
              },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
