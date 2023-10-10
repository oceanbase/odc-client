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

import { getTableListByDatabaseName } from '@/common/network/table';
import { createTask } from '@/common/network/task';
import Crontab from '@/component/Crontab';
import { CrontabDateType, ICrontab } from '@/component/Crontab/interface';
import FormItemPanel from '@/component/FormItemPanel';
import DescriptionInput from '@/component/Task/component/DescriptionInput';
import {
  CreateTaskRecord,
  ICycleTaskTriggerConfig,
  ITable,
  MigrationInsertAction,
  TaskExecStrategy,
  TaskOperationType,
  TaskPageScope,
  TaskPageType,
  TaskType,
} from '@/d.ts';
import { openTasksPage } from '@/store/helper/page';
import type { ModalStore } from '@/store/modal';
import { useDBSession } from '@/store/sessionManager/hooks';
import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { FieldTimeOutlined } from '@ant-design/icons';
import { Button, Checkbox, DatePicker, Drawer, Form, Modal, Radio, Space } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useRef, useState } from 'react';
import DatabaseSelect from '../../component/DatabaseSelect';
import ArchiveRange from './ArchiveRange';
import styles from './index.less';
import VariableConfig from './VariableConfig';
export enum IArchiveRange {
  PORTION = 'portion',
  ALL = 'all',
}
export const InsertActionOptions = [
  {
    label: formatMessage({
      id: 'odc.src.component.Task.DataArchiveTask.CreateModal.IgnoreWhenRepeated',
    }), //'重复时忽略'
    value: MigrationInsertAction.INSERT_IGNORE,
  },
  {
    label: formatMessage({
      id: 'odc.src.component.Task.DataArchiveTask.CreateModal.UpdateWhenRepeated',
    }), //'重复时更新'
    value: MigrationInsertAction.INSERT_DUPLICATE_UPDATE,
  },
];
export const variable = {
  name: '',
  format: '',
  pattern: [null],
};
const defaultValue = {
  triggerStrategy: TaskExecStrategy.START_NOW,
  archiveRange: IArchiveRange.PORTION,
  variables: [variable],
  tables: [null],
  migrationInsertAction: MigrationInsertAction.INSERT_IGNORE,
};
interface IProps {
  modalStore?: ModalStore;
  projectId?: number;
}
const getVariables = (
  value: {
    name: string;
    format: string;
    pattern: {
      operator: string;
      step: number;
      unit: string;
    }[];
  }[],
) => {
  return value?.map(({ name, format, pattern }) => {
    let _pattern = null;
    try {
      _pattern = pattern
        ?.map((item) => {
          return `${item.operator}${item.step}${item.unit}`;
        })
        ?.join(' ');
    } catch (error) {}
    return {
      name,
      pattern: `${format}|${_pattern}`,
    };
  });
};
const CreateModal: React.FC<IProps> = (props) => {
  const { modalStore, projectId } = props;
  const [formData, setFormData] = useState(null);
  const [hasEdit, setHasEdit] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [crontab, setCrontab] = useState<ICrontab>(null);
  const [tables, setTables] = useState<ITable[]>();
  const [form] = Form.useForm();
  const databaseId = Form.useWatch('databaseId', form);
  const { session, database } = useDBSession(databaseId);
  const databaseName = database?.name;
  const loadTables = async () => {
    const tables = await getTableListByDatabaseName(session?.sessionId, databaseName);
    setTables(tables);
  };
  const crontabRef = useRef<{
    setValue: (value: ICrontab) => void;
    resetFields: () => void;
  }>();
  const { dataArchiveVisible, SQLPlanEditId } = modalStore;
  const isEdit = !!SQLPlanEditId;
  const setFormStatus = (fieldName: string, errorMessage: string) => {
    form.setFields([
      {
        name: [fieldName],
        errors: errorMessage ? [errorMessage] : [],
      },
    ]);
  };
  const handleCancel = (hasEdit: boolean) => {
    if (hasEdit) {
      Modal.confirm({
        title: formatMessage({
          id: 'odc.DataArchiveTask.CreateModal.AreYouSureYouWant',
        }),
        //确认取消此 数据归档吗？
        centered: true,
        onOk: () => {
          props.modalStore.changeDataArchiveModal(false);
        },
      });
    } else {
      props.modalStore.changeDataArchiveModal(false);
    }
  };
  const handleCrontabChange = (crontab) => {
    setCrontab(crontab);
  };
  const handleCreate = async (data: Partial<CreateTaskRecord>) => {
    const res = await createTask(data);
    handleCancel(false);
    setConfirmLoading(false);
    if (res) {
      openTasksPage(TaskPageType.DATA_ARCHIVE, TaskPageScope.CREATED_BY_CURRENT_USER);
    }
  };
  const handleEditAndConfirm = async (data: Partial<CreateTaskRecord>) => {
    Modal.confirm({
      title: formatMessage({
        id: 'odc.DataArchiveTask.CreateModal.AreYouSureYouWant.1',
      }),
      //确认要修改此 数据归档吗？
      content: (
        <>
          <div>
            {
              formatMessage({
                id: 'odc.DataArchiveTask.CreateModal.EditDataArchive',
              }) /*编辑数据归档*/
            }
          </div>
          <div>
            {
              formatMessage({
                id: 'odc.DataArchiveTask.CreateModal.TheTaskNeedsToBe',
              }) /*任务需要重新审批，审批通过后此任务将重新执行*/
            }
          </div>
        </>
      ),
      cancelText: formatMessage({
        id: 'odc.DataArchiveTask.CreateModal.Cancel',
      }),
      //取消
      okText: formatMessage({
        id: 'odc.DataArchiveTask.CreateModal.Ok',
      }),
      //确定
      centered: true,
      onOk: () => {
        handleCreate(data);
      },
      onCancel: () => {
        setConfirmLoading(false);
      },
    });
  };
  const handleSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
        const {
          startAt,
          databaseId,
          targetDatabase,
          variables,
          tables: _tables,
          deleteAfterMigration,
          triggerStrategy,
          migrationInsertAction,
          archiveRange,
          description,
        } = values;
        const parameters = {
          type: TaskType.MIGRATION,
          operationType: isEdit ? TaskOperationType.UPDATE : TaskOperationType.CREATE,
          taskId: SQLPlanEditId,
          scheduleTaskParameters: {
            sourceDatabaseId: databaseId,
            targetDataBaseId: targetDatabase,
            variables: getVariables(variables),
            tables:
              archiveRange === IArchiveRange.ALL
                ? tables?.map((item) => {
                    return {
                      tableName: item?.tableName,
                      conditionExpression: '',
                    };
                  })
                : _tables,
            deleteAfterMigration,
            migrationInsertAction,
          },
          triggerConfig: {
            triggerStrategy,
          } as ICycleTaskTriggerConfig,
        };
        if (triggerStrategy === TaskExecStrategy.TIMER) {
          const { mode, dateType, cronString, hour, dayOfMonth, dayOfWeek } = crontab;
          parameters.triggerConfig = {
            triggerStrategy: (mode === 'custom' ? 'CRON' : dateType) as TaskExecStrategy,
            days: dateType === CrontabDateType.weekly ? dayOfWeek : dayOfMonth,
            hours: hour,
            cronExpression: cronString,
          };
        } else if (triggerStrategy === TaskExecStrategy.START_AT) {
          parameters.triggerConfig = {
            triggerStrategy: TaskExecStrategy.START_AT,
            startAt: startAt?.valueOf(),
          };
        }
        const data = {
          databaseId,
          taskType: TaskType.ALTER_SCHEDULE,
          parameters,
          description,
        };
        setConfirmLoading(true);
        if (!isEdit) {
          delete parameters.taskId;
        }
        if (isEdit) {
          handleEditAndConfirm(data);
        } else {
          handleCreate(data);
        }
      })
      .catch((errorInfo) => {
        console.error(JSON.stringify(errorInfo));
      });
  };
  const handleFieldsChange = () => {
    setHasEdit(true);
  };
  const handleReset = () => {
    setFormData(null);
    form?.resetFields();
    crontabRef.current?.resetFields();
  };
  useEffect(() => {
    if (!dataArchiveVisible) {
      handleReset();
    }
  }, [dataArchiveVisible]);
  useEffect(() => {
    if (database?.id) {
      loadTables();
      form.setFieldValue('tables', [null]);
    }
  }, [database?.id]);
  return (
    <Drawer
      destroyOnClose
      className={styles['data-archive']}
      width={760}
      title={
        isEdit
          ? formatMessage({
              id: 'odc.DataArchiveTask.CreateModal.EditDataArchive',
            }) //编辑数据归档
          : formatMessage({
              id: 'odc.DataArchiveTask.CreateModal.CreateADataArchive',
            }) //新建数据归档
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
                id: 'odc.DataArchiveTask.CreateModal.Cancel',
              }) /*取消*/
            }
          </Button>
          <Button type="primary" loading={confirmLoading} onClick={handleSubmit}>
            {
              isEdit
                ? formatMessage({
                    id: 'odc.DataArchiveTask.CreateModal.Save',
                  }) //保存
                : formatMessage({
                    id: 'odc.DataArchiveTask.CreateModal.Create',
                  }) //新建
            }
          </Button>
        </Space>
      }
      open={dataArchiveVisible}
      onClose={() => {
        handleCancel(hasEdit);
      }}
    >
      <Form
        form={form}
        name="basic"
        layout="vertical"
        requiredMark="optional"
        initialValues={defaultValue}
        onFieldsChange={handleFieldsChange}
      >
        <Space align="start">
          <DatabaseSelect
            type={TaskType.DATA_ARCHIVE}
            label={formatMessage({
              id: 'odc.DataArchiveTask.CreateModal.SourceDatabase',
            })}
            /*源端数据库*/ projectId={projectId}
          />

          <DatabaseSelect
            type={TaskType.DATA_ARCHIVE}
            label={formatMessage({
              id: 'odc.DataArchiveTask.CreateModal.TargetDatabase',
            })}
            /*目标数据库*/ name="targetDatabase"
            projectId={projectId}
          />
        </Space>
        <VariableConfig />
        <ArchiveRange tables={tables} />
        <Form.Item name="deleteAfterMigration" valuePropName="checked">
          <Checkbox>
            <Space>
              {
                formatMessage({
                  id: 'odc.DataArchiveTask.CreateModal.CleanUpArchivedDataFrom',
                }) /*清理源端已归档数据*/
              }

              <span className={styles.desc}>
                {
                  formatMessage({
                    id: 'odc.DataArchiveTask.CreateModal.IfYouCleanUpThe',
                  }) /*若您进行清理，默认立即清理且不做备份；清理任务完成后支持回滚*/
                }
              </span>
            </Space>
          </Checkbox>
        </Form.Item>
        <Form.Item
          label={formatMessage({
            id: 'odc.DataArchiveTask.CreateModal.ExecutionMethod',
          })}
          /*执行方式*/ name="triggerStrategy"
          required
        >
          <Radio.Group>
            <Radio.Button value={TaskExecStrategy.START_NOW}>
              {
                formatMessage({
                  id: 'odc.DataArchiveTask.CreateModal.ExecuteNow',
                }) /*立即执行*/
              }
            </Radio.Button>
            {!isClient() ? (
              <Radio.Button value={TaskExecStrategy.START_AT}>
                {
                  formatMessage({
                    id: 'odc.DataArchiveTask.CreateModal.ScheduledExecution',
                  }) /*定时执行*/
                }
              </Radio.Button>
            ) : null}
            <Radio.Button value={TaskExecStrategy.TIMER}>
              {
                formatMessage({
                  id: 'odc.DataArchiveTask.CreateModal.PeriodicExecution',
                }) /*周期执行*/
              }
            </Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item shouldUpdate noStyle>
          {({ getFieldValue }) => {
            const triggerStrategy = getFieldValue('triggerStrategy') || [];
            if (triggerStrategy === TaskExecStrategy.START_AT) {
              return (
                <Form.Item
                  name="startAt"
                  label={formatMessage({
                    id: 'odc.DataArchiveTask.CreateModal.ExecutionTime',
                  })}
                  /*执行时间*/ required
                >
                  <DatePicker showTime suffixIcon={<FieldTimeOutlined />} />
                </Form.Item>
              );
            }
            if (triggerStrategy === TaskExecStrategy.TIMER) {
              return (
                <Form.Item>
                  <Crontab
                    ref={crontabRef}
                    initialValue={crontab}
                    onValueChange={handleCrontabChange}
                  />
                </Form.Item>
              );
            }
            return null;
          }}
        </Form.Item>
        <FormItemPanel
          label={
            formatMessage({
              id: 'odc.src.component.Task.DataArchiveTask.CreateModal.TaskSetting',
            }) /* 任务设置 */
          }
          keepExpand
        >
          <Form.Item
            label={
              formatMessage({
                id: 'odc.src.component.Task.DataArchiveTask.CreateModal.InsertionStrategy',
              }) /* 插入策略 */
            }
            name="migrationInsertAction"
            rules={[
              {
                required: true,
                message: formatMessage({
                  id:
                    'odc.src.component.Task.DataArchiveTask.CreateModal.PleaseSelectInsertionStrategy',
                }), //'请选择插入策略'
              },
            ]}
          >
            <Radio.Group options={InsertActionOptions} />
          </Form.Item>
        </FormItemPanel>
        <DescriptionInput />
      </Form>
    </Drawer>
  );
};
export default inject('modalStore')(observer(CreateModal));
