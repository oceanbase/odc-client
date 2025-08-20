import { getTableListByDatabaseName } from '@/common/network/table';
import { previewSqlStatements } from '@/common/network/task';
import { createSchedule, updateSchedule, getScheduleDetail } from '@/common/network/schedule';
import { CrontabDateType, CrontabMode, ICrontab } from '@/component/Crontab/interface';
import FormItemPanel from '@/component/FormItemPanel';
import { ICycleTaskTriggerConfig, ITable, TaskExecStrategy, ShardingStrategy } from '@/d.ts';
import { history } from '@umijs/max';
import {
  IDataClearParameters,
  IScheduleRecord,
  ScheduleType,
  createScheduleRecord,
  createDataDeleteParameters,
  SchedulePageType,
} from '@/d.ts/schedule';
import { useDBSession } from '@/store/sessionManager/hooks';
import { formatMessage } from '@/util/intl';
import { hourToMilliSeconds, kbToMb, mbToKb, milliSecondsToHour } from '@/util/utils';
import { Button, Checkbox, Form, Modal, Radio, Space, Spin, message } from 'antd';
import { inject, observer } from 'mobx-react';
import { CreateScheduleContext } from '@/component/Schedule/context/createScheduleContext';
import dayjs from 'dayjs';
import React, { useContext, useEffect, useRef, useState } from 'react';
import DatabaseSelect from '@/component/Task/component/DatabaseSelect';
import SQLPreviewModal from '@/component/Task/component/SQLPreviewModal';
import TaskdurationItem from '@/component/Task/component/TaskdurationItem';
import ThrottleFormItem from '@/component/Task/component/ThrottleFormItem';
import { getVariableValue } from '@/component/Schedule/modals/DataArchive/Create';
import ArchiveRange from './ArchiveRange';
import styles from './index.less';
import VariableConfig from './VariableConfig';
import ShardingStrategyItem from '@/component/Task/component/ShardingStrategyItem';
import { useRequest } from 'ahooks';
import DirtyRowAction from '@/component/Task/component/DirtyRowAction';
import MaxAllowedDirtyRowCount from '@/component/Task/component/MaxAllowedDirtyRowCount';
import { rules } from './const';
import AnchorContainer from '@/component/AnchorContainer';
import { ScheduleStore } from '@/store/schedule';
import { PageStore } from '@/store/page';
import { SchedulePageMode } from '@/component/Schedule/interface';
import { openSchedulesPage } from '@/store/helper/page';
import SchduleExecutionMethodForm from '@/component/Schedule/components/SchduleExecutionMethodForm';

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
  triggerStrategy: TaskExecStrategy.TIMER,
  archiveRange: IArchiveRange.PORTION,
  shardingStrategy: ShardingStrategy.AUTO,
  tables: [null],
  rowLimit: 1000,
  dataSizeLimit: 10,
  deleteByUniqueKey: true,
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

interface IProps {
  scheduleStore?: ScheduleStore;
  pageStore?: PageStore;
  projectId?: number;
  mode?: SchedulePageMode;
}

const Create: React.FC<IProps> = ({ scheduleStore, projectId, pageStore, mode }) => {
  const { dataClearData } = scheduleStore;
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
  const editScheduleId = dataClearData?.id;
  const isEdit = !!editScheduleId && dataClearData?.type === 'EDIT';
  const loadTables = async () => {
    const tables = await getTableListByDatabaseName(session?.sessionId, databaseName);
    setTables(tables);
  };

  const { run: fetchScheduleDetail, loading } = useRequest(getScheduleDetail, { manual: true });
  const { createScheduleDatabase, setCreateScheduleDatabase } =
    useContext(CreateScheduleContext) || {};

  const loadEditData = async (editId: number) => {
    const dataRes = (await fetchScheduleDetail(editId)) as IScheduleRecord<IDataClearParameters>;
    setCreateScheduleDatabase(dataRes?.parameters?.database);
    const {
      parameters,
      scheduleName,
      triggerConfig: { triggerStrategy, cronExpression, hours, days, startAt },
    } = dataRes;
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
    } = parameters;
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
      needCheckBeforeDelete,
      targetDatabaseId,
      timeoutMillis: milliSecondsToHour(timeoutMillis),
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
    form.setFieldsValue(formData);
  };

  const handleCancel = async (hasEdit: boolean) => {
    if (hasEdit) {
      Modal.confirm({
        title: formatMessage({
          id: 'odc.DataClearTask.CreateModal.AreYouSureYouWant',
          defaultMessage: '是否确认取消此数据清理？',
        }),
        //确认取消此数据清理吗？
        centered: true,
        onOk: async () => {
          scheduleStore.setDataClearData(false);
          setCreateScheduleDatabase(undefined);
          if (mode === SchedulePageMode.MULTI_PAGE) {
            await pageStore?.close?.(pageStore.activePageKey);
            openSchedulesPage(SchedulePageType.DATA_DELETE);
          } else {
            history.back();
          }
        },
      });
    } else {
      scheduleStore.setDataClearData(false);
      setCreateScheduleDatabase(undefined);
      if (mode === SchedulePageMode.MULTI_PAGE) {
        await pageStore?.close?.(pageStore.activePageKey);
        openSchedulesPage(SchedulePageType.DATA_DELETE);
      } else {
        history.back();
      }
    }
  };

  const handleCrontabChange = (crontab) => {
    setCrontab(crontab);
  };

  const handleCreate = async (data: Partial<createScheduleRecord<createDataDeleteParameters>>) => {
    const res = await createSchedule(data);
    setConfirmLoading(false);
    if (res?.data) {
      handleCancel(false);
      message.success('新建成功');
    }
  };

  const handleEdit = async (data: Partial<createScheduleRecord<createDataDeleteParameters>>) => {
    data.id = editScheduleId;
    const res = await updateSchedule(data);
    setConfirmLoading(false);
    if (res?.data) {
      handleCancel(false);
      message.success('修改成功');
    }
  };

  const handleEditAndConfirm = async (
    data: Partial<createScheduleRecord<createDataDeleteParameters>>,
  ) => {
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
          variables,
          tables: _tables,
          triggerStrategy,
          archiveRange,
          shardingStrategy,
          rowLimit,
          dataSizeLimit,
          deleteByUniqueKey,
          timeoutMillis,
          needCheckBeforeDelete,
          targetDatabaseId,
        } = values;
        _tables?.map((i) => {
          i.partitions = Array.isArray(i.partitions)
            ? i.partitions
            : i?.partitions
                ?.replace(/[\r\n]+/g, '')
                ?.split(',')
                ?.filter(Boolean);
        });
        const parameters: createDataDeleteParameters = {
          databaseId,
          deleteByUniqueKey,
          fullDatabase: archiveRange === IArchiveRange.ALL,
          needCheckBeforeDelete,
          rateLimit: {
            rowLimit,
            dataSizeLimit: mbToKb(dataSizeLimit),
          },
          variables: getVariables(variables),
          shardingStrategy,
          targetDatabaseId,
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
        const data: createScheduleRecord<createDataDeleteParameters> = {
          name: scheduleName,
          type: ScheduleType.DATA_DELETE,
          parameters,
          triggerConfig: parameters.triggerConfig,
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
    setCreateScheduleDatabase(undefined);
  };

  const handleDBChange = (v, db) => {
    form.setFieldValue('tables', [null]);
    setCreateScheduleDatabase(db);
  };

  useEffect(() => {
    if (editScheduleId) {
      loadEditData(editScheduleId);
    }
    const databaseId = dataClearData?.databaseId;
    if (databaseId) {
      form.setFieldsValue({
        databaseId,
      });
    }
    return () => {
      handleReset();
    };
  }, []);

  useEffect(() => {
    if (database?.id) {
      loadTables();
    }
  }, [database?.id]);

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
        containerWrapStyle={{ paddingLeft: '24px' }}
        items={[
          {
            key: 'baseInfo',
            href: '#baseInfo',
            title: '基本信息',
          },
          {
            key: 'clearRange',
            href: '#clearRange',
            title: '清理范围',
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

            <DatabaseSelect
              scheduleType={ScheduleType.DATA_DELETE}
              label={formatMessage({
                id: 'odc.DataClearTask.CreateModal.SourceDatabase',
                defaultMessage: '源端数据库',
              })}
              /*源端数据库*/ projectId={projectId}
              onChange={handleDBChange}
              onInit={(db) => setCreateScheduleDatabase(db)}
            />

            <h3 id="clearRange" className={styles.title}>
              清理范围
            </h3>

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

            <h3 id="executionMethod" className={styles.title}>
              执行方式
            </h3>

            <SchduleExecutionMethodForm
              ref={crontabRef}
              crontab={crontab}
              handleCrontabChange={handleCrontabChange}
            />

            <h3 id="scheduleSetting" className={styles.title}>
              作业设置
            </h3>

            <FormItemPanel keepExpand>
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
                        scheduleType={ScheduleType.DATA_DELETE}
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
                rules={rules.deleteByUniqueKey}
              >
                <Radio.Group options={deleteByUniqueKeyOptions} />
              </Form.Item>
            </FormItemPanel>
          </Form>
        </Spin>
      </AnchorContainer>
      <SQLPreviewModal
        database={createScheduleDatabase}
        initName={isEdit ? form.getFieldValue('scheduleName') : undefined}
        isEdit={isEdit}
        sql={previewSql}
        visible={previewModalVisible}
        onClose={handleCloseSQLPreviewModal}
        onOk={(scheduleName) => handleConfirmTask(scheduleName)}
      />
      <div
        style={{ padding: '16px 16px 0px 24px', borderTop: '1px solid var(--table-border-color)' }}
      >
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
      </div>
    </div>
  );
};

export default inject('scheduleStore', 'pageStore')(observer(Create));
