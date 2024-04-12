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
import TableSelecter, {
  TableSelecterRef,
  flatTableByGroupedParams,
  groupTableByDataBase,
} from '@/component/Task/component/TableSelecter';
import HelpDoc from '@/component/helpDoc';
import { TaskPageScope, TaskPageType, TaskType } from '@/d.ts';
import { TablePermissionType } from '@/d.ts/table';
import { openTasksPage } from '@/store/helper/page';
import type { ModalStore } from '@/store/modal';
import { useRequest } from 'ahooks';
import {
  Button,
  Checkbox,
  DatePicker,
  Drawer,
  Form,
  Input,
  Modal,
  Select,
  Space,
  message,
} from 'antd';
import { inject, observer } from 'mobx-react';
import moment from 'moment';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './index.less';

const CheckboxGroup = Checkbox.Group;

const MAX_DATE = '9999-12-31 23:59:59';
const MAX_DATE_LABEL = '9999-12-31';

const defaultValue = {
  tables: [],
  expireTime: '7,days',
};

export const getExpireTime = (expireTime, customExpireTime, isCustomExpireTime) => {
  if (isCustomExpireTime) {
    return customExpireTime?.valueOf();
  } else {
    const [offset, unit] = expireTime.split(',') ?? [];
    return offset === 'never' ? moment(MAX_DATE)?.valueOf() : moment().add(offset, unit)?.valueOf();
  }
};

export const getExpireTimeLabel = (expireTime) => {
  const label = moment(expireTime).format('YYYY-MM-DD');
  return label === MAX_DATE_LABEL ? '永不过期' : label;
};

const Label: React.FC<{
  text: string;
  docKey: string;
}> = ({ text, docKey }) => (
  <HelpDoc leftText isTip doc={docKey}>
    {text}
  </HelpDoc>
);

export const permissionOptionsMap = {
  [TablePermissionType.QUERY]: {
    text: '查询',
    docKey: 'ApplyTablePermissionQueryTip',
    value: TablePermissionType.QUERY,
  },
  [TablePermissionType.EXPORT]: {
    text: '导出',
    docKey: 'ApplyTablePermissionExportTip',
    value: TablePermissionType.EXPORT,
  },
  [TablePermissionType.CHANGE]: {
    text: '变更',
    docKey: 'ApplyTablePermissionChangeTip',
    value: TablePermissionType.CHANGE,
  },
};

export const permissionOptions = Object.values(permissionOptionsMap)?.map(
  ({ text, docKey, ...rest }) => ({
    ...rest,
    label: <Label text={text} docKey={docKey} />,
  }),
);

export const expireTimeOptions = [
  {
    label: '7 天',
    value: '7,days',
  },
  {
    label: '30 天',
    value: '30,days',
  },
  {
    label: '90 天',
    value: '90,days',
  },
  {
    label: '半 年',
    value: '0.5,years',
  },
  {
    label: '1 年',
    value: '1,years',
  },
  {
    label: '3年',
    value: '3,years',
  },
  {
    label: '永不过期',
    value: 'never',
  },
  {
    label: '自定义',
    value: 'custom',
  },
];

interface IProps {
  modalStore?: ModalStore;
  projectId?: number;
}
const CreateModal: React.FC<IProps> = (props) => {
  const { modalStore } = props;
  const { applyTablePermissionVisible, applyTablePermissionData } = modalStore;
  const [form] = Form.useForm();
  const [hasEdit, setHasEdit] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const tableSelecterRef = useRef<TableSelecterRef>(null);
  const { run: getProjects, data: projects } = useRequest(listProjects, {
    defaultParams: [null, null, null],
  });
  const projectOptions = projects?.contents?.map(({ name, id }) => ({
    label: name,
    value: id,
  }));
  const projectId = Form.useWatch('projectId', form);

  const disabledDate = (current) => {
    return current && current < moment().endOf('day');
  };

  useEffect(() => {
    if (applyTablePermissionVisible) {
      getProjects(null, null, null);
    }
  }, [applyTablePermissionVisible, getProjects]);
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
        title: '确认取消申请表权限吗？',
        centered: true,
        onOk: () => {
          modalStore.changeApplyTablePermissionModal(false);
          hadleReset();
        },
      });
    } else {
      modalStore.changeApplyTablePermissionModal(false);
      hadleReset();
    }
  };
  const handleSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
        const { projectId, tables, types, expireTime, customExpireTime, applyReason } = values;
        const isCustomExpireTime = expireTime?.startsWith('custom');
        const parameters = {
          project: {
            id: projectId,
          },
          tables: groupTableByDataBase(tables),
          types,
          expireTime: getExpireTime(expireTime, customExpireTime, isCustomExpireTime),
          applyReason,
        };
        const data = {
          taskType: TaskType.APPLY_TABLE_PERMISSION,
          parameters,
        };
        setConfirmLoading(true);
        const res = await createTask(data);
        handleCancel(false);
        setConfirmLoading(false);
        if (res) {
          message.success('工单创建成功');
          openTasksPage(TaskPageType.APPLY_TABLE_PERMISSION, TaskPageScope.CREATED_BY_CURRENT_USER);
        }
      })
      .catch((errorInfo) => {
        console.error(JSON.stringify(errorInfo));
      });
  };

  const loadEditData = useCallback(async () => {
    const { task } = applyTablePermissionData;
    const {
      parameters: {
        project: { id: projectId },
        tables,
        types,
        applyReason,
      },
      executionStrategy,
    } = task;
    const formData = {
      ...defaultValue,
      projectId,
      executionStrategy,
      tables: flatTableByGroupedParams(tables),
      types,
      applyReason,
    };
    // 默认获取要申请权限的库下面的表，并且展开
    // 目前一个工单只会关联一个库
    const databaseId = tables?.[0]?.databaseId;
    if (projectId && databaseId) {
      tableSelecterRef.current?.loadTables(databaseId).then(() => {
        tableSelecterRef.current?.expandTable(databaseId);
      });
    }
    form.setFieldsValue(formData);
  }, [applyTablePermissionData, form]);

  const handleResetTable = () => {
    form.setFieldValue('tables', []);
  };

  useEffect(() => {
    const { projectId, databaseId, tableNames, types } = applyTablePermissionData ?? {};
    if (applyTablePermissionData?.task) {
      loadEditData();
    } else {
      const initFormValues: any = {
        projectId: projectId || props?.projectId,
        databaseId,
        // 格式化成TableSelecter value所需格式
        tables: flatTableByGroupedParams([{ databaseId, tableNames }]),
        types,
      };
      if (projectId && databaseId) {
        // 默认获取要申请权限的库下面的表，并且展开
        tableSelecterRef.current?.loadTables(databaseId).then(() => {
          tableSelecterRef.current?.expandTable(databaseId);
        });
      }
      // 默认选中要申请的表、权限类型
      form.setFieldsValue(initFormValues);
    }
  }, [applyTablePermissionData, form, loadEditData, props?.projectId]);

  return (
    <Drawer
      destroyOnClose
      className={styles.createModal}
      width={816}
      title="申请表权限"
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
      open={applyTablePermissionVisible}
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
          <Select
            showSearch
            style={{ width: 336 }}
            options={projectOptions}
            placeholder="请选择"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            onChange={handleResetTable}
          />
        </Form.Item>
        <Form.Item
          name="tables"
          label="表"
          required
          rules={[
            {
              required: true,
              message: '请选择',
            },
          ]}
        >
          <TableSelecter projectId={projectId} ref={tableSelecterRef} />
        </Form.Item>
        <Form.Item
          name="types"
          label="权限类型"
          rules={[
            {
              required: true,
              message: '请选择',
            },
          ]}
        >
          <CheckboxGroup options={permissionOptions} />
        </Form.Item>
        <Space style={{ width: '100%' }} size={60}>
          <Form.Item
            label="权限有效期"
            name="expireTime"
            rules={[
              {
                required: true,
                message: '请选择',
              },
            ]}
          >
            <Select
              style={{ width: '327px' }}
              showSearch
              placeholder="请选择"
              options={expireTimeOptions}
            />
          </Form.Item>
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const isCustomExpireTime = getFieldValue('expireTime')?.startsWith('custom');
              return (
                isCustomExpireTime && (
                  <Form.Item
                    label="结束日期"
                    name="customExpireTime"
                    rules={[
                      {
                        required: true,
                        message: '请选择',
                      },
                    ]}
                  >
                    <DatePicker disabledDate={disabledDate} style={{ width: '327px' }} />
                  </Form.Item>
                )
              );
            }}
          </Form.Item>
        </Space>
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
          <Input.TextArea rows={6} placeholder="请输出原因描述" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};
export default inject('modalStore')(observer(CreateModal));
