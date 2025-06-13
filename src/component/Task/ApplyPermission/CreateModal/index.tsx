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

import { getResourceRoles } from '@/common/network/manager';
import { createTask } from '@/common/network/task';
import { useProjects } from '@/component/Task/hooks/useProjects';
import { TaskExecStrategy, TaskPageScope, TaskPageType, TaskType } from '@/d.ts';
import { ProjectRole } from '@/d.ts/project';
import { openTasksPage } from '@/store/helper/page';
import type { ModalStore } from '@/store/modal';
import { Button, Drawer, Form, Input, message, Modal, Select, Space, Tag, Typography } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import styles from './index.less';
import ProjectSelectEmpty from '@/component/Empty/ProjectSelectEmpty';
const { Paragraph } = Typography;
export const projectRoleMap = {
  [ProjectRole.OWNER]: {
    label: formatMessage({
      id: 'odc.src.component.Task.ApplyPermission.CreateModal.Administrator',
      defaultMessage: '管理员',
    }),
    //'管理员'
    description: formatMessage({
      id: 'src.component.Task.ApplyPermission.CreateModal.F649692E',
      defaultMessage: '拥有项目内的所有权限，可查看和管理项目的所有工单',
    }),
  },
  [ProjectRole.DEVELOPER]: {
    label: formatMessage({
      id: 'src.component.Task.ApplyPermission.CreateModal.AF13A500',
      defaultMessage: '开发者',
    }), //'开发者'
    description: formatMessage({
      id: 'src.component.Task.ApplyPermission.CreateModal.20CEE7B9',
      defaultMessage:
        '拥有项目内所有数据库权限，允许登录数据库、执行 SQL、提交工单，可以查看项目内所有工单并管理自己发起的工单',
    }),
  },
  [ProjectRole.DBA]: {
    label: 'DBA',
    description: formatMessage({
      id: 'src.component.Task.ApplyPermission.CreateModal.A9FCEF31',
      defaultMessage:
        '拥有项目内除成员管理、消息配置和项目设置外的所有权限，包括查看和管理项目的所有工单权限',
    }),
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
      id: 'src.component.Task.ApplyPermission.CreateModal.E3F621FF',
      defaultMessage:
        ' 允许查看项目基本信息，默认无项目内任何数据库权限，支持自助申请库权限和提交工单，可以查看项目内所有工单并管理自己发起的工单',
    }),
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
  const { applyPermissionVisible, asyncTaskData, applyPermissionData } = modalStore;
  const rolesOptions = roles?.map(({ roleName, id }) => {
    const role = projectRoleMap?.[roleName];
    return {
      label: (
        <div data-label={role?.label} className={styles.rolesOptions}>
          <div>{role?.label}</div>
          <Paragraph>{role?.description}</Paragraph>
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

  useEffect(() => {
    const { task } = applyPermissionData ?? {};
    if (task && applyPermissionVisible) {
      loadEditData();
    }
  }, [applyPermissionData]);

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

  const loadEditData = async () => {
    const { task } = applyPermissionData;
    const {
      parameters: {
        project: { id: projectId },
        resourceRoles,
        applyReason,
      },
    } = task;
    const formData = {
      projectId: projectOptions?.find(({ value }) => value === projectId) ? projectId : null,
      applyReason,
      resourceRoleIds: resourceRoles?.map(({ id }) => id),
    };
    form.setFieldsValue(formData);
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
        form.scrollToField(errorInfo?.errorFields?.[0]?.name);
        console.error(JSON.stringify(errorInfo));
      });
  };
  return (
    <Drawer
      destroyOnClose
      rootClassName={styles.applyPermission}
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
            dropdownStyle={{ padding: 0 }}
            dropdownRender={projectOptions?.length <= 0 ? () => <ProjectSelectEmpty /> : undefined}
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
