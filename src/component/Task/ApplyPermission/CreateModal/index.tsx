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
import { getProjectList } from '@/common/network/task';
import { TaskExecStrategy, TaskPageScope, TaskPageType, TaskType } from '@/d.ts';
import { openTasksPage } from '@/store/helper/page';
import type { ModalStore } from '@/store/modal';
import type { SQLStore } from '@/store/sql';
import type { TaskStore } from '@/store/task';
import { Button, Drawer, Form, Modal, Select, Space, Input, message } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import styles from './index.less';

interface IProps {
  sqlStore?: SQLStore;
  taskStore?: TaskStore;
  modalStore?: ModalStore;
  projectId?: number;
}

const CreateModal: React.FC<IProps> = (props) => {
  const { modalStore, projectId } = props;
  const [form] = Form.useForm();
  const [projects, setProjects] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [hasEdit, setHasEdit] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const { applyPermissionVisible, asyncTaskData } = modalStore;
  const projectOptions = projects?.map(({ name, id }) => ({
    label: name,
    value: id,
  }));
  const rolesOptions = roles?.map(({ roleName, id }) => ({
    label: roleName,
    value: id,
  }));

  const loadProjects = async () => {
    const res = await getProjectList(false);
    setProjects(res?.contents);
  };

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
  };

  const handleCancel = (hasEdit: boolean) => {
    if (hasEdit) {
      Modal.confirm({
        title: '权限申请',
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
          ?.map(({ value, label }) => ({
            name: label,
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
          message.success('申请项目权限成功！');
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
      title="申请项目权限"
      footer={
        <Space>
          <Button
            onClick={() => {
              handleCancel(hasEdit);
            }}
          >
            取消
          </Button>
          <Button type="primary" loading={confirmLoading} onClick={handleSubmit}>
            新建
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
          label="项目"
          name="projectId"
          rules={[
            {
              required: true,
              message: '请选择项目',
            },
          ]}
        >
          <Select style={{ width: 240 }} options={projectOptions} placeholder="请选择" />
        </Form.Item>
        <Form.Item
          label="项目角色"
          name="resourceRoleIds"
          rules={[
            {
              required: true,
              message: '请选择项目角色',
            },
          ]}
        >
          <Select
            mode="multiple"
            style={{ width: 240 }}
            options={rolesOptions}
            placeholder="请选择"
          />
        </Form.Item>
        <Form.Item
          label="申请原因"
          name="applyReason"
          rules={[
            {
              required: true,
              message: '请输入原因描述',
            },
            {
              max: 200,
              message: '申请原因不超过 200 个字符',
            },
          ]}
        >
          <Input.TextArea rows={6} placeholder="请输入原因描述" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default inject('sqlStore', 'taskStore', 'modalStore')(observer(CreateModal));
