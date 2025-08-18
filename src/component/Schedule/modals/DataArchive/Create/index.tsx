import { getTableListByDatabaseName } from '@/common/network/table';
import { previewSqlStatements } from '@/common/network/task';
import Crontab from '@/component/Crontab';
import { CrontabDateType, CrontabMode, ICrontab } from '@/component/Crontab/interface';
import FormItemPanel from '@/component/FormItemPanel';
import DescriptionInput from '@/component/Task/component/DescriptionInput';
import { IDatabase } from '@/d.ts/database';
import { useRequest } from 'ahooks';
import HelpDoc from '@/component/helpDoc';
import {
  ICycleTaskTriggerConfig,
  ITable,
  MigrationInsertAction,
  ShardingStrategy,
  TaskExecStrategy,
} from '@/d.ts';
import { createSchedule, updateSchedule, getScheduleDetail } from '@/common/network/schedule';
import { SchedulePageType, ScheduleType } from '@/d.ts/schedule';
import { useDBSession } from '@/store/sessionManager/hooks';
import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { hourToMilliSeconds, kbToMb, mbToKb, milliSecondsToHour } from '@/util/utils';
import { FieldTimeOutlined } from '@ant-design/icons';
import { Button, Checkbox, DatePicker, Form, Modal, Radio, Space, Spin, message } from 'antd';
import { inject, observer } from 'mobx-react';
import dayjs from 'dayjs';
import React, { useEffect, useRef, useState } from 'react';
import DatabaseSelect from '@/component/Task/component/DatabaseSelect';
import SQLPreviewModal from '@/component/Task/component/SQLPreviewModal';
import SynchronizationItem from '@/component/Task/component/SynchronizationItem';
import TaskdurationItem from '@/component/Task/component/TaskdurationItem';
import ThrottleFormItem from '@/component/Task/component/ThrottleFormItem';
import { isConnectTypeBeFileSystemGroup } from '@/util/connection';
import ShardingStrategyItem from '@/component/Task/component/ShardingStrategyItem';
import { disabledDate, disabledTime } from '@/util/utils';
import DirtyRowAction from '@/component/Task/component/DirtyRowAction';
import MaxAllowedDirtyRowCount from '@/component/Task/component/MaxAllowedDirtyRowCount';
import AnchorContainer from '@/component/AnchorContainer';
import styles from './index.less';
import VariableConfig, { timeUnitOptions } from './VariableConfig';
import ArchiveRange from './ArchiveRange';
import { rules } from './const';
import { history } from '@umijs/max';
import { ScheduleStore } from '@/store/schedule';
import { createDataArchiveParameters, createScheduleRecord } from '@/d.ts/schedule';
import { IScheduleRecord, IDataArchiveParameters } from '@/d.ts/schedule';
import { PageStore } from '@/store/page';
import { SchedulePageMode } from '@/component/Schedule/interface';
import { openSchedulesPage } from '@/store/helper/page';
import { getDataSourceModeConfig } from '@/common/datasource';
import { ConnectTypeText } from '@/constant/label';

export enum IArchiveRange {
  PORTION = 'portion',
  ALL = 'all',
}
export const InsertActionOptions = [
  {
    label: formatMessage({
      id: 'odc.src.component.Task.DataArchiveTask.CreateModal.IgnoreWhenRepeated',
      defaultMessage: '重复时忽略',
    }), //'重复时忽略'
    value: MigrationInsertAction.INSERT_IGNORE,
  },
  {
    label: formatMessage({
      id: 'odc.src.component.Task.DataArchiveTask.CreateModal.UpdateWhenRepeated',
      defaultMessage: '重复时更新',
    }), //'重复时更新'
    value: MigrationInsertAction.INSERT_DUPLICATE_UPDATE,
  },
];

export const variable = {
  name: '',
  format: '',
  pattern: [
    {
      operator: '',
      step: '',
      unit: '',
    },
  ],
};
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
          return `${item.operator}${item.step ?? 0}${item.unit}`;
        })
        ?.join(' ');
    } catch (error) {}
    return {
      name,
      pattern: `${format}|${_pattern}`,
    };
  });
};

const defaultValue = {
  triggerStrategy: TaskExecStrategy.START_NOW,
  archiveRange: IArchiveRange.PORTION,
  tables: [null],
  migrationInsertAction: MigrationInsertAction.INSERT_DUPLICATE_UPDATE,
  shardingStrategy: ShardingStrategy.AUTO,
  rowLimit: 1000,
  dataSizeLimit: 10,
};

interface IProps {
  scheduleStore?: ScheduleStore;
  pageStore?: PageStore;
  projectId?: number;
  mode?: SchedulePageMode;
}
const Create: React.FC<IProps> = ({ scheduleStore, projectId, pageStore, mode }) => {
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewSql, setPreviewSQL] = useState('');
  const [hasEdit, setHasEdit] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [crontab, setCrontab] = useState<ICrontab>(null);
  const [tables, setTables] = useState<ITable[]>();
  const [enablePartition, setEnablePartition] = useState<boolean>(false);
  const [targetDatabase, setTargetDatabase] = useState<IDatabase>();
  const [sourceDatabase, setSourceDatabase] = useState<IDatabase>();
  const [form] = Form.useForm();
  const databaseId = Form.useWatch('databaseId', form);
  const { session: sourceDBSession, database: sourceDB } = useDBSession(databaseId);
  const { run: fetchScheduleDetail, loading } = useRequest(getScheduleDetail, { manual: true });
  const loadTables = async () => {
    const tables = await getTableListByDatabaseName(sourceDBSession?.sessionId, sourceDB?.name);
    setTables(tables);
  };
  const crontabRef = useRef<{
    setValue: (value: ICrontab) => void;
    resetFields: () => void;
  }>();
  const { dataArchiveData } = scheduleStore;
  const dataArchiveEditId = dataArchiveData?.id;
  const isEdit = !!dataArchiveEditId && dataArchiveData?.type === 'EDIT';
  const [isdeleteAfterMigration, setIsdeleteAfterMigration] = useState(false);
  const [isTargetConnectTypeAllow, setIsTargetConnectTypeAllow] = useState<boolean>(true);

  const loadEditData = async (editId: number) => {
    const dataRes = (await fetchScheduleDetail(editId)) as IScheduleRecord<IDataArchiveParameters>;
    const {
      parameters,
      scheduleName,
      triggerConfig: { triggerStrategy, cronExpression, hours, days, startAt },
    } = dataRes;

    const {
      targetDataBaseId,
      sourceDatabaseId,
      deleteAfterMigration,
      deleteTemporaryTable,
      migrationInsertAction,
      shardingStrategy,
      rateLimit,
      tables,
      variables,
      timeoutMillis,
      syncTableStructure,
      dirtyRowAction,
      maxAllowedDirtyRowCount,
      fullDatabase,
    } = parameters;
    setEnablePartition(!!tables?.find((i) => i?.partitions?.length));
    setIsdeleteAfterMigration(deleteAfterMigration);
    const formData = {
      databaseId: sourceDatabaseId,
      targetDataBaseId: targetDataBaseId,
      rowLimit: rateLimit?.rowLimit,
      dataSizeLimit: kbToMb(rateLimit?.dataSizeLimit),
      deleteAfterMigration,
      deleteTemporaryTable,
      migrationInsertAction,
      shardingStrategy,
      tables: tables?.map((i) => {
        i.partitions = (i?.partitions as [])?.join(',');
        return i;
      }),
      variables: getVariableValue(variables),
      archiveRange: fullDatabase ? IArchiveRange.ALL : IArchiveRange.PORTION,
      triggerStrategy,
      startAt: undefined,
      timeoutMillis: milliSecondsToHour(timeoutMillis),
      syncTableStructure,
      dirtyRowAction,
      maxAllowedDirtyRowCount,
      scheduleName,
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
    await form.setFieldsValue(formData);
    setTargetDatabase(parameters.targetDatabase);
    setSourceDatabase(parameters.sourceDatabase);
    handleCheckTargetConnectTypeIsAllow(parameters.sourceDatabase, parameters.targetDatabase);
  };
  const handleCancel = async (hasEdit: boolean) => {
    if (hasEdit) {
      Modal.confirm({
        title: formatMessage({
          id: 'odc.DataArchiveTask.CreateModal.AreYouSureYouWant',
          defaultMessage: '是否确认取消此数据归档？',
        }),
        //确认取消此 数据归档吗？
        centered: true,
        onOk: async () => {
          scheduleStore.setDataArchiveData(false);
          if (mode === SchedulePageMode.MULTI_PAGE) {
            await pageStore?.close?.(pageStore?.activePageKey);
            openSchedulesPage(SchedulePageType.DATA_ARCHIVE);
          } else {
            history.back();
          }
        },
      });
    } else {
      scheduleStore.setDataArchiveData(false);
      if (mode === SchedulePageMode.MULTI_PAGE) {
        await pageStore?.close?.(pageStore?.activePageKey);
        openSchedulesPage(SchedulePageType.DATA_ARCHIVE);
      } else {
        history.back();
      }
    }
  };
  const handleCrontabChange = (crontab) => {
    setCrontab(crontab);
  };
  const handleCreate = async (data: Partial<createScheduleRecord<createDataArchiveParameters>>) => {
    const res = await createSchedule(data);
    setConfirmLoading(false);
    if (res.data) {
      handleCancel(false);
      message.success('新建成功');
    }
  };

  const handleEdit = async (data: Partial<createScheduleRecord<createDataArchiveParameters>>) => {
    data.id = dataArchiveEditId;
    const res = await updateSchedule(data);
    setConfirmLoading(false);
    if (res.data) {
      handleCancel(false);
      message.success('修改成功');
    }
  };

  const handleEditAndConfirm = async (
    data: Partial<createScheduleRecord<createDataArchiveParameters>>,
  ) => {
    Modal.confirm({
      title: formatMessage({
        id: 'odc.DataArchiveTask.CreateModal.AreYouSureYouWant.1',
        defaultMessage: '是否确认修改此数据归档？',
      }),
      //确认要修改此 数据归档吗？
      content: (
        <>
          <div>
            {
              formatMessage({
                id: 'odc.DataArchiveTask.CreateModal.EditDataArchive',
                defaultMessage: '编辑数据归档',
              }) /*编辑数据归档*/
            }
          </div>
          <div>
            {
              formatMessage({
                id: 'odc.DataArchiveTask.CreateModal.TheTaskNeedsToBe',
                defaultMessage: '任务需要重新审批，审批通过后此任务将重新执行',
              }) /*任务需要重新审批，审批通过后此任务将重新执行*/
            }
          </div>
        </>
      ),

      cancelText: formatMessage({
        id: 'odc.DataArchiveTask.CreateModal.Cancel',
        defaultMessage: '取消',
      }),
      //取消
      okText: formatMessage({
        id: 'odc.DataArchiveTask.CreateModal.Ok',
        defaultMessage: '确定',
      }),
      //确定
      centered: true,
      onOk: () => {
        handleEdit(data);
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
  const handleSubmit = (scheduleName?: string) => {
    form
      .validateFields()
      .then(async (values) => {
        const {
          startAt,
          databaseId,
          targetDataBaseId,
          variables,
          tables: _tables,
          deleteAfterMigration,
          triggerStrategy,
          migrationInsertAction,
          shardingStrategy,
          archiveRange,
          rowLimit,
          dataSizeLimit,
          timeoutMillis,
          syncTableStructure,
        } = values;
        _tables?.map((i) => {
          i.partitions = Array.isArray(i.partitions)
            ? i.partitions
            : i?.partitions
                ?.replace(/[\r\n]+/g, '')
                ?.split(',')
                ?.filter(Boolean);
        });
        const parameters: createDataArchiveParameters = {
          deleteAfterMigration,
          fullDatabase: archiveRange === IArchiveRange.ALL,
          migrationInsertAction,
          rateLimit: {
            rowLimit,
            dataSizeLimit: mbToKb(dataSizeLimit),
          },
          shardingStrategy,
          syncTableStructure,
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
          targetDataBaseId,
          timeoutMillis: hourToMilliSeconds(timeoutMillis),
          variables: getVariables(variables),
          sourceDatabaseId: databaseId,
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
        const data: createScheduleRecord<createDataArchiveParameters> = {
          name: scheduleName,
          type: ScheduleType.DATA_ARCHIVE,
          triggerConfig: parameters.triggerConfig,
          parameters,
        };
        setConfirmLoading(true);
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

  const handleConfirmTask = (scheduleName?: string) => {
    handleCloseSQLPreviewModal();
    handleSubmit(scheduleName);
  };

  const handleFieldsChange = () => {
    setHasEdit(true);
  };
  const handleReset = () => {
    form?.resetFields();
    setCrontab(null);
    setHasEdit(false);
    setTargetDatabase(null);
    setSourceDatabase(null);
  };

  const handleSourceDatabaseChange = (v, db) => {
    form.setFieldValue('tables', [null]);
    setSourceDatabase(db);
    handleCheckTargetConnectTypeIsAllow(db, targetDatabase);
  };

  const handleTargetDatabaseChange = (v, db) => {
    setTargetDatabase(db);
    handleCheckTargetConnectTypeIsAllow(sourceDatabase, db);
  };

  const handleCheckTargetConnectTypeIsAllow = (
    sourceDatabase: IDatabase,
    targetDatabase: IDatabase,
  ) => {
    if (!sourceDatabase?.dataSource?.type || !targetDatabase?.dataSource?.type) {
      return;
    }
    const allowTargetConnectType = getDataSourceModeConfig(sourceDatabase?.dataSource?.type)
      ?.features?.scheduleConfig?.allowTargetConnectTypeByDataArchive;
    if (
      allowTargetConnectType &&
      allowTargetConnectType?.includes(targetDatabase?.dataSource?.type)
    ) {
      setIsTargetConnectTypeAllow(true);
    } else {
      setIsTargetConnectTypeAllow(false);
    }
  };

  useEffect(() => {
    const databaseId = dataArchiveData?.databaseId;
    if (databaseId) {
      form.setFieldsValue({
        databaseId,
      });
    }
    if (dataArchiveEditId) {
      loadEditData(dataArchiveEditId);
    }
    return () => {
      handleReset();
    };
  }, []);

  useEffect(() => {
    if (sourceDB?.id) {
      loadTables();
    }
  }, [sourceDB?.id]);

  /**
   * 归档到对象存储类型的数据库时，不支持同步结构
   * 仅目标端为对象存储时支持 删除归档过程中产生的临时表
   */
  useEffect(() => {
    if (isConnectTypeBeFileSystemGroup(targetDatabase?.connectType)) {
      form.setFieldValue('syncTableStructure', undefined);
    } else {
      form.setFieldValue('deleteTemporaryTable', undefined);
    }
  }, [targetDatabase]);

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      className={styles.dataArchive}
    >
      <AnchorContainer
        items={[
          {
            key: 'baseInfo',
            href: '#baseInfo',
            title: '基本信息',
          },
          {
            key: 'archiveRange',
            href: '#archiveRange',
            title: '归档范围',
          },
          {
            key: 'executionMethod',
            href: '#executionMethod',
            title: '执行方式',
          },
          {
            key: 'scheduleSetting',
            href: '#scheduleSetting',
            title: '作业设置',
          },
        ]}
      >
        <Spin spinning={loading}>
          <Form
            form={form}
            name="basic"
            layout="vertical"
            requiredMark="optional"
            initialValues={defaultValue}
            onFieldsChange={handleFieldsChange}
          >
            <h3 id="baseInfo" className={styles.title}>
              基本信息
            </h3>
            <Space align="start">
              <DatabaseSelect
                scheduleType={ScheduleType.DATA_ARCHIVE}
                disabled={isEdit}
                label={formatMessage({
                  id: 'odc.DataArchiveTask.CreateModal.SourceDatabase',
                  defaultMessage: '源端数据库',
                })}
                /*源端数据库*/ projectId={projectId}
                onChange={handleSourceDatabaseChange}
                onInit={(db) => setTargetDatabase(db)}
                filters={{
                  hideFileSystem: true,
                }}
              />

              <DatabaseSelect
                scheduleType={ScheduleType.DATA_ARCHIVE}
                label={formatMessage({
                  id: 'odc.DataArchiveTask.CreateModal.TargetDatabase',
                  defaultMessage: '目标数据库',
                })}
                rules={[
                  {
                    required: true,
                    message: formatMessage({
                      id: 'odc.component.DatabaseSelect.SelectADatabase',
                      defaultMessage: '请选择数据库',
                    }), //请选择数据库
                  },
                  {
                    validator: (rule, value, callback) => {
                      if (!value) {
                        callback();
                        return;
                      }
                      const sourceConnectTypeName = ConnectTypeText(
                        sourceDatabase?.dataSource?.type,
                      );
                      const targetConnectTypeName = ConnectTypeText(
                        targetDatabase?.dataSource?.type,
                      );
                      if (!isTargetConnectTypeAllow) {
                        callback(
                          `源端 ${sourceConnectTypeName} 类型 -> 目标端 ${targetConnectTypeName} 类型不在已支持的归档链路范围内`,
                        );
                      }
                      callback();
                    },
                  },
                ]}
                onChange={handleTargetDatabaseChange}
                name="targetDataBaseId"
                projectId={projectId}
              />
            </Space>
            <h3 id="archiveRange" className={styles.title}>
              归档范围
            </h3>
            <Space direction="vertical" size={24} style={{ width: '100%' }}>
              <ArchiveRange
                enabledTargetTable
                tables={tables}
                checkPartition={enablePartition}
                targetDatabase={targetDatabase}
              />

              <VariableConfig form={form} />
            </Space>
            {isdeleteAfterMigration &&
              isConnectTypeBeFileSystemGroup(targetDatabase?.connectType) && (
                <Form.Item name="deleteTemporaryTable" valuePropName="checked">
                  <Checkbox>
                    <div>
                      <span style={{ marginRight: '6px' }}>
                        {formatMessage({
                          id: 'src.component.Task.DataArchiveTask.CreateModal.3D6F0B7D',
                          defaultMessage: '任务完成后删除归档过程中产生的临时表',
                        })}
                      </span>
                      <span className={styles.desc}>
                        {formatMessage({
                          id: 'src.component.Task.DataArchiveTask.CreateModal.85B377FF',
                          defaultMessage: '勾选后已归档的任务不支持回滚',
                        })}
                      </span>
                      <HelpDoc doc="TemporaryTableNameRules" />
                    </div>
                  </Checkbox>
                </Form.Item>
              )}
            <h3>执行方式</h3>
            <Form.Item name="triggerStrategy" required>
              <Radio.Group>
                <Radio.Button value={TaskExecStrategy.START_NOW}>
                  {
                    formatMessage({
                      id: 'odc.DataArchiveTask.CreateModal.ExecuteNow',
                      defaultMessage: '立即执行',
                    }) /*立即执行*/
                  }
                </Radio.Button>
                {!isClient() ? (
                  <Radio.Button value={TaskExecStrategy.START_AT}>
                    {
                      formatMessage({
                        id: 'odc.DataArchiveTask.CreateModal.ScheduledExecution',
                        defaultMessage: '定时执行',
                      }) /*定时执行*/
                    }
                  </Radio.Button>
                ) : null}
                <Radio.Button value={TaskExecStrategy.TIMER}>
                  {
                    formatMessage({
                      id: 'odc.DataArchiveTask.CreateModal.PeriodicExecution',
                      defaultMessage: '周期执行',
                    }) /*周期执行*/
                  }
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Form.Item shouldUpdate noStyle>
              {({ getFieldValue }) => {
                const triggerStrategy = getFieldValue('triggerStrategy');
                if (triggerStrategy === TaskExecStrategy.START_AT) {
                  return (
                    <Form.Item
                      name="startAt"
                      label={formatMessage({
                        id: 'odc.DataArchiveTask.CreateModal.ExecutionTime',
                        defaultMessage: '执行时间',
                      })}
                      /*执行时间*/ required
                    >
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
            <h3 id="scheduleSetting" className={styles.title}>
              作业设置
            </h3>
            <FormItemPanel keepExpand>
              <Form.Item
                name="deleteAfterMigration"
                valuePropName="checked"
                style={{ marginBottom: 24 }}
                extra={
                  <span>
                    {
                      isConnectTypeBeFileSystemGroup(targetDatabase?.connectType)
                        ? formatMessage({
                            id: 'src.component.Task.DataArchiveTask.CreateModal.5A19F0AB',
                            defaultMessage: '若您进行清理，默认立即清理且不做备份',
                          })
                        : formatMessage({
                            id: 'odc.DataArchiveTask.CreateModal.IfYouCleanUpThe',
                            defaultMessage:
                              '若您进行清理，默认立即清理且不做备份；清理任务完成后支持回滚',
                          }) /*若您进行清理，默认立即清理且不做备份；清理任务完成后支持回滚*/
                    }
                  </span>
                }
              >
                <Checkbox
                  onChange={(e) => {
                    setIsdeleteAfterMigration(e.target.checked);
                  }}
                >
                  <Space>
                    {
                      formatMessage({
                        id: 'odc.DataArchiveTask.CreateModal.CleanUpArchivedDataFrom',
                        defaultMessage: '清理源端已归档数据',
                      }) /*清理源端已归档数据*/
                    }
                  </Space>
                </Checkbox>
              </Form.Item>
              <DirtyRowAction dependentField="deleteAfterMigration" />
              <MaxAllowedDirtyRowCount />
              <TaskdurationItem form={form} />
              <SynchronizationItem form={form} targetDatabase={targetDatabase} />
              <Form.Item
                label={
                  formatMessage({
                    id: 'odc.src.component.Task.DataArchiveTask.CreateModal.InsertionStrategy',
                    defaultMessage: '插入策略',
                  }) /* 插入策略 */
                }
                name="migrationInsertAction"
                rules={rules.migrationInsertAction}
              >
                <Radio.Group options={InsertActionOptions} />
              </Form.Item>
              <ShardingStrategyItem />
              <ThrottleFormItem isShowDataSizeLimit={true} />
            </FormItemPanel>
          </Form>
        </Spin>
      </AnchorContainer>
      <SQLPreviewModal
        database={targetDatabase}
        initName={isEdit ? form.getFieldValue('scheduleName') : undefined}
        isEdit={isEdit}
        sql={previewSql}
        visible={previewModalVisible}
        onClose={handleCloseSQLPreviewModal}
        onOk={(scheduleName) => handleConfirmTask(scheduleName)}
      />
      <div style={{ padding: '16px 16px 0px 0px' }}>
        <Space>
          <Button
            onClick={() => {
              handleCancel(hasEdit);
            }}
          >
            {
              formatMessage({
                id: 'odc.DataArchiveTask.CreateModal.Cancel',
                defaultMessage: '取消',
              }) /*取消*/
            }
          </Button>
          <Button type="primary" loading={confirmLoading || loading} onClick={handleSQLPreview}>
            {
              isEdit
                ? formatMessage({
                    id: 'odc.DataArchiveTask.CreateModal.Save',
                    defaultMessage: '保存',
                  }) //保存
                : formatMessage({
                    id: 'odc.DataArchiveTask.CreateModal.Create',
                    defaultMessage: '新建',
                  }) //新建
            }
          </Button>
        </Space>
      </div>
    </div>
  );
};

export const getVariableValue = (
  value: {
    name: string;
    pattern: string;
  }[],
) => {
  var reg = /([+-])?(\d+)?(.+)?/;
  return value?.map(({ name, pattern }) => {
    const [format, _pattern] = pattern?.split('|');
    let patternValue = {
      operator: '',
      step: '',
      unit: '',
    };
    if (_pattern) {
      const res = _pattern?.match(reg);
      const operator = res[1] ?? '';
      const step = res[2] ?? '';
      const unit = timeUnitOptions.map((item) => item.value).includes(res[3]) ? res[3] : '';
      patternValue = {
        operator,
        step,
        unit,
      };
    }
    return {
      name,
      format,
      pattern: [patternValue],
    };
  });
};

export default inject('scheduleStore', 'pageStore')(observer(Create));
