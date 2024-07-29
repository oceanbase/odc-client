import { formatMessage } from '@/util/intl';
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

import { createTask } from '@/common/network/task';
import { getResourceRoles } from '@/common/network/manager';
import { TaskExecStrategy, TaskPageScope, TaskPageType, TaskType } from '@/d.ts';
import { openTasksPage } from '@/store/helper/page';
import type { ModalStore } from '@/store/modal';
import { ProjectRole } from '@/d.ts/project';
import { Button, Drawer, Form, Modal, Select, Space, Input, message, Typography, Tag } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { useProjects } from '@/component/Task/hooks/useProjects';
import styles from './index.less';
const { Text } = Typography;
export const projectRoleMap = {
  [ProjectRole.OWNER]: {
    label: formatMessage({
      id: 'odc.src.component.Task.ApplyPermission.CreateModal.Administrator',
      defaultMessage: '管理员',
    }),
    //'管理员'
    description: formatMessage({
      id: 'src.component.Task.ApplyPermission.CreateModal.92D261DD',
      defaultMessage: '拥有项目内的所有权限',
    }), //'拥有项目内的所有权限'
  },
  [ProjectRole.DEVELOPER]: {
    label: formatMessage({
      id: 'src.component.Task.ApplyPermission.CreateModal.AF13A500',
      defaultMessage: '开发者',
    }), //'开发者'
    description: formatMessage({
      id: 'src.component.Task.ApplyPermission.CreateModal.012F2C58',
      defaultMessage: '允许登录所有数据库、执行 SQL、提交工单，通常是开发人员',
    }), //'允许登录所有数据库、执行 SQL、提交工单，通常是开发人员'
  },
  [ProjectRole.DBA]: {
    label: 'DBA',
    description: formatMessage({
      id: 'src.component.Task.ApplyPermission.CreateModal.211C9AC8',
      defaultMessage: '在开发者的基础上，还可以管理敏感列、添加/转移数据库等',
    }), //'在开发者的基础上，还可以管理敏感列、添加/转移数据库等'
  },
  [ProjectRole.SECURITY_ADMINISTRATOR]: {
    label: formatMessage({
      id: 'odc.src.component.Task.ApplyPermission.CreateModal.SecurityAdministrator',
      defaultMessage: '安全管理员',
    }),
    //'安全管理员'
    description: formatMessage({
      id: 'src.component.Task.ApplyPermission.CreateModal.B35D50C9',
      defaultMessage: '在参与者的基础上，同时可以管理敏感列',
    }), //'在参与者的基础上还可以管理敏感列'
  },
  [ProjectRole.PARTICIPANT]: {
    label: formatMessage({
      id: 'odc.src.component.Task.ApplyPermission.CreateModal.Participant',
      defaultMessage: '参与者',
    }),
    //'参与者'
    description: formatMessage({
      id: 'src.component.Task.ApplyPermission.CreateModal.ED069A06',
      defaultMessage: '允许查看项目基本信息，并自助申请库权限和提交工单',
    }), //'允许查看项目基本信息，并自助申请库权限和提交工单'
  },
};
interface IProps {
  modalStore?: ModalStore;
  projectId?: number;
}
const CreateModal: React.FC<IProps> = (props) => {
  const { modalStore, projectId } = props;
  const [form] = Form.useForm();
  const [roles, setRoles] = useState<any[]>([]);
  const [hasEdit, setHasEdit] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const { projectOptions, loadProjects } = useProjects();
  const { applyPermissionVisible, asyncTaskData } = modalStore;
  const rolesOptions = roles?.map(({ roleName, id }) => {
    const role = projectRoleMap?.[roleName];
    return {
      label: (
        <div data-label={role?.label}>
          <div>{role?.label}</div>
          <Text type="secondary">{role?.description}</Text>
        </div>
      ),

      name: roleName,
      value: id,
    };
  });
  const loadRoles = async () => {
    const roles = await getResourceRoles();
    setRoles(roles?.contents);
  };
  useEffect(() => {
    if (applyPermissionVisible) {
      loadProjects();
      loadRoles();
    }
  }, [applyPermissionVisible]);
  const handleFieldsChange = () => {
    setHasEdit(true);
  };
  const hadleReset = () => {
    form.resetFields(null);
    setHasEdit(false);
  };
  const handleCancel = (hasEdit: boolean) => {
    if (hasEdit) {
      Modal.confirm({
        title: formatMessage({
          id: 'odc.src.component.Task.ApplyPermission.CreateModal.DoYouConfirmTheCancellation',
          defaultMessage: '是否确认取消申请项目权限？',
        }), //'确认取消申请项目权限吗？'
        centered: true,
        onOk: () => {
          modalStore.changeApplyPermissionModal(false);
          hadleReset();
        },
      });
    } else {
      modalStore.changeApplyPermissionModal(false);
      hadleReset();
    }
  };
  const handleSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
        const { projectId, resourceRoleIds, applyReason } = values;
        const project = projectOptions?.find(({ value }) => value === projectId);
        const resourceRoles = rolesOptions
          ?.filter(({ value }) => resourceRoleIds?.includes(value))
          ?.map(({ value, name }) => ({
            name: name,
            id: value,
          }));
        const parameters = {
          applyReason,
          project: {
            name: project.label,
            id: project.value,
          },
          resourceRoles,
        };
        const data = {
          taskType: TaskType.APPLY_PROJECT_PERMISSION,
          executionStrategy: TaskExecStrategy.AUTO,
          parameters,
        };
        setConfirmLoading(true);
        const res = await createTask(data);
        handleCancel(false);
        setConfirmLoading(false);
        if (res) {
          message.success(
            formatMessage({
              id: 'src.component.Task.ApplyPermission.CreateModal.1F08D7C5' /*'工单创建成功'*/,
              defaultMessage: '工单创建成功',
            }),
          );
          openTasksPage(
            TaskPageType.APPLY_PROJECT_PERMISSION,
            TaskPageScope.CREATED_BY_CURRENT_USER,
          );
        }
      })
      .catch((errorInfo) => {
        console.error(JSON.stringify(errorInfo));
      });
  };
  return (
    <Drawer
      destroyOnClose
      className={styles.applyPermission}
      width={520}
      title={
        formatMessage({
          id: 'odc.src.component.Task.ApplyPermission.CreateModal.ApplicationProjectPermissions',
          defaultMessage: '申请项目权限',
        }) /* 申请项目权限 */
      }
      footer={
        <Space>
          <Button
            onClick={() => {
              handleCancel(hasEdit);
            }}
          >
            {
              formatMessage({
                id: 'odc.src.component.Task.ApplyPermission.CreateModal.Cancel',
                defaultMessage: '\n            取消\n          ',
              }) /* 
          取消
          */
            }
          </Button>
          <Button type="primary" loading={confirmLoading} onClick={handleSubmit}>
            {
              formatMessage({
                id: 'odc.src.component.Task.ApplyPermission.CreateModal.NewlyBuilt',
                defaultMessage: '\n            新建\n          ',
              }) /* 
          新建
          */
            }
          </Button>
        </Space>
      }
      open={applyPermissionVisible}
      onClose={() => {
        handleCancel(hasEdit);
      }}
    >
      <Form
        name="basic"
        initialValues={{
          executionStrategy: TaskExecStrategy.AUTO,
          databaseId: asyncTaskData?.databaseId,
        }}
        layout="vertical"
        requiredMark="optional"
        form={form}
        onFieldsChange={handleFieldsChange}
      >
        <Form.Item
          label={
            formatMessage({
              id: 'odc.src.component.Task.ApplyPermission.CreateModal.Project',
              defaultMessage: '项目',
            }) /* 项目 */
          }
          name="projectId"
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'odc.src.component.Task.ApplyPermission.CreateModal.PleaseSelectTheProject',
                defaultMessage: '请选择项目',
              }), //'请选择项目'
            },
          ]}
        >
          <Select
            style={{
              width: 240,
            }}
            options={projectOptions}
            placeholder={
              formatMessage({
                id: 'odc.src.component.Task.ApplyPermission.CreateModal.PleaseChoose.1',
                defaultMessage: '请选择',
              }) /* 请选择 */
            }
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>
        <Form.Item
          label={
            formatMessage({
              id: 'odc.src.component.Task.ApplyPermission.CreateModal.ProjectRole',
              defaultMessage: '项目角色',
            }) /* 项目角色 */
          }
          name="resourceRoleIds"
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'odc.src.component.Task.ApplyPermission.CreateModal.PleaseSelectTheProjectRole',
                defaultMessage: '请选择项目角色',
              }), //'请选择项目角色'
            },
          ]}
        >
          <Select
            mode="multiple"
            dropdownMatchSelectWidth={false}
            style={{
              width: 240,
            }}
            options={rolesOptions}
            optionFilterProp="name"
            placeholder={
              formatMessage({
                id: 'odc.src.component.Task.ApplyPermission.CreateModal.PleaseChoose.1',
                defaultMessage: '请选择',
              }) /* 请选择 */
            }
            tagRender={(props) => {
              const { closable, onClose } = props;
              const labelText = (props?.label as any)?.props?.['data-label'];
              return (
                <Tag closable={closable} onClose={onClose}>
                  {labelText}
                </Tag>
              );
            }}
          />
        </Form.Item>
        <Form.Item
          label={
            formatMessage({
              id: 'odc.src.component.Task.ApplyPermission.CreateModal.Cause',
              defaultMessage: '申请原因',
            }) /* 申请原因 */
          }
          name="applyReason"
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'odc.src.component.Task.ApplyPermission.CreateModal.PleaseEnterTheReasonDescription',
                defaultMessage: '请输入原因描述',
              }), //'请输入原因描述'
            },
            {
              max: 200,
              message: formatMessage({
                id: 'odc.src.component.Task.ApplyPermission.CreateModal.TheReasonForTheApplication',
                defaultMessage: '申请原因不超过 200 个字符',
              }), //'申请原因不超过 200 个字符'
            },
          ]}
        >
          <Input.TextArea
            rows={6}
            placeholder={
              formatMessage({
                id: 'odc.src.component.Task.ApplyPermission.CreateModal.PleaseEnterTheReasonDescription.1',
                defaultMessage: '请输入原因描述',
              }) /* 请输入原因描述 */
            }
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};
export default inject('modalStore')(observer(CreateModal));
