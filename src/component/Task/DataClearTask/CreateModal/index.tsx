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
import { CrontabDateType, CrontabMode, ICrontab } from '@/component/Crontab/interface';
import FormItemPanel from '@/component/FormItemPanel';
import DescriptionInput from '@/component/Task/component/DescriptionInput';
import {
  CreateTaskRecord,
  ICycleTaskTriggerConfig,
  IDataClearJobParameters,
  ITable,
  TaskExecStrategy,
  TaskJobType,
  TaskOperationType,
  TaskPageScope,
  TaskPageType,
  TaskType,
  ShardingStrategy,
  CycleTaskDetail,
} from '@/d.ts';
import { openTasksPage } from '@/store/helper/page';
import type { ModalStore } from '@/store/modal';
import { useDBSession } from '@/store/sessionManager/hooks';
import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { hourToMilliSeconds, kbToMb, mbToKb, milliSecondsToHour } from '@/util/utils';
import { FieldTimeOutlined } from '@ant-design/icons';
import { Button, Checkbox, DatePicker, Drawer, Form, Modal, Radio, Space, Spin } from 'antd';
import { inject, observer } from 'mobx-react';
import dayjs from 'dayjs';
import React, { useEffect, useRef, useState } from 'react';
import DatabaseSelect from '../../component/DatabaseSelect';
import SQLPreviewModal from '../../component/SQLPreviewModal';
import TaskdurationItem from '../../component/TaskdurationItem';
import ThrottleFormItem from '../../component/ThrottleFormItem';
import { getVariableValue } from '../../DataArchiveTask/CreateModal';
import ArchiveRange from './ArchiveRange';
import styles from './index.less';
import VariableConfig from './VariableConfig';
import ShardingStrategyItem from '../../component/ShardingStrategyItem';
import { disabledDate, disabledTime } from '@/util/utils';
import { useRequest } from 'ahooks';
import DirtyRowAction from '../../component/DirtyRowAction';
import MaxAllowedDirtyRowCount from '../../component/MaxAllowedDirtyRowCount';
import ExecuteFailTip from '../../component/ExecuteFailTip';

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
    label: formatMessage({
      id: 'src.component.Task.DataClearTask.CreateModal.ED9CFF17',
      defaultMessage: '是',
    }), //'是'
    value: true,
  },
  {
    label: formatMessage({
      id: 'src.component.Task.DataClearTask.CreateModal.CC3EF591',
      defaultMessage: '否',
    }), //'否'
    value: false,
  },
];

const defaultValue = {
  triggerStrategy: TaskExecStrategy.START_NOW,
  archiveRange: IArchiveRange.PORTION,
  shardingStrategy: ShardingStrategy.FIXED_LENGTH,
  tables: [null],
  rowLimit: 100,
  dataSizeLimit: 1,
  deleteByUniqueKey: true,
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
  const [enablePartition, setEnablePartition] = useState<boolean>(false);
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

  const { run: fetchCycleTaskDetail, loading } = useRequest(getCycleTaskDetail, { manual: true });

  const loadEditData = async (editId: number) => {
    const data = (await fetchCycleTaskDetail(editId)) as CycleTaskDetail<IDataClearJobParameters>;

    const {
      jobParameters,
      description,
      triggerConfig: { triggerStrategy, cronExpression, hours, days, startAt },
    } = data;
    const {
      databaseId,
      rateLimit,
      shardingStrategy,
      tables,
      variables,
      deleteByUniqueKey,
      needCheckBeforeDelete,
      targetDatabaseId,
      timeoutMillis,
      dirtyRowAction,
      maxAllowedDirtyRowCount,
      fullDatabase,
    } = jobParameters;
    setEnablePartition(!!tables?.find((i) => i?.partitions?.length));
    const formData = {
      databaseId,
      rowLimit: rateLimit?.rowLimit,
      dataSizeLimit: kbToMb(rateLimit?.dataSizeLimit),
      tables: tables?.map((i) => {
        i.partitions = (i?.partitions as [])?.join(',');
        return i;
      }),
      shardingStrategy,
      deleteByUniqueKey,
      variables: getVariableValue(variables),
      archiveRange: fullDatabase ? IArchiveRange.ALL : IArchiveRange.PORTION,
      triggerStrategy,
      startAt: undefined,
      description,
      needCheckBeforeDelete,
      targetDatabaseId,
      timeoutMillis: milliSecondsToHour(timeoutMillis),
      dirtyRowAction,
      maxAllowedDirtyRowCount,
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
      formData.startAt = dayjs(startAt);
    }
    form.setFieldsValue(formData);
  };
  const handleCancel = (hasEdit: boolean) => {
    if (hasEdit) {
      Modal.confirm({
        title: formatMessage({
          id: 'odc.DataClearTask.CreateModal.AreYouSureYouWant',
          defaultMessage: '是否确认取消此数据清理？',
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
        defaultMessage: '是否确认修改此数据清理？',
      }),
      //确认要修改此数据清理吗？
      content: (
        <>
          <div>
            {
              formatMessage({
                id: 'odc.DataClearTask.CreateModal.EditDataCleanup',
                defaultMessage: '编辑数据清理',
              }) /*编辑数据清理*/
            }
          </div>
          <div>
            {
              formatMessage({
                id: 'odc.DataClearTask.CreateModal.TheTaskNeedsToBe',
                defaultMessage: '任务需要重新审批，审批通过后此任务将重新执行',
              }) /*任务需要重新审批，审批通过后此任务将重新执行*/
            }
          </div>
        </>
      ),

      cancelText: formatMessage({
        id: 'odc.DataClearTask.CreateModal.Cancel',
        defaultMessage: '取消',
      }),
      //取消
      okText: formatMessage({
        id: 'odc.DataClearTask.CreateModal.Ok',
        defaultMessage: '确定',
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
          shardingStrategy,
          rowLimit,
          dataSizeLimit,
          deleteByUniqueKey,
          timeoutMillis,
          needCheckBeforeDelete,
          targetDatabaseId,
          dirtyRowAction,
          maxAllowedDirtyRowCount,
        } = values;
        _tables?.map((i) => {
          i.partitions = Array.isArray(i.partitions)
            ? i.partitions
            : i?.partitions
                ?.replace(/[\r\n]+/g, '')
                ?.split(',')
                ?.filter(Boolean);
        });
        const parameters = {
          type: TaskJobType.DATA_DELETE,
          operationType: isEdit ? TaskOperationType.UPDATE : TaskOperationType.CREATE,
          taskId: editTaskId,
          scheduleTaskParameters: {
            fullDatabase: archiveRange === IArchiveRange.ALL,
            databaseId,
            deleteByUniqueKey,
            variables: getVariables(variables),
            shardingStrategy,
            tables:
              archiveRange === IArchiveRange.ALL
                ? tables?.map((item) => {
                    return {
                      tableName: item?.tableName,
                      conditionExpression: '',
                      targetTableName: '',
                    };
                  })
                : _tables,
            timeoutMillis: hourToMilliSeconds(timeoutMillis),
            rateLimit: {
              rowLimit,
              dataSizeLimit: mbToKb(dataSizeLimit),
            },
            needCheckBeforeDelete,
            targetDatabaseId: targetDatabaseId,
            dirtyRowAction,
            maxAllowedDirtyRowCount,
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
        form.scrollToField(errorInfo?.errorFields?.[0]?.name);
        console.error(JSON.stringify(errorInfo));
      });
  };

  const handleSQLPreview = () => {
    form
      .validateFields()
      .then(async (values) => {
        const { variables, tables: _tables, archiveRange } = values;
        _tables?.map((i) => {
          i.partitions = Array.isArray(i.partitions)
            ? i.partitions
            : i?.partitions
                ?.replace(/[\r\n]+/g, '')
                ?.split(',')
                ?.filter(Boolean);
        });
        const parameters = {
          variables: getVariables(variables),
          tables:
            archiveRange === IArchiveRange.ALL
              ? tables?.map((item) => {
                  return {
                    tableName: item?.tableName,
                    conditionExpression: '',
                    targetTableName: '',
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

  const handleDBChange = () => {
    form.setFieldValue('tables', [null]);
  };

  useEffect(() => {
    if (!dataClearVisible) {
      handleReset();
    }
  }, [dataClearVisible]);
  useEffect(() => {
    if (database?.id) {
      loadTables();
    }
  }, [database?.id]);

  useEffect(() => {
    if (editTaskId) {
      loadEditData(editTaskId);
    }
  }, [editTaskId]);

  useEffect(() => {
    const databaseId = dataClearTaskData?.databaseId;
    if (databaseId) {
      form.setFieldsValue({
        databaseId,
      });
    }
  }, [dataClearTaskData?.databaseId]);

  return (
    <Drawer
      destroyOnClose
      rootClassName={styles['data-archive']}
      width={760}
      title={
        isEdit
          ? formatMessage({
              id: 'src.component.Task.DataClearTask.CreateModal.A5BAF884',
              defaultMessage: '编辑数据清理',
            })
          : formatMessage({
              id: 'src.component.Task.DataClearTask.CreateModal.268C0069',
              defaultMessage: '新建数据清理',
            }) //'新建数据清理'
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
                id: 'odc.DataClearTask.CreateModal.Cancel',
                defaultMessage: '取消',
              }) /*取消*/
            }
          </Button>
          <Button type="primary" loading={confirmLoading || loading} onClick={handleSQLPreview}>
            {
              isEdit
                ? formatMessage({
                    id: 'odc.DataClearTask.CreateModal.Save',
                    defaultMessage: '保存',
                  }) //保存
                : formatMessage({
                    id: 'odc.DataClearTask.CreateModal.Create',
                    defaultMessage: '新建',
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
      <Spin spinning={loading}>
        {dataClearVisible ? (
          <Form
            form={form}
            name="basic"
            layout="vertical"
            requiredMark="optional"
            initialValues={defaultValue}
            onFieldsChange={handleFieldsChange}
          >
            {/* <Space align="start"> */}
            <DatabaseSelect
              type={TaskType.DATA_DELETE}
              label={formatMessage({
                id: 'odc.DataClearTask.CreateModal.SourceDatabase',
                defaultMessage: '源端数据库',
              })}
              /*源端数据库*/ projectId={projectId}
              onChange={handleDBChange}
            />

            {/* </Space> */}
            <Space direction="vertical" size={24} style={{ width: '100%' }}>
              <Form.Item noStyle shouldUpdate>
                {({ getFieldValue }) => {
                  const needCheckBeforeDelete = getFieldValue('needCheckBeforeDelete');
                  return (
                    <ArchiveRange
                      tables={tables}
                      needCheckBeforeDelete={needCheckBeforeDelete}
                      checkPartition={enablePartition}
                    />
                  );
                }}
              </Form.Item>
              <VariableConfig form={form} />
            </Space>
            <Form.Item
              label={formatMessage({
                id: 'odc.DataClearTask.CreateModal.ExecutionMethod',
                defaultMessage: '执行方式',
              })}
              /*执行方式*/ name="triggerStrategy"
              required
            >
              <Radio.Group>
                <Radio.Button value={TaskExecStrategy.START_NOW}>
                  {
                    formatMessage({
                      id: 'odc.DataClearTask.CreateModal.ExecuteNow',
                      defaultMessage: '立即执行',
                    }) /*立即执行*/
                  }
                </Radio.Button>
                {!isClient() ? (
                  <Radio.Button value={TaskExecStrategy.START_AT}>
                    {
                      formatMessage({
                        id: 'odc.DataClearTask.CreateModal.ScheduledExecution',
                        defaultMessage: '定时执行',
                      }) /*定时执行*/
                    }
                  </Radio.Button>
                ) : null}
                <Radio.Button value={TaskExecStrategy.TIMER}>
                  {
                    formatMessage({
                      id: 'odc.DataClearTask.CreateModal.PeriodicExecution',
                      defaultMessage: '周期执行',
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
                      <DatePicker
                        showTime
                        suffixIcon={<FieldTimeOutlined />}
                        disabledDate={disabledDate}
                        disabledTime={disabledTime}
                      />
                    </Form.Item>
                  );
                }
                if (triggerStrategy === TaskExecStrategy.TIMER) {
                  return (
                    <>
                      <ExecuteFailTip />
                      <Form.Item>
                        <Crontab
                          ref={crontabRef}
                          initialValue={crontab}
                          onValueChange={handleCrontabChange}
                        />
                      </Form.Item>
                    </>
                  );
                }
                return null;
              }}
            </Form.Item>
            <FormItemPanel
              label={
                formatMessage({
                  id: 'odc.src.component.Task.DataClearTask.CreateModal.TaskSetting',
                  defaultMessage: '任务设置',
                }) /* 任务设置 */
              }
              keepExpand
            >
              <Form.Item name="needCheckBeforeDelete" valuePropName="checked">
                <Checkbox>
                  {formatMessage({
                    id: 'src.component.Task.DataClearTask.CreateModal.70A4982D',
                    defaultMessage: '清理前是否需要校验',
                  })}
                </Checkbox>
              </Form.Item>
              <Form.Item noStyle shouldUpdate>
                {({ getFieldValue }) => {
                  const needCheckBeforeDelete = getFieldValue('needCheckBeforeDelete');
                  return (
                    needCheckBeforeDelete && (
                      <DatabaseSelect
                        type={TaskType.DATA_DELETE}
                        label={formatMessage({
                          id: 'odc.DataArchiveTask.CreateModal.TargetDatabase',
                          defaultMessage: '目标数据库',
                        })} /*目标数据库*/
                        name="targetDatabaseId"
                        projectId={projectId}
                        placeholder={formatMessage({
                          id: 'src.component.Task.DataClearTask.CreateModal.EA952FEA',
                          defaultMessage: '仅支持选择同一项目内数据库',
                        })}
                      />
                    )
                  );
                }}
              </Form.Item>
              <DirtyRowAction dependentField="needCheckBeforeDelete" />
              <MaxAllowedDirtyRowCount />
              <TaskdurationItem form={form} />
              <ShardingStrategyItem />
              <ThrottleFormItem isShowDataSizeLimit={true} />
              <Form.Item
                label={
                  formatMessage({
                    id: 'src.component.Task.DataClearTask.CreateModal.99D8FCD6',
                    defaultMessage: '使用主键清理',
                  }) /*"使用主键清理"*/
                }
                name="deleteByUniqueKey"
                rules={[
                  {
                    required: true,
                    message: formatMessage({
                      id: 'src.component.Task.DataClearTask.CreateModal.23542D89',
                      defaultMessage: '请选择',
                    }), //'请选择'
                  },
                ]}
              >
                <Radio.Group options={deleteByUniqueKeyOptions} />
              </Form.Item>
            </FormItemPanel>
            <DescriptionInput />
          </Form>
        ) : (
          <></>
        )}
      </Spin>
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
