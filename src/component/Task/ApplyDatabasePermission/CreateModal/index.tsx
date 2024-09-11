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
import HelpDoc from '@/component/helpDoc';
import DatabaseSelecter from '@/component/Task/component/DatabaseSelecter';
import { TaskPageScope, TaskPageType, TaskType } from '@/d.ts';
import { DatabasePermissionType } from '@/d.ts/database';
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
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import styles from './index.less';

const CheckboxGroup = Checkbox.Group;

const MAX_DATE = '9999-12-31 23:59:59';
const MAX_DATE_LABEL = '9999-12-31';

const defaultValue = {
  databases: [],
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
  return label === MAX_DATE_LABEL
    ? formatMessage({
        id: 'src.component.Task.ApplyDatabasePermission.CreateModal.B5C7760D',
        defaultMessage: '永不过期',
      })
    : label;
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
  [DatabasePermissionType.QUERY]: {
    text: formatMessage({
      id: 'src.component.Task.ApplyDatabasePermission.CreateModal.8890FE39',
      defaultMessage: '查询',
    }), //'查询'
    docKey: 'ApplyDatabasePermissionQueryTip',
    value: DatabasePermissionType.QUERY,
  },
  [DatabasePermissionType.EXPORT]: {
    text: formatMessage({
      id: 'src.component.Task.ApplyDatabasePermission.CreateModal.3B7A9E11',
      defaultMessage: '导出',
    }), //'导出'
    docKey: 'ApplyDatabasePermissionExportTip',
    value: DatabasePermissionType.EXPORT,
  },
  [DatabasePermissionType.CHANGE]: {
    text: formatMessage({
      id: 'src.component.Task.ApplyDatabasePermission.CreateModal.985A0E7F',
      defaultMessage: '变更',
    }), //'变更'
    docKey: 'ApplyDatabasePermissionChangeTip',
    value: DatabasePermissionType.CHANGE,
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
    label: formatMessage({
      id: 'src.component.Task.ApplyDatabasePermission.CreateModal.A3DBC09F',
      defaultMessage: '7 天',
    }), //'7 天'
    value: '7,days',
  },
  {
    label: formatMessage({
      id: 'src.component.Task.ApplyDatabasePermission.CreateModal.B4654D83',
      defaultMessage: '30 天',
    }), //'30 天'
    value: '30,days',
  },
  {
    label: formatMessage({
      id: 'src.component.Task.ApplyDatabasePermission.CreateModal.44988077',
      defaultMessage: '90 天',
    }), //'90 天'
    value: '90,days',
  },
  {
    label: formatMessage({
      id: 'src.component.Task.ApplyDatabasePermission.CreateModal.A383B626',
      defaultMessage: '半年',
    }), //'半年'
    value: '0.5,years',
  },
  {
    label: formatMessage({
      id: 'src.component.Task.ApplyDatabasePermission.CreateModal.87E335B0',
      defaultMessage: '1 年',
    }), //'1 年'
    value: '1,years',
  },
  {
    label: formatMessage({
      id: 'src.component.Task.ApplyDatabasePermission.CreateModal.1758E31F',
      defaultMessage: '3 年',
    }), //'3 年'
    value: '3,years',
  },
  {
    label: formatMessage({
      id: 'src.component.Task.ApplyDatabasePermission.CreateModal.35CFABDC',
      defaultMessage: '永不过期',
    }), //'永不过期'
    value: 'never',
  },
  {
    label: formatMessage({
      id: 'src.component.Task.ApplyDatabasePermission.CreateModal.1AAFDFFB',
      defaultMessage: '自定义',
    }), //'自定义'
    value: 'custom',
  },
];

interface IProps {
  modalStore?: ModalStore;
  projectId?: number;
}
const CreateModal: React.FC<IProps> = (props) => {
  const { modalStore } = props;
  const { applyDatabasePermissionVisible, applyDatabasePermissionData } = modalStore;
  const [form] = Form.useForm();
  const [hasEdit, setHasEdit] = useState(false);
  const [showSelectTip, setShowSelectTip] = useState(false);
  const [showSelectLogicDBTip, setShowSelectLogicDBTip] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const { run: getProjects, data: projects } = useRequest(listProjects, {
    defaultParams: [null, null, null],
  });
  const projectOptions = projects?.contents?.map(({ name, id }) => ({
    label: name,
    value: id,
  }));
  const projectId = Form.useWatch('projectId', form);

  const disabledDate = (current) => {
    return current && current < moment().subtract(1, 'days').endOf('day');
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
        };
        const data = {
          taskType: TaskType.APPLY_DATABASE_PERMISSION,
          parameters,
        };
        setConfirmLoading(true);
        const res = await createTask(data);
        handleCancel(false);
        setConfirmLoading(false);
        if (res) {
          message.success(
            formatMessage({
              id: 'src.component.Task.ApplyDatabasePermission.CreateModal.8B9755E4' /*'工单创建成功'*/,
              defaultMessage: '工单创建成功',
            }),
          );
          openTasksPage(
            TaskPageType.APPLY_DATABASE_PERMISSION,
            TaskPageScope.CREATED_BY_CURRENT_USER,
          );
        }
      })
      .catch((errorInfo) => {
        console.error(JSON.stringify(errorInfo));
      });
  };

  const loadEditData = async () => {
    const { task } = applyDatabasePermissionData;
    const {
      parameters: {
        project: { id: projectId },
        databases,
        types,
        applyReason,
      },
      executionStrategy,
    } = task;
    const formData = {
      ...defaultValue,
      projectId,
      executionStrategy,
      databases: databases?.map((item) => item.id),
      types,
      applyReason,
    };
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
      destroyOnClose
      className={styles.createModal}
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
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'src.component.Task.ApplyDatabasePermission.CreateModal.564E6CF8',
                defaultMessage: '请选择项目',
              }), //'请选择项目'
            },
          ]}
        >
          <Select
            showSearch
            style={{ width: 336 }}
            options={projectOptions}
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
                    id: 'src.component.Task.ApplyDatabasePermission.CreateModal.2137546E',
                    defaultMessage:
                      '多个数据库的权限申请将被拆分为多个工单进行审批，最多仅支持选择 10 个数据库',
                  })}
                  type="info"
                  showIcon
                  style={{ margin: '4px 0px' }}
                />
              )}
            </div>
          }
        >
          <DatabaseSelecter
            projectId={projectId}
            maxCount={10}
            setShowSelectLogicDBTip={setShowSelectLogicDBTip}
          />
        </Form.Item>
        {showSelectLogicDBTip && (
          <Alert
            message="已选数据库中包含逻辑库，审批通过后将默认获得关联物理库的权限；逻辑库仅支持 DDL 变更。"
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
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'src.component.Task.ApplyDatabasePermission.CreateModal.75126DC3',
                defaultMessage: '请选择',
              }), //'请选择'
            },
          ]}
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
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'src.component.Task.ApplyDatabasePermission.CreateModal.3A596C86',
                defaultMessage: '请选择',
              }), //'请选择'
            },
          ]}
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
                  rules={[
                    {
                      required: true,
                      message: formatMessage({
                        id: 'src.component.Task.ApplyDatabasePermission.CreateModal.5FDEC16A',
                        defaultMessage: '请选择',
                      }), //'请选择'
                    },
                  ]}
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
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'src.component.Task.ApplyDatabasePermission.CreateModal.B0247EF7',
                defaultMessage: '请输入原因描述',
              }), //'请输入原因描述'
            },
            {
              max: 200,
              message: formatMessage({
                id: 'src.component.Task.ApplyDatabasePermission.CreateModal.7BD59E12',
                defaultMessage: '申请原因不超过 200 个字符',
              }), //'申请原因不超过 200 个字符'
            },
          ]}
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
