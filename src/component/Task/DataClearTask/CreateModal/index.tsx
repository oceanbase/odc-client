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
import { createTask, getCycleTaskDetail, previewSqlStatements } from '@/common/network/task';
import Crontab from '@/component/Crontab';
import { CrontabDateType, ICrontab, CrontabMode } from '@/component/Crontab/interface';
import DescriptionInput from '@/component/Task/component/DescriptionInput';
import {
  CreateTaskRecord,
  ICycleTaskTriggerConfig,
  ITable,
  TaskExecStrategy,
  TaskJobType,
  TaskOperationType,
  TaskPageScope,
  TaskPageType,
  TaskType,
  IDataClearJobParameters,
} from '@/d.ts';
import { openTasksPage } from '@/store/helper/page';
import type { ModalStore } from '@/store/modal';
import { useDBSession } from '@/store/sessionManager/hooks';
import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { mbToKb, kbToMb } from '@/util/utils';
import { FieldTimeOutlined } from '@ant-design/icons';
import { Button, DatePicker, Drawer, Form, Modal, Radio, Space } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useRef, useState } from 'react';
import moment from 'moment';
import DatabaseSelect from '../../component/DatabaseSelect';
import ArchiveRange from './ArchiveRange';
import styles from './index.less';
import VariableConfig from './VariableConfig';
import FormItemPanel from '@/component/FormItemPanel';
import ThrottleFormItem from '../../component/ThrottleFormItem';
import SQLPreviewModal from '../../component/SQLPreviewModal';
import { getVariableValue } from '../../DataArchiveTask/CreateModal';
export enum IArchiveRange {
  PORTION = 'portion',
  ALL = 'all',
}
export const variable = {
  name: '',
  format: '',
  pattern: [null],
};

const deleteByUniqueKeyOptions = [
  {
    label: formatMessage({ id: 'src.component.Task.DataClearTask.CreateModal.ED9CFF17' }), //'是'
    value: true,
  },
  {
    label: formatMessage({ id: 'src.component.Task.DataClearTask.CreateModal.CC3EF591' }), //'否'
    value: false,
  },
];

const defaultValue = {
  triggerStrategy: TaskExecStrategy.START_NOW,
  archiveRange: IArchiveRange.PORTION,
  tables: [null],
  rowLimit: 100,
  dataSizeLimit: 1,
  deleteByUniqueKey: false,
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
  const { dataClearVisible, dataClearTaskData } = modalStore;
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewSql, setPreviewSQL] = useState('');
  const [hasEdit, setHasEdit] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [crontab, setCrontab] = useState<ICrontab>(null);
  const [tables, setTables] = useState<ITable[]>();
  const [form] = Form.useForm();
  const databaseId = Form.useWatch('databaseId', form);
  const { session, database } = useDBSession(databaseId);
  const crontabRef = useRef<{
    setValue: (value: ICrontab) => void;
    resetFields: () => void;
  }>();
  const databaseName = database?.name;
  const editTaskId = dataClearTaskData?.id;
  const isEdit = !!editTaskId && dataClearTaskData?.type === 'EDIT';

  const loadTables = async () => {
    const tables = await getTableListByDatabaseName(session?.sessionId, databaseName);
    setTables(tables);
  };

  const loadEditData = async (editId: number) => {
    const data = await getCycleTaskDetail<IDataClearJobParameters>(editId);
    const {
      jobParameters,
      description,
      triggerConfig: { triggerStrategy, cronExpression, hours, days, startAt },
    } = data;
    const { sourceDatabaseId, rateLimit, tables, variables, deleteByUniqueKey } = jobParameters;
    const formData = {
      databaseId: sourceDatabaseId,
      rowLimit: rateLimit?.rowLimit,
      dataSizeLimit: kbToMb(rateLimit?.dataSizeLimit),
      tables,
      deleteByUniqueKey,
      variables: getVariableValue(variables),
      archiveRange: IArchiveRange.PORTION,
      triggerStrategy,
      startAt: undefined,
      description,
    };

    if (![TaskExecStrategy.START_NOW, TaskExecStrategy.START_AT].includes(triggerStrategy)) {
      formData.triggerStrategy = TaskExecStrategy.TIMER;
      const crontab = {
        mode: triggerStrategy === TaskExecStrategy.CRON ? CrontabMode.custom : CrontabMode.default,
        dateType: triggerStrategy as any,
        cronString: cronExpression,
        hour: hours,
        dayOfMonth: days,
        dayOfWeek: days,
      };
      setCrontab(crontab);
    }
    if (triggerStrategy === TaskExecStrategy.START_AT) {
      formData.startAt = moment(startAt);
    }
    form.setFieldsValue(formData);
  };
  const handleCancel = (hasEdit: boolean) => {
    if (hasEdit) {
      Modal.confirm({
        title: formatMessage({
          id: 'odc.DataClearTask.CreateModal.AreYouSureYouWant',
        }),
        //确认取消此数据清理吗？
        centered: true,
        onOk: () => {
          props.modalStore.changeDataClearModal(false);
        },
      });
    } else {
      props.modalStore.changeDataClearModal(false);
    }
  };
  const handleCrontabChange = (crontab) => {
    setCrontab(crontab);
  };
  const handleCreate = async (data: Partial<CreateTaskRecord>) => {
    const res = await createTask(data);
    setConfirmLoading(false);
    if (res) {
      handleCancel(false);
      openTasksPage(TaskPageType.DATA_DELETE, TaskPageScope.CREATED_BY_CURRENT_USER);
    }
  };
  const handleEditAndConfirm = async (data: Partial<CreateTaskRecord>) => {
    Modal.confirm({
      title: formatMessage({
        id: 'odc.DataClearTask.CreateModal.AreYouSureYouWant.1',
      }),
      //确认要修改此数据清理吗？
      content: (
        <>
          <div>
            {
              formatMessage({
                id: 'odc.DataClearTask.CreateModal.EditDataCleanup',
              }) /*编辑数据清理*/
            }
          </div>
          <div>
            {
              formatMessage({
                id: 'odc.DataClearTask.CreateModal.TheTaskNeedsToBe',
              }) /*任务需要重新审批，审批通过后此任务将重新执行*/
            }
          </div>
        </>
      ),

      cancelText: formatMessage({
        id: 'odc.DataClearTask.CreateModal.Cancel',
      }),
      //取消
      okText: formatMessage({
        id: 'odc.DataClearTask.CreateModal.Ok',
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
  const handleCloseSQLPreviewModal = () => {
    setPreviewModalVisible(false);
    setPreviewSQL('');
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
        const {
          startAt,
          databaseId,
          variables,
          tables: _tables,
          triggerStrategy,
          archiveRange,
          description,
          rowLimit,
          dataSizeLimit,
          deleteByUniqueKey,
        } = values;
        const parameters = {
          type: TaskJobType.DATA_DELETE,
          operationType: isEdit ? TaskOperationType.UPDATE : TaskOperationType.CREATE,
          taskId: editTaskId,
          scheduleTaskParameters: {
            databaseId,
            deleteByUniqueKey,
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
            rateLimit: {
              rowLimit,
              dataSizeLimit: mbToKb(dataSizeLimit),
            },
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

  const handleSQLPreview = () => {
    form
      .validateFields()
      .then(async (values) => {
        const { variables, tables: _tables, archiveRange } = values;
        const parameters = {
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
        };
        const sqls = await previewSqlStatements(parameters);
        if (sqls) {
          setPreviewModalVisible(true);
          setPreviewSQL(sqls?.join('\n'));
        }
      })
      .catch((errorInfo) => {
        console.error(JSON.stringify(errorInfo));
      });
  };

  const handleConfirmTask = () => {
    handleCloseSQLPreviewModal();
    handleSubmit();
  };

  const handleFieldsChange = () => {
    setHasEdit(true);
  };
  const handleReset = () => {
    form?.resetFields();
    setCrontab(null);
    setHasEdit(false);
  };
  const getDrawerTitle = () => {
    let title = formatMessage({ id: 'src.component.Task.DataClearTask.CreateModal.268C0069' }); //'新建数据清理'
    if (editTaskId) {
      if (isEdit) {
        title = formatMessage({ id: 'src.component.Task.DataClearTask.CreateModal.A5BAF884' });
      } else {
        title = formatMessage({ id: 'src.component.Task.DataClearTask.CreateModal.2856A9BB' });
      }
    }
    return title;
  };
  useEffect(() => {
    if (!dataClearVisible) {
      handleReset();
    }
  }, [dataClearVisible]);
  useEffect(() => {
    if (database?.id) {
      loadTables();
      form.setFieldValue('tables', [null]);
    }
  }, [database?.id]);

  useEffect(() => {
    if (editTaskId) {
      loadEditData(editTaskId);
    }
  }, [editTaskId]);

  return (
    <Drawer
      destroyOnClose
      className={styles['data-archive']}
      width={760}
      title={getDrawerTitle()}
      footer={
        <Space>
          <Button
            onClick={() => {
              handleCancel(hasEdit);
            }}
          >
            {
              formatMessage({
                id: 'odc.DataClearTask.CreateModal.Cancel',
              }) /*取消*/
            }
          </Button>
          <Button type="primary" loading={confirmLoading} onClick={handleSQLPreview}>
            {
              isEdit
                ? formatMessage({
                    id: 'odc.DataClearTask.CreateModal.Save',
                  }) //保存
                : formatMessage({
                    id: 'odc.DataClearTask.CreateModal.Create',
                  }) //新建
            }
          </Button>
        </Space>
      }
      open={dataClearVisible}
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
            type={TaskType.DATA_DELETE}
            label={formatMessage({
              id: 'odc.DataClearTask.CreateModal.SourceDatabase',
            })}
            /*源端数据库*/ projectId={projectId}
          />
        </Space>
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <ArchiveRange tables={tables} />
          <VariableConfig form={form} />
        </Space>
        <Form.Item
          label={formatMessage({
            id: 'odc.DataClearTask.CreateModal.ExecutionMethod',
          })}
          /*执行方式*/ name="triggerStrategy"
          required
        >
          <Radio.Group>
            <Radio.Button value={TaskExecStrategy.START_NOW}>
              {
                formatMessage({
                  id: 'odc.DataClearTask.CreateModal.ExecuteNow',
                }) /*立即执行*/
              }
            </Radio.Button>
            {!isClient() ? (
              <Radio.Button value={TaskExecStrategy.START_AT}>
                {
                  formatMessage({
                    id: 'odc.DataClearTask.CreateModal.ScheduledExecution',
                  }) /*定时执行*/
                }
              </Radio.Button>
            ) : null}
            <Radio.Button value={TaskExecStrategy.TIMER}>
              {
                formatMessage({
                  id: 'odc.DataClearTask.CreateModal.PeriodicExecution',
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
                <Form.Item name="startAt">
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
              id: 'odc.src.component.Task.DataClearTask.CreateModal.TaskSetting',
            }) /* 任务设置 */
          }
          keepExpand
        >
          <ThrottleFormItem />
          <Form.Item
            label={
              formatMessage({
                id: 'src.component.Task.DataClearTask.CreateModal.99D8FCD6',
              }) /*"使用主键清理"*/
            }
            name="deleteByUniqueKey"
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'src.component.Task.DataClearTask.CreateModal.23542D89',
                }), //'请选择'
              },
            ]}
          >
            <Radio.Group options={deleteByUniqueKeyOptions} />
          </Form.Item>
        </FormItemPanel>
        <DescriptionInput />
      </Form>
      <SQLPreviewModal
        sql={previewSql}
        visible={previewModalVisible}
        onClose={handleCloseSQLPreviewModal}
        onOk={handleConfirmTask}
      />
    </Drawer>
  );
};
export default inject('modalStore')(observer(CreateModal));
