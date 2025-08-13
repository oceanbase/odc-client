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
import TableSelecter from '@/component/Task/component/TableSelecter';
import { TableSelecterRef } from '@/component/Task/component/TableSelecter/interface';
import {
  flatTableByGroupedParams,
  groupTableByDataBase,
} from '@/component/Task/component/TableSelecter/util';
import { TaskPageType, TaskType } from '@/d.ts';
import { TablePermissionType } from '@/d.ts/table';
import { openTasksPage } from '@/store/helper/page';
import type { ModalStore } from '@/store/modal';
import { useRequest } from 'ahooks';
import {
  Button,
  Checkbox,
  DatePicker,
  Drawer,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
} from 'antd';
import { inject, observer } from 'mobx-react';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './index.less';
import { rules } from './const';
import { getExpireTime } from '@/component/Task/helper';

const CheckboxGroup = Checkbox.Group;

const defaultValue = {
  tables: [],
  expireTime: '7,days',
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
    text: formatMessage({
      id: 'src.component.Task.ApplyTablePermission.CreateModal.82C8FE0E',
      defaultMessage: '查询',
    }),
    docKey: 'ApplyTablePermissionQueryTip',
    value: TablePermissionType.QUERY,
  },
  [TablePermissionType.EXPORT]: {
    text: formatMessage({
      id: 'src.component.Task.ApplyTablePermission.CreateModal.E26609A0',
      defaultMessage: '导出',
    }),
    docKey: 'ApplyTablePermissionExportTip',
    value: TablePermissionType.EXPORT,
  },
  [TablePermissionType.CHANGE]: {
    text: formatMessage({
      id: 'src.component.Task.ApplyTablePermission.CreateModal.D802CFB3',
      defaultMessage: '变更',
    }),
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
    label: formatMessage({
      id: 'src.component.Task.ApplyTablePermission.CreateModal.F357A49C',
      defaultMessage: '7 天',
    }),
    value: '7,days',
  },
  {
    label: formatMessage({
      id: 'src.component.Task.ApplyTablePermission.CreateModal.DFADB0AB',
      defaultMessage: '30 天',
    }),
    value: '30,days',
  },
  {
    label: formatMessage({
      id: 'src.component.Task.ApplyTablePermission.CreateModal.E06F8910',
      defaultMessage: '90 天',
    }),
    value: '90,days',
  },
  {
    label: formatMessage({
      id: 'src.component.Task.ApplyTablePermission.CreateModal.76C327CA',
      defaultMessage: '半 年',
    }),
    value: '0.5,years',
  },
  {
    label: formatMessage({
      id: 'src.component.Task.ApplyTablePermission.CreateModal.D6E6AE6E',
      defaultMessage: '1 年',
    }),
    value: '1,years',
  },
  {
    label: formatMessage({
      id: 'src.component.Task.ApplyTablePermission.CreateModal.A004AEF5',
      defaultMessage: '3年',
    }),
    value: '3,years',
  },
  {
    label: formatMessage({
      id: 'src.component.Task.ApplyTablePermission.CreateModal.705AE4C3',
      defaultMessage: '永不过期',
    }),
    value: 'never',
  },
  {
    label: formatMessage({
      id: 'src.component.Task.ApplyTablePermission.CreateModal.F4D36D95',
      defaultMessage: '自定义',
    }),
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
    manual: true,
  });
  const projectOptions = projects?.contents?.map(({ name, id }) => ({
    label: name,
    value: id,
  }));
  const projectId = Form.useWatch('projectId', form);

  const disabledDate = (current) => {
    return current && current < dayjs().subtract(1, 'days').endOf('day');
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
        zIndex: 1003,
        title: formatMessage({
          id: 'src.component.Task.ApplyTablePermission.CreateModal.7996D498',
          defaultMessage: '确认取消申请表/视图权限吗？',
        }),
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
        const allLoadedTables = tableSelecterRef.current
          .getAllLoadedTables()
          .map((table) => table.id);
        const allLoadedTablesSet = new Set(allLoadedTables);
        const filteredTables = tables.filter((table) => allLoadedTablesSet.has(table.tableId));
        const parameters = {
          project: {
            id: projectId,
          },
          tables: groupTableByDataBase(filteredTables),
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
          message.success(
            formatMessage({
              id: 'src.component.Task.ApplyTablePermission.CreateModal.0D449988',
              defaultMessage: '工单创建成功',
            }),
          );
          openTasksPage(TaskPageType.APPLY_TABLE_PERMISSION);
        }
      })
      .catch((errorInfo) => {
        form.scrollToField(errorInfo?.errorFields?.[0]?.name);
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

    const tableList = tables.map((i) => {
      return { databaseId: i.databaseId, tableList: [{ name: i.tableName, id: i.tableId }] };
    });

    const formData = {
      ...defaultValue,
      projectId,
      executionStrategy,
      tables: flatTableByGroupedParams(tableList),
      types,
      applyReason,
    };
    // 默认获取要申请权限的库下面的表，并且展开
    const databaseIds = [...new Set(tables?.map((table) => table.databaseId).filter(Boolean))];
    if (projectId && databaseIds.length) {
      await tableSelecterRef.current?.loadDatabases();
      await Promise.all(
        databaseIds.map(async (databaseId) => {
          await tableSelecterRef.current?.loadTables(databaseId);
          tableSelecterRef.current?.expandTable(databaseId);
        }),
      );
    }
    form.setFieldsValue(formData);
  }, [applyTablePermissionData, form]);

  const handleResetTable = () => {
    form.setFieldValue('tables', []);
  };

  useEffect(() => {
    const { projectId, databaseId, tableName, types, tableId } = applyTablePermissionData ?? {};
    if (applyTablePermissionData?.task) {
      loadEditData();
    } else {
      const initFormValues: any = {
        projectId: projectId || props?.projectId,
        databaseId,
        // 格式化成TableSelecter value所需格式
        tables: tableId
          ? flatTableByGroupedParams([
              { databaseId, tableList: [{ name: tableName, id: tableId }] },
            ])
          : [],
        types,
      };
      if (projectId && databaseId) {
        // 默认获取要申请权限的库下面的表，并且展开
        tableSelecterRef.current?.loadDatabases()?.then(() => {
          tableSelecterRef.current?.loadTables(databaseId).then(() => {
            tableSelecterRef.current?.expandTable(databaseId);
          });
        });
      }
      // 默认选中要申请的表、权限类型
      form.setFieldsValue(initFormValues);
    }
  }, [applyTablePermissionData, form, loadEditData, props?.projectId]);

  const applyProjectPermission = () => {
    handleCancel(hasEdit);
    openTasksPage(TaskPageType.APPLY_PROJECT_PERMISSION);
  };

  const projectEmptyRender = () => {
    return (
      <div className={styles.projectEmptyBox}>
        <Empty
          description={false}
          imageStyle={{
            height: 72,
          }}
        />

        <span>
          {formatMessage({
            id: 'src.component.Task.ApplyTablePermission.CreateModal.8955ACFE',
            defaultMessage: '暂无项目，请先',
          })}

          <Button type="link" onClick={applyProjectPermission}>
            {formatMessage({
              id: 'src.component.Task.ApplyTablePermission.CreateModal.DEF52B23',
              defaultMessage: '加入项目',
            })}
          </Button>
        </span>
      </div>
    );
  };
  return (
    <Drawer
      zIndex={1002}
      destroyOnClose
      rootClassName={styles.createModal}
      width={816}
      title={formatMessage({
        id: 'src.component.Task.ApplyTablePermission.CreateModal.365A2D85',
        defaultMessage: '申请表/视图权限',
      })}
      footer={
        <Space>
          <Button
            onClick={() => {
              handleCancel(hasEdit);
            }}
          >
            {formatMessage({
              id: 'src.component.Task.ApplyTablePermission.CreateModal.95EB40E7',
              defaultMessage: '取消',
            })}
          </Button>
          <Button type="primary" loading={confirmLoading} onClick={handleSubmit}>
            {formatMessage({
              id: 'src.component.Task.ApplyTablePermission.CreateModal.AB5C56FA',
              defaultMessage: '新建',
            })}
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
          label={formatMessage({
            id: 'src.component.Task.ApplyTablePermission.CreateModal.524AEC5C',
            defaultMessage: '项目',
          })}
          name="projectId"
          rules={rules.projectId}
        >
          <Select
            showSearch
            style={{ width: 336 }}
            options={projectOptions}
            placeholder={formatMessage({
              id: 'src.component.Task.ApplyTablePermission.CreateModal.DC9A3E27',
              defaultMessage: '请选择',
            })}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            onChange={handleResetTable}
            notFoundContent={projectEmptyRender()}
          />
        </Form.Item>
        <Form.Item
          name="tables"
          label={formatMessage({
            id: 'src.component.Task.ApplyTablePermission.CreateModal.50184403',
            defaultMessage: '表/视图',
          })}
          required
          rules={rules.tables}
        >
          <TableSelecter projectId={projectId} ref={tableSelecterRef} />
        </Form.Item>
        <Form.Item
          name="types"
          label={formatMessage({
            id: 'src.component.Task.ApplyTablePermission.CreateModal.3BCFDC84',
            defaultMessage: '权限类型',
          })}
          rules={rules.types}
        >
          <CheckboxGroup options={permissionOptions} />
        </Form.Item>
        <Space style={{ width: '100%' }} size={60}>
          <Form.Item
            label={formatMessage({
              id: 'src.component.Task.ApplyTablePermission.CreateModal.472B1735',
              defaultMessage: '权限有效期',
            })}
            name="expireTime"
            rules={rules.expireTime}
          >
            <Select
              style={{ width: '327px' }}
              showSearch
              placeholder={formatMessage({
                id: 'src.component.Task.ApplyTablePermission.CreateModal.A206D2B4',
                defaultMessage: '请选择',
              })}
              options={expireTimeOptions}
            />
          </Form.Item>
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const isCustomExpireTime = getFieldValue('expireTime')?.startsWith('custom');
              return (
                isCustomExpireTime && (
                  <Form.Item
                    label={formatMessage({
                      id: 'src.component.Task.ApplyTablePermission.CreateModal.06672C99',
                      defaultMessage: '结束日期',
                    })}
                    name="customExpireTime"
                    rules={rules.customExpireTime}
                  >
                    <DatePicker disabledDate={disabledDate} style={{ width: '327px' }} />
                  </Form.Item>
                )
              );
            }}
          </Form.Item>
        </Space>
        <Form.Item
          label={formatMessage({
            id: 'src.component.Task.ApplyTablePermission.CreateModal.B2D5729B',
            defaultMessage: '申请原因',
          })}
          name="applyReason"
          rules={rules.applyReason}
        >
          <Input.TextArea
            rows={6}
            placeholder={formatMessage({
              id: 'src.component.Task.ApplyTablePermission.CreateModal.8B90F708',
              defaultMessage: '请输出原因描述',
            })}
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};
export default inject('modalStore')(observer(CreateModal));
