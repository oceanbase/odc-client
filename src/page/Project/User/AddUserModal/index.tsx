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

import { addProjectMember, getUserSummaryList } from '@/common/network/project';
import HelpDoc from '@/component/helpDoc';
import SelectTransfer from '@/component/SelectTransfer';
import { IManagerUser } from '@/d.ts';
import { IProject, ProjectRole } from '@/d.ts/project';
import { formatMessage } from '@/util/intl';
import { useRequest } from 'ahooks';
import { Checkbox, Form, message, Modal } from 'antd';
import { useEffect } from 'react';
import { projectRoleTextMap } from '..';
interface IProps {
  close: () => void;
  onSuccess: () => void;
  project: IProject;
  visible: boolean;
}

export default function AddUserModal({ close, onSuccess, visible, project }: IProps) {
  const [form] = Form.useForm<{
    roles: ProjectRole[];
    users: number[];
  }>();

  const {
    data: userList,
    run,
    loading,
  } = useRequest(getUserSummaryList, {
    manual: true,
  });
  const addedUsers = new Set(project?.members?.map((m) => m.id) || []);

  useEffect(() => {
    if (visible) {
      run();
      form.resetFields();
    }
  }, [visible]);

  const filterOption = (inputValue: string, option: IManagerUser) =>
    option.name.indexOf(inputValue) > -1;

  async function submit() {
    const formData = await form.validateFields();
    if (!formData) {
      return;
    }
    const newUsers = [];
    const { roles, users } = formData;
    userList?.contents?.forEach((user) => {
      if (!users.includes(user.id)) {
        return;
      }
      roles.forEach((role) => {
        newUsers.push({
          id: user.id,
          role: role,
          accountName: user.accountName,
          name: user.name,
        });
      });
    });
    const isSuccess = await addProjectMember({
      projectId: project?.id,
      members: newUsers,
    });
    if (isSuccess) {
      message.success(
        formatMessage({
          id: 'odc.User.AddUserModal.AddedSuccessfully',
          defaultMessage: '添加成功',
        }), //添加成功
      );
      close();
      onSuccess();
    }
  }

  return (
    <Modal
      title={formatMessage({ id: 'odc.User.AddUserModal.AddMembers', defaultMessage: '添加成员' })}
      /*添加成员*/ onCancel={() => close()}
      onOk={submit}
      open={visible}
      width={760}
    >
      <Form requiredMark={false} layout="vertical" form={form}>
        <Form.Item
          rules={[{ required: true }]}
          name={'roles'}
          label={formatMessage({
            id: 'odc.User.AddUserModal.ProjectRole',
            defaultMessage: '项目角色',
          })} /*项目角色*/
        >
          <Checkbox.Group
            options={[
              {
                label: (
                  <HelpDoc leftText doc="projectOwner">
                    {projectRoleTextMap[ProjectRole.OWNER]}
                  </HelpDoc>
                ),

                value: ProjectRole.OWNER,
              },
              {
                label: (
                  <HelpDoc leftText doc="projectDBA">
                    {projectRoleTextMap[ProjectRole.DBA]}
                  </HelpDoc>
                ),

                value: ProjectRole.DBA,
              },
              {
                label: (
                  <HelpDoc leftText doc="projectDev">
                    {projectRoleTextMap[ProjectRole.DEVELOPER]}
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
        <Form.Item
          rules={[{ required: true }]}
          name={'users'}
          valuePropName="checkedKeys"
          trigger="onCheck"
        >
          {/* <Transfer
              className={styles.transfer}
              showSearch
              filterOption={filterOption}
              dataSource={userList?.contents?.map((item) => {
                return {
                  key: item.id,
                  ...item,
                };
              })}
              render={(item) => `${item.name}(${item.accountName})`}
             /> */}
          <SelectTransfer
            treeData={userList?.contents
              ?.map((item) => {
                if (addedUsers.has(item.id)) {
                  return null;
                }
                return {
                  key: item.id,
                  title: `${item.name}(${item.accountName})`,
                  isLeaf: true,
                };
              })
              .filter(Boolean)}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
