import { getTableListByDatabaseName } from '@/common/network/table';
import { previewSqlStatements } from '@/common/network/task';
import {
  createSchedule,
  updateSchedule,
  getScheduleDetail,
  DmlPreCheck,
} from '@/common/network/schedule';
import { CrontabDateType, CrontabMode, ICrontab } from '@/component/Crontab/interface';
import { convertCronToMinutes } from '@/component/Crontab/utils';
import { validateCrontabInterval } from '@/util/schedule';
import FormItemPanel from '@/component/FormItemPanel';
import {
  ICycleTaskTriggerConfig,
  ITable,
  TaskExecStrategy,
  ShardingStrategy,
  IArchiveRange,
} from '@/d.ts';
import { history } from '@umijs/max';
import {
  IDataClearParameters,
  IScheduleRecord,
  ScheduleType,
  createScheduleRecord,
  createDataDeleteParameters,
  SchedulePageType,
  dmlPreCheckResult,
} from '@/d.ts/schedule';
import { useDBSession } from '@/store/sessionManager/hooks';
import { formatMessage } from '@/util/intl';
import { hourToMilliSeconds, kbToMb, mbToKb, milliSecondsToHour } from '@/util/utils';
import { Button, Checkbox, Form, Modal, Radio, Space, Spin, Tooltip, message } from 'antd';
import { inject, observer } from 'mobx-react';
import { CreateScheduleContext } from '@/component/Schedule/context/createScheduleContext';
import dayjs from 'dayjs';
import React, { useContext, useEffect, useRef, useState } from 'react';
import DatabaseSelect from '@/component/Task/component/DatabaseSelect';
import SQLPreviewModal from '@/component/Task/component/SQLPreviewModal';
import TaskdurationItem from '@/component/Task/component/TaskdurationItem';
import ThrottleFormItem from '@/component/Task/component/ThrottleFormItem';
import { getVariableValue } from '@/component/Schedule/modals/DataArchive/Create/helper';
import ArchiveRange from './ArchiveRange';
import styles from './index.less';
import VariableConfig from './VariableConfig';
import ShardingStrategyItem from '@/component/Schedule/components/ShardingStrategyFormItem';
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
import ExecuteTimeoutSchedulingStrategy from '@/component/Schedule/components/ExecuteTimeoutSchedulingStrategy';
import { getInitScheduleName } from '@/component/Task/component/CreateTaskConfirmModal/helper';
import PreCheckTip from '@/component/Schedule/components/PreCheckTip';

export const variable = {
  name: '',
  format: '',
  pattern: [null],
};

const defaultValue = {
  triggerStrategy: TaskExecStrategy.TIMER,
  archiveRange: IArchiveRange.PORTION,
  shardingStrategy: ShardingStrategy.MATCH,
  tables: [null],
  rowLimit: 1000,
  dataSizeLimit: 10,
  deleteByUniqueKey: true,
  scheduleIgnoreTimeoutTask: true,
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
  const [preCheckResult, setPreCheckResult] = useState<{
    errorList: dmlPreCheckResult[];
    warningList: dmlPreCheckResult[];
  }>({
    errorList: [],
    warningList: [],
  });

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
      scheduleIgnoreTimeoutTask,
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
      tables,
      shardingStrategy,
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
      scheduleIgnoreTimeoutTask,
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
      crontabRef?.current?.setValue(crontab);
    }
    if (triggerStrategy === TaskExecStrategy.START_AT) {
      formData.startAt = startAt ? dayjs(startAt) : dayjs().add(1, 'hour');
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
    validateCrontabInterval(crontab, form, 'crontab');
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
          <div>作业需要重新审批，审批通过后此作业将自动启动</div>
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

  const handleSubmit = (scheduleName?: string, isPreCheck = false) => {
    // 校验 crontab 间隔分钟数
    if (!validateCrontabInterval(crontab, form, 'crontab')) {
      return;
    }
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
          timeoutMillis,
          needCheckBeforeDelete,
          targetDatabaseId,
          scheduleIgnoreTimeoutTask,
          dirtyRowAction,
          maxAllowedDirtyRowCount,
        } = values;
        const parameters: createDataDeleteParameters = {
          databaseId,
          deleteByUniqueKey: true,
          fullDatabase: archiveRange === IArchiveRange.ALL,
          needCheckBeforeDelete,
          scheduleIgnoreTimeoutTask,
          dirtyRowAction,
          maxAllowedDirtyRowCount,
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
        if (isPreCheck) {
          handleDmlPreCheck(data, isEdit);
        } else if (isEdit) {
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

  const handleDmlPreCheck = async (
    data: createScheduleRecord<createDataDeleteParameters>,
    isEdit: boolean,
  ) => {
    const params = {
      scheduleId: undefined,
      createScheduleReq: undefined,
      updateScheduleReq: undefined,
    };
    if (isEdit) {
      params.scheduleId = editScheduleId;
      params.updateScheduleReq = data;
    } else {
      params.createScheduleReq = data;
    }
    const res = await DmlPreCheck(params);
    const errorList = res?.filter((item) => item.level === 'ERROR') ?? [];
    const warningList = res?.filter((item) => item.level === 'WARN') ?? [];
    if (res && !res?.length) {
      message.success('预检查完成，暂时没有发现问题');
    } else if (res && res?.length) {
      message.warning(
        `预检查完成，发现${warningList?.length}个警告，发现${errorList?.length}个错误。`,
      );
    }
    setConfirmLoading(false);
    setPreCheckResult({
      errorList,
      warningList,
    });
  };

  const handleSQLPreview = () => {
    form
      .validateFields()
      .then(async (values) => {
        const { variables, tables, archiveRange } = values;
        if (archiveRange !== IArchiveRange.ALL) {
          const parameters = {
            variables: getVariables(variables),
            tables,
          };
          const sqls = await previewSqlStatements(parameters);
          if (sqls) {
            setPreviewModalVisible(true);
            setPreviewSQL(sqls?.join('\n'));
          }
        } else {
          setPreviewModalVisible(true);
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
    setPreCheckResult({
      errorList: [],
      warningList: [],
    });
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
            title: (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ marginRight: '4px' }}>清理范围</div>
                <PreCheckTip preCheckResult={preCheckResult} showTip={false} />
              </div>
            ),
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
                      placeholder={'请选择进行数据校验的数据库'}
                    />
                  )
                );
              }}
            </Form.Item>

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
                      databaseId={databaseId}
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
            <ShardingStrategyItem form={form} />
            <DirtyRowAction dependentField="needCheckBeforeDelete" />
            <MaxAllowedDirtyRowCount />
            <TaskdurationItem form={form} />
            <ThrottleFormItem isShowDataSizeLimit={true} />
          </Form>
        </Spin>
      </AnchorContainer>
      <SQLPreviewModal
        hideSqlPreview={form.getFieldValue('archiveRange') === IArchiveRange.ALL}
        tips={
          form.getFieldValue('archiveRange') === IArchiveRange.ALL
            ? '整库清理不支持预览 SQL'
            : '请确认以下 SQL，变量以当前时间代入，具体执行按实际配置替换，可点击提交按钮继续提交任务'
        }
        modelHeight={form.getFieldValue('archiveRange') === IArchiveRange.ALL ? 130 : 400}
        database={createScheduleDatabase}
        initName={getInitScheduleName(form.getFieldValue('scheduleName'), dataClearData?.type)}
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
          <Tooltip title={preCheckResult?.errorList?.length ? '存在错误，请先解决错误' : undefined}>
            <Button
              type="primary"
              loading={confirmLoading || loading}
              onClick={handleSQLPreview}
              disabled={Boolean(preCheckResult?.errorList?.length)}
            >
              下一步：预览SQL
            </Button>
          </Tooltip>
          <Button onClick={() => handleSubmit(undefined, true)} loading={confirmLoading}>
            预检查
          </Button>
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
          <PreCheckTip preCheckResult={preCheckResult} />
        </Space>
      </div>
    </div>
  );
};

export default inject('scheduleStore', 'pageStore')(observer(Create));
