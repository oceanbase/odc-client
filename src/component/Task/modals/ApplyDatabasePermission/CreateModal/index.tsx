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

import { listProjects } from '@/common/network/project';
import { createTask } from '@/common/network/task';
import DatabaseSelecter from '@/component/Task/component/DatabaseSelecter';
import { TaskPageType, TaskType } from '@/d.ts';
import { openTasksPage } from '@/store/helper/page';
import type { ModalStore } from '@/store/modal';
import { useRequest } from 'ahooks';
import {
  Alert,
  Button,
  Checkbox,
  DatePicker,
  Drawer,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
} from 'antd';
import { inject, observer } from 'mobx-react';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import styles from './index.less';
import ProjectSelectEmpty from '@/component/Empty/ProjectSelectEmpty';
import { permissionOptions } from './utils';
import { expireTimeOptions, rules } from './const';
import { getExpireTime } from '@/component/Task/helper';

export * from './const';
export * from './utils';

const CheckboxGroup = Checkbox.Group;

const defaultValue = {
  databases: [],
  expireTime: '7,days',
};

interface IProps {
  modalStore?: ModalStore;
  projectId?: number;
  reloadList?: () => void;
}
const CreateModal: React.FC<IProps> = (props) => {
  const { modalStore, reloadList } = props;
  const { applyDatabasePermissionVisible, applyDatabasePermissionData } = modalStore;
  const [form] = Form.useForm();
  const [hasEdit, setHasEdit] = useState(false);
  const [showSelectTip, setShowSelectTip] = useState(false);
  const [showSelectLogicDBTip, setShowSelectLogicDBTip] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const projectId = Form.useWatch('projectId', form);
  const { run: getProjects, data: projects } = useRequest(listProjects, {
    defaultParams: [null, null, null],
    manual: true,
  });
  const projectOptions = projects?.contents?.map(({ name, id }) => ({
    label: name,
    value: id,
  }));
  const disabledDate = (current) => {
    return current && current < dayjs().subtract(1, 'days').endOf('day');
  };

  useEffect(() => {
    if (applyDatabasePermissionVisible) {
      getProjects(null, null, null);
    }
  }, [applyDatabasePermissionVisible]);
  const handleFieldsChange = () => {
    setHasEdit(true);
  };
  const hadleReset = () => {
    form.resetFields(null);
    setHasEdit(false);
    setShowSelectTip(false);
    setShowSelectLogicDBTip(false);
  };
  const handleCancel = (hasEdit: boolean) => {
    if (hasEdit) {
      Modal.confirm({
        zIndex: 1003,
        title: formatMessage({
          id: 'src.component.Task.ApplyDatabasePermission.CreateModal.B35BDC54',
          defaultMessage: '确认取消申请库权限吗？',
        }), //'确认取消申请库权限吗？'
        centered: true,
        onOk: () => {
          modalStore.changeApplyDatabasePermissionModal(false);
          hadleReset();
        },
      });
    } else {
      modalStore.changeApplyDatabasePermissionModal(false);
      hadleReset();
    }
  };
  const handleSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
        const { projectId, databases, types, expireTime, customExpireTime, applyReason } = values;
        const isCustomExpireTime = expireTime?.startsWith('custom');
        const parameters = {
          project: {
            id: projectId,
          },
          databases: databases?.map((id) => ({ id })),
          types,
          expireTime: getExpireTime(expireTime, customExpireTime, isCustomExpireTime),
          applyReason,
          validDuration: expireTime,
        };
        const data = {
          taskType: TaskType.APPLY_DATABASE_PERMISSION,
          parameters,
        };
        setConfirmLoading(true);
        const res = await createTask(data);
        handleCancel(false);
        reloadList?.();
        setConfirmLoading(false);
        if (res) {
          message.success(
            formatMessage({
              id: 'src.component.Task.ApplyDatabasePermission.CreateModal.8B9755E4' /*'工单创建成功'*/,
              defaultMessage: '工单创建成功',
            }),
          );
          openTasksPage(TaskPageType.APPLY_DATABASE_PERMISSION);
        }
      })
      .catch((errorInfo) => {
        form.scrollToField(errorInfo?.errorFields?.[0]?.name);
        console.error(JSON.stringify(errorInfo));
      });
  };

  const loadEditData = async () => {
    const { task } = applyDatabasePermissionData;
    let tempProjectOptions = projectOptions;
    const {
      parameters: {
        project: { id: projectId },
        databases,
        types,
        applyReason,
        validDuration,
        expireTime,
      },
      executionStrategy,
    } = task;
    const idProjectActive = tempProjectOptions?.find(({ value }) => value === projectId);
    const formData = {
      ...defaultValue,
      projectId: idProjectActive ? projectId : null,
      executionStrategy,
      databases: idProjectActive ? databases?.map((item) => item.id) : [],
      types,
      applyReason,
      expireTime: validDuration ? validDuration : defaultValue.expireTime,
      customExpireTime: undefined,
    };
    if (validDuration === 'custom') {
      formData.customExpireTime = dayjs(expireTime);
    }
    form.setFieldsValue(formData);
  };

  const handleResetDatabase = () => {
    form.setFieldValue('databases', []);
  };

  useEffect(() => {
    const { projectId, databaseId, types } = applyDatabasePermissionData ?? {};
    if (applyDatabasePermissionData?.task) {
      loadEditData();
    } else {
      form.setFieldsValue({
        projectId: projectId || props?.projectId,
        databases: databaseId ? [databaseId] : [],
        types,
      });
    }
  }, [applyDatabasePermissionData]);

  return (
    <Drawer
      zIndex={1002}
      destroyOnClose
      rootClassName={styles.createModal}
      width={816}
      title={
        formatMessage({
          id: 'src.component.Task.ApplyDatabasePermission.CreateModal.4149EA9A',
          defaultMessage: '申请库权限',
        }) /*"申请库权限"*/
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
                id: 'src.component.Task.ApplyDatabasePermission.CreateModal.076877DF' /*取消*/,
                defaultMessage: '取消',
              }) /* 取消 */
            }
          </Button>
          <Button type="primary" loading={confirmLoading} onClick={handleSubmit}>
            {
              formatMessage({
                id: 'src.component.Task.ApplyDatabasePermission.CreateModal.1D6E4447' /*新建*/,
                defaultMessage: '新建',
              }) /* 新建 */
            }
          </Button>
        </Space>
      }
      open={applyDatabasePermissionVisible}
      onClose={() => {
        handleCancel(hasEdit);
      }}
    >
      <Form
        name="basic"
        initialValues={defaultValue}
        layout="vertical"
        requiredMark="optional"
        form={form}
        onFieldsChange={handleFieldsChange}
        onValuesChange={(changedValues, allValues) => {
          if (changedValues.hasOwnProperty('databases')) {
            setShowSelectTip(changedValues?.databases?.length > 1);
          }
        }}
      >
        <Form.Item
          label={
            formatMessage({
              id: 'src.component.Task.ApplyDatabasePermission.CreateModal.9BB6C53A',
              defaultMessage: '项目',
            }) /*"项目"*/
          }
          name="projectId"
          rules={rules.projectId}
        >
          <Select
            showSearch
            style={{ width: 336 }}
            dropdownStyle={{ padding: 0 }}
            options={projectOptions}
            dropdownRender={projectOptions?.length <= 0 ? () => <ProjectSelectEmpty /> : undefined}
            placeholder={
              formatMessage({
                id: 'src.component.Task.ApplyDatabasePermission.CreateModal.AA89519C',
                defaultMessage: '请选择',
              }) /*"请选择"*/
            }
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            onChange={handleResetDatabase}
          />
        </Form.Item>
        <Form.Item
          name="databases"
          label={
            <div style={{ width: 768 }}>
              {
                formatMessage({
                  id: 'src.component.Task.ApplyDatabasePermission.CreateModal.164A211E',
                  defaultMessage: '数据库',
                }) /*"数据库"*/
              }

              {showSelectTip && (
                <Alert
                  message={formatMessage({
                    id: 'src.component.Task.ApplyDatabasePermission.CreateModal.2B85A3B7',
                    defaultMessage:
                      '多个数据库的权限申请可能会被拆分为多个工单进行审批，最多仅支持选择 10 个数据库',
                  })}
                  type="info"
                  showIcon
                  style={{ margin: '4px 0px' }}
                />
              )}
            </div>
          }
          rules={rules.databases}
        >
          <DatabaseSelecter
            projectId={projectId}
            maxCount={10}
            setShowSelectLogicDBTip={setShowSelectLogicDBTip}
          />
        </Form.Item>
        {showSelectLogicDBTip && (
          <Alert
            message={formatMessage({
              id: 'src.component.Task.ApplyDatabasePermission.CreateModal.F5428F5B',
              defaultMessage:
                '已选数据库中包含逻辑库，审批通过后将默认获得关联物理库的权限；逻辑库仅支持 DDL 变更。',
            })}
            type="info"
            showIcon
            style={{ margin: '4px 0px' }}
          />
        )}

        <Form.Item
          name="types"
          label={
            formatMessage({
              id: 'src.component.Task.ApplyDatabasePermission.CreateModal.C065C250',
              defaultMessage: '权限类型',
            }) /*"权限类型"*/
          }
          rules={rules.types}
        >
          <CheckboxGroup options={permissionOptions} />
        </Form.Item>
        <Form.Item
          label={
            formatMessage({
              id: 'src.component.Task.ApplyDatabasePermission.CreateModal.C7E89A36',
              defaultMessage: '权限有效期',
            }) /*"权限有效期"*/
          }
          name="expireTime"
          rules={rules.expireTime}
        >
          <Select
            style={{ width: '327px' }}
            showSearch
            placeholder={
              formatMessage({
                id: 'src.component.Task.ApplyDatabasePermission.CreateModal.2F6F91EE',
                defaultMessage: '请选择',
              }) /*"请选择"*/
            }
            options={expireTimeOptions}
          />
        </Form.Item>
        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) => {
            const isCustomExpireTime = getFieldValue('expireTime')?.startsWith('custom');
            return (
              isCustomExpireTime && (
                <Form.Item
                  label={
                    formatMessage({
                      id: 'src.component.Task.ApplyDatabasePermission.CreateModal.FD3628E6',
                      defaultMessage: '结束日期',
                    }) /*"结束日期"*/
                  }
                  name="customExpireTime"
                  rules={rules.customExpireTime}
                >
                  <DatePicker disabledDate={disabledDate} style={{ width: '327px' }} />
                </Form.Item>
              )
            );
          }}
        </Form.Item>
        <Form.Item
          label={
            formatMessage({
              id: 'src.component.Task.ApplyDatabasePermission.CreateModal.28506030',
              defaultMessage: '申请原因',
            }) /*"申请原因"*/
          }
          name="applyReason"
          rules={rules.applyReason}
        >
          <Input.TextArea
            rows={6}
            placeholder={
              formatMessage({
                id: 'src.component.Task.ApplyDatabasePermission.CreateModal.5401D61D',
                defaultMessage: '请输入原因描述',
              }) /*"请输入原因描述"*/
            }
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default inject('modalStore')(observer(CreateModal));
