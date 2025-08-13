import { getPartitionPlanTables } from '@/common/network/task';
import { createSchedule, updateSchedule, getScheduleDetail } from '@/common/network/schedule';
import Crontab from '@/component/Crontab';
import { CrontabDateType, CrontabMode, ICrontab } from '@/component/Crontab/interface';
import FormItemPanel from '@/component/FormItemPanel';
import {
  IPartitionPlanKeyType,
  IPartitionTableConfig,
  PARTITION_KEY_INVOKER,
  PARTITION_NAME_INVOKER,
  TaskErrorStrategy,
  TaskExecStrategy,
  TaskPartitionStrategy,
} from '@/d.ts';
import { history } from '@umijs/max';
import { useDBSession } from '@/store/sessionManager/hooks';
import { formatMessage } from '@/util/intl';
import { hourToMilliSeconds, milliSecondsToHour } from '@/util/utils';
import {
  Alert,
  Button,
  Checkbox,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Space,
  Spin,
  Tooltip,
  Typography,
  message,
  DatePicker,
} from 'antd';
import { inject, observer } from 'mobx-react';
import dayjs from 'dayjs';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import DatabaseSelect from '@/component/Task/component/DatabaseSelect';
import PartitionPolicyFormTable from '@/component/Task/component/PartitionPolicyFormTable';
import {
  getPartitionKeyInvokerByIncrementFieldType,
  INCREAMENT_FIELD_TYPE,
  START_DATE,
} from '@/component/Task/component/PartitionPolicyFormTable/const';
import styles from './index.less';
import { useRequest } from 'ahooks';
import { rules } from './const';
import { Rule } from 'antd/es/form';
import AnchorContainer from '@/component/AnchorContainer';
import CreateTaskConfirmModal from '@/component/Task/component/CreateTaskConfirmModal';
import { ScheduleStore } from '@/store/schedule';
import {
  IScheduleRecord,
  IPartitionPlan,
  ScheduleType,
  createScheduleRecord,
  createPartitionPlanParameters,
  SchedulePageType,
} from '@/d.ts/schedule';
import { FieldTimeOutlined } from '@ant-design/icons';
import { disabledDate, disabledTime } from '@/util/utils';
import { CreateScheduleContext } from '@/component/Schedule/context/createScheduleContext';
import { PageStore } from '@/store/page';
import { SchedulePageMode } from '@/component/Schedule/interface';
import { openSchedulesPage } from '@/store/helper/page';

const { Paragraph, Text } = Typography;

const historyPartitionKeyInvokers = [
  PARTITION_KEY_INVOKER.HISTORICAL_PARTITION_PLAN_CREATE_GENERATOR,
  PARTITION_KEY_INVOKER.HISTORICAL_PARTITION_PLAN_DROP_GENERATOR,
];

const validPartitionKeyInvokers = [
  PARTITION_KEY_INVOKER.CUSTOM_GENERATOR,
  PARTITION_KEY_INVOKER.TIME_INCREASING_GENERATOR,
  PARTITION_KEY_INVOKER.KEEP_MOST_LATEST_GENERATOR,
  PARTITION_KEY_INVOKER.TIME_STRING_INCREASING_GENERATOR,
  PARTITION_KEY_INVOKER.NUMBER_INCREASING_GENERATOR,
];

export enum IPartitionPlanInspectTriggerStrategy {
  EVERY_DAY = 'EVERY_DAY',
  FIRST_DAY_OF_MONTH = 'FIRST_DAY_OF_MONTH',
  LAST_DAY_OF_MONTH = 'LAST_DAY_OF_MONTH',
  NONE = 'NONE',
}

export interface ITableConfig {
  __id: number;
  __isCreate?: boolean;
  containsCreateStrategy: boolean;
  containsDropStrategy: boolean;
  tableName: string;
  definitionCount?: number;
  generateCount?: number;
  nameRuleType?: string;
  generateExpr?: string;
  keepLatestCount?: number;
  reloadIndexes?: boolean;
  namingPrefix?: string;
  namingSuffixExpression?: string;
  namingSuffixStrategy?: string;
  refPartitionKey?: string;
  intervalGenerateExpr?: string;
  strategies?: TaskPartitionStrategy[];
  partitionMode?: string;
  option: {
    partitionKeyConfigs: {
      name: string;
      type?: IPartitionPlanKeyType;
      partitionKeyInvoker?: PARTITION_KEY_INVOKER;
      fromCurrentTime?: START_DATE;
      baseTimestampMillis?: number;
      generateExpr?: string;
      interval?: string;
      intervalPrecision?: number;
      intervalGenerateExpr?: string;
      incrementFieldType?: INCREAMENT_FIELD_TYPE;
      incrementFieldTypeInDate?: string;
      fieldType?: INCREAMENT_FIELD_TYPE;
      timeFormat?: string;
      numberInterval?: string;
    }[];
  };
}

const getCreatedTableConfigs: (tableConfigs: IPartitionTableConfig[]) => ITableConfig[] = (
  tableConfigs,
) => {
  const originPartitionTableConfigs = tableConfigs?.map((config) => {
    const dropKeyConfig = config?.partitionKeyConfigs?.find(
      (item) => item?.strategy === TaskPartitionStrategy.DROP,
    );
    const createKeyConfigs = config?.partitionKeyConfigs?.filter(
      (item) => item?.strategy === TaskPartitionStrategy.CREATE,
    );
    const keyConfigs = createKeyConfigs?.map((keyConfig) => {
      const { partitionKey, partitionKeyInvoker, partitionKeyInvokerParameters } = keyConfig;
      const { generateParameter, generateCount } = partitionKeyInvokerParameters ?? {};
      return {
        name: partitionKey,
        partitionKeyInvoker,
        generateCount,
        ...generateParameter,
        fromCurrentTime: generateParameter?.fromCurrentTime
          ? START_DATE.CURRENT_DATE
          : START_DATE.CUSTOM_DATE,
        baseTimestampMillis: generateParameter?.baseTimestampMillis
          ? dayjs(generateParameter?.baseTimestampMillis)
          : undefined,
      };
    });
    const dropPartitionKeyInvokerParameters = dropKeyConfig?.partitionKeyInvokerParameters ?? {};
    const { partitionNameGeneratorConfig } = config?.partitionNameInvokerParameters ?? {};
    const tableConfig = {
      ...dropPartitionKeyInvokerParameters,
      ...partitionNameGeneratorConfig,
      tableName: config?.tableName,
      generateCount: keyConfigs?.[0]?.generateCount,
      option: {
        partitionKeyConfigs: keyConfigs,
      },
    };
    return tableConfig;
  });
  return originPartitionTableConfigs;
};

interface IProps {
  projectId?: number;
  scheduleStore?: ScheduleStore;
  pageStore?: PageStore;
  mode?: SchedulePageMode;
}

const Create: React.FC<IProps> = ({ projectId, scheduleStore, pageStore, mode }) => {
  const { partitionPlanData } = scheduleStore;
  const [tableConfigs, setTableConfigs] = useState<ITableConfig[]>();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [disabledSubmit, setDisabledSubmit] = useState(true);
  const [hasPartitionPlan, setHasPartitionPlan] = useState(false);
  const [crontab, setCrontab] = useState<ICrontab>(null);
  const [dropCrontab, setDropCrontab] = useState<ICrontab>(null);
  const [createdTableConfigs, setCreatedTableConfigs] = useState<ITableConfig[]>([]);
  const [createdOriginTableConfigs, setCreatedOriginTableConfigs] = useState<
    IPartitionTableConfig[]
  >([]);
  const [historyOriginTableConfigs, setHistoryOriginTableConfigs] = useState<
    IPartitionTableConfig[]
  >([]);
  const [form] = Form.useForm();
  const isCustomStrategy = Form.useWatch('isCustomStrategy', form);
  const triggerStrategy = Form.useWatch('triggerStrategy', form);
  const databaseId = Form.useWatch('databaseId', form);
  const { session } = useDBSession(databaseId);
  const sessionId = session?.sessionId;
  const crontabRef = useRef<{
    setValue: (value: ICrontab) => void;
    resetFields: () => void;
  }>();
  const isEdit = partitionPlanData?.type === 'EDIT';
  const [open, setOpen] = useState<boolean>(false);
  const crontabDropRef = useRef<{
    setValue: (value: ICrontab) => void;
    resetFields: () => void;
  }>();
  const [preTableConfigs, setPreTableConfigs] = useState<IPartitionTableConfig[]>([]);
  const { createScheduleDatabase, setCreateScheduleDatabase } =
    useContext(CreateScheduleContext) || {};

  const { run: fetchPartitionPlanTables, loading: fetchPartitionPlanTablesLoading } = useRequest(
    getPartitionPlanTables,
    {
      manual: true,
    },
  );

  const loadData = async () => {
    if (sessionId && databaseId) {
      const res = await fetchPartitionPlanTables(sessionId, databaseId);
      const hasPartitionPlan = res?.contents?.some(
        (item) => item?.containsCreateStrategy || item?.containsDropStrategy,
      );
      const allPartitionPlanTableConfigs = res?.contents
        ?.map((item) => item?.partitionPlanTableConfig)
        ?.filter(Boolean);
      const createdOriginTableConfigs = allPartitionPlanTableConfigs?.filter(
        ({ partitionKeyConfigs }) => {
          return partitionKeyConfigs?.some(
            (item) =>
              validPartitionKeyInvokers.includes(item?.partitionKeyInvoker) ||
              historyPartitionKeyInvokers.includes(item?.partitionKeyInvoker),
          );
        },
      );
      const historyOriginTableConfigs = allPartitionPlanTableConfigs?.filter(
        ({ partitionKeyConfigs }) => {
          return partitionKeyConfigs?.some((item) =>
            historyPartitionKeyInvokers.includes(item?.partitionKeyInvoker),
          );
        },
      );
      isEdit && setCreatedTableConfigs(getCreatedTableConfigs(preTableConfigs));
      setCreatedOriginTableConfigs(createdOriginTableConfigs);
      setHistoryOriginTableConfigs(historyOriginTableConfigs);
      setHasPartitionPlan(hasPartitionPlan);
      const tableConfigs = res?.contents
        ?.map((config, index) => {
          const strategies = [];
          const {
            containsCreateStrategy,
            containsDropStrategy,
            name: tableName,
            partition,
            partitionMode,
          } = config;
          if (isEdit) {
            const prevConfigs = preTableConfigs?.find((item) => item.tableName === tableName);
            if (!prevConfigs) {
              return false;
            }
            const {
              containsCreateStrategy: prevContainsCreateStrategy,
              containsDropStrategy: prevContainsDropStrategy,
            } = prevConfigs;
            if (prevContainsCreateStrategy) {
              strategies.push(TaskPartitionStrategy.CREATE);
            }
            if (prevContainsDropStrategy) {
              strategies.push(TaskPartitionStrategy.DROP);
            }
          }
          return {
            __id: index,
            containsCreateStrategy,
            containsDropStrategy,
            strategies,
            tableName,
            definitionCount: partition?.partitionDefinitions?.length,
            partitionMode,
            option: {
              partitionKeyConfigs: partition.partitionOption?.columnNames?.map((name) => ({
                name,
              })) ?? [
                {
                  name: partition.partitionOption?.expression,
                },
              ],
            },
          };
        })
        ?.filter(Boolean);
      setTableConfigs(tableConfigs as ITableConfig[]);
    }
  };

  const onClose = useCallback(async () => {
    form?.resetFields();
    setCrontab(null);
    setDropCrontab(null);
    setDisabledSubmit(true);
    setHasPartitionPlan(false);
    setTableConfigs([]);
    setCreatedOriginTableConfigs([]);
    setCreatedTableConfigs([]);
    scheduleStore.setPartitionPlanData(false);
    if (mode === SchedulePageMode.MULTI_PAGE) {
      await pageStore?.close?.(pageStore.activePageKey);
      openSchedulesPage(SchedulePageType.PARTITION_PLAN);
    } else {
      history.back();
    }
  }, [scheduleStore]);

  const closeWithConfirm = useCallback(() => {
    Modal.confirm({
      title: formatMessage({
        id: 'odc.components.PartitionDrawer.AreYouSureYouWant',
        defaultMessage: '确认取消新建分区计划吗？',
      }),
      //确认取消新建分区计划吗？
      centered: true,
      onOk() {
        onClose();
      },
    });
  }, [onClose]);

  const handleCrontabChange = (crontab, isCustomStrategy = false) => {
    if (isCustomStrategy) {
      setDropCrontab(crontab);
    } else {
      setCrontab(crontab);
    }
  };

  const handleSubmit = async (scheduleName?: string) => {
    try {
      const values = await form.validateFields();
      if (!scheduleName) {
        setOpen(true);
        return;
      }
      const { databaseId, timeoutMillis, errorStrategy, triggerStrategy, startAt } = values;
      const validTableConfigs = tableConfigs?.filter((config) => config?.strategies?.length);
      const validHistoryOriginTableConfigs = historyOriginTableConfigs?.filter((item) => {
        return !validTableConfigs?.some((config) => config?.tableName === item?.tableName);
      });
      let partitionTableConfigs: IPartitionTableConfig[] = validTableConfigs
        ?.map((config) => {
          const createdOriginTableConfig = createdOriginTableConfigs?.find(
            (item) => item.tableName === config.tableName,
          );
          if (!config?.__isCreate) {
            return createdOriginTableConfig ? createdOriginTableConfig : null;
          }
          const {
            generateCount,
            nameRuleType,
            generateExpr,
            keepLatestCount,
            reloadIndexes,
            namingPrefix,
            namingSuffixExpression,
            namingSuffixStrategy,
            refPartitionKey,
            intervalGenerateExpr,
            tableName,
            strategies,
            option,
          } = config;
          const partitionKeyConfigs: {
            partitionKeyInvoker: PARTITION_KEY_INVOKER;
            strategy: TaskPartitionStrategy;
            partitionKeyInvokerParameters: Record<string, any>;
          }[] =
            option?.partitionKeyConfigs?.map((item) => {
              const {
                name: partitionKey,
                partitionKeyInvoker,
                fromCurrentTime,
                baseTimestampMillis,
                generateExpr,
                interval,
                intervalPrecision,
                intervalGenerateExpr,
                incrementFieldType,
                incrementFieldTypeInDate,
              } = item;

              if (partitionKeyInvoker === PARTITION_KEY_INVOKER.CUSTOM_GENERATOR) {
                return {
                  partitionKey,
                  partitionKeyInvoker,
                  strategy: TaskPartitionStrategy.CREATE,
                  partitionKeyInvokerParameters: {
                    generateCount,
                    partitionKey,
                    generateParameter: {
                      generateExpr,
                      intervalGenerateExpr,
                    },
                  },
                };
              } else {
                const tempPartitionKeyInvoker = getPartitionKeyInvokerByIncrementFieldType(
                  partitionKeyInvoker,
                  incrementFieldType,
                );
                const currentTimeParameter = {
                  fromCurrentTime: fromCurrentTime === START_DATE.CURRENT_DATE,
                  baseTimestampMillis: baseTimestampMillis?.valueOf(),
                  fieldType: incrementFieldType,
                  // 数值
                  numberInterval: intervalGenerateExpr,
                  // 时间日期
                  timeFormat: incrementFieldTypeInDate,
                };
                if (fromCurrentTime !== START_DATE.CUSTOM_DATE) {
                  delete currentTimeParameter.baseTimestampMillis;
                }
                if (
                  [INCREAMENT_FIELD_TYPE.NUMBER, INCREAMENT_FIELD_TYPE.TIMESTAMP]?.includes(
                    incrementFieldType,
                  )
                ) {
                  delete currentTimeParameter.timeFormat;
                }
                if (
                  [INCREAMENT_FIELD_TYPE.TIME_STRING, INCREAMENT_FIELD_TYPE.TIMESTAMP]?.includes(
                    incrementFieldType,
                  )
                ) {
                  delete currentTimeParameter.numberInterval;
                }
                return {
                  partitionKey,
                  partitionKeyInvoker: tempPartitionKeyInvoker,
                  strategy: TaskPartitionStrategy.CREATE,
                  partitionKeyInvokerParameters: {
                    generateCount,
                    partitionKey,
                    generateParameter: {
                      ...currentTimeParameter,
                      interval,
                      intervalPrecision,
                    },
                  },
                };
              }
            }) ?? [];

          if (strategies?.includes(TaskPartitionStrategy.DROP)) {
            partitionKeyConfigs.push({
              partitionKeyInvoker: PARTITION_KEY_INVOKER.KEEP_MOST_LATEST_GENERATOR,
              strategy: TaskPartitionStrategy.DROP,
              partitionKeyInvokerParameters: {
                keepLatestCount,
                reloadIndexes,
              },
            });
          }
          const tableConfig = {
            tableName,
            partitionKeyConfigs: partitionKeyConfigs?.filter((item) =>
              strategies?.includes(item.strategy),
            ),
            partitionNameInvoker: null,
            partitionNameInvokerParameters: {},
          };
          if (nameRuleType === 'PRE_SUFFIX') {
            tableConfig.partitionNameInvoker =
              PARTITION_NAME_INVOKER.DATE_BASED_PARTITION_NAME_GENERATOR;
            tableConfig.partitionNameInvokerParameters = {
              partitionNameGeneratorConfig: {
                namingPrefix,
                namingSuffixExpression,
                namingSuffixStrategy,
                refPartitionKey,
              },
            };
          } else {
            tableConfig.partitionNameInvoker =
              PARTITION_NAME_INVOKER.CUSTOM_PARTITION_NAME_GENERATOR;
            tableConfig.partitionNameInvokerParameters = {
              partitionNameGeneratorConfig: {
                generateExpr,
                intervalGenerateExpr,
              },
            };
          }
          if (strategies?.length === 1 && strategies?.includes(TaskPartitionStrategy.DROP)) {
            delete tableConfig.partitionNameInvokerParameters;
          }
          return tableConfig;
        })
        ?.filter(Boolean);
      if (validHistoryOriginTableConfigs?.length) {
        partitionTableConfigs = partitionTableConfigs.concat(validHistoryOriginTableConfigs);
      }

      const params: createScheduleRecord<createPartitionPlanParameters> = {
        type: ScheduleType.PARTITION_PLAN,
        name: scheduleName,
        triggerConfig: undefined,
        id: isEdit ? partitionPlanData?.id : undefined,
        parameters: {
          databaseId,
          enabled: true,
          id: isEdit ? form.getFieldValue('id') : undefined,
          partitionTableConfigs,
          creationTrigger: null,
          droppingTrigger: null,
          timeoutMillis: hourToMilliSeconds(timeoutMillis),
          errorStrategy,
        },
      };
      switch (triggerStrategy) {
        case TaskExecStrategy.TIMER: {
          const { mode, dateType, cronString, hour, dayOfMonth, dayOfWeek } = crontab || {};
          params.parameters.creationTrigger = {
            triggerStrategy: (mode === 'custom' ? 'CRON' : dateType) as TaskExecStrategy,
            days: dateType === CrontabDateType.weekly ? dayOfWeek : dayOfMonth,
            hours: hour,
            cronExpression: cronString,
          };
          break;
        }
        case TaskExecStrategy.START_AT: {
          params.parameters.creationTrigger = {
            triggerStrategy: TaskExecStrategy.START_AT,
            startAt: startAt?.valueOf(),
          };
          break;
        }
        default: {
          params.parameters.creationTrigger = {
            triggerStrategy: TaskExecStrategy.START_NOW,
          };
          break;
        }
      }
      params.triggerConfig = params.parameters.creationTrigger;
      if (isCustomStrategy && triggerStrategy === TaskExecStrategy.TIMER) {
        const { mode, dateType, cronString, hour, dayOfMonth, dayOfWeek } = dropCrontab || {};
        params.parameters.droppingTrigger = {
          triggerStrategy: (mode === 'custom' ? 'CRON' : dateType) as TaskExecStrategy,
          days: dateType === CrontabDateType.weekly ? dayOfWeek : dayOfMonth,
          hours: hour,
          cronExpression: cronString,
        };
      }
      setConfirmLoading(true);
      let resCount;
      if (isEdit) {
        resCount = await updateSchedule(params);
      } else {
        resCount = await createSchedule(params);
      }
      setConfirmLoading(false);
      if (resCount?.data) {
        onClose();
        setCreateScheduleDatabase(undefined);
        !isEdit && message.success('新建成功');
        isEdit && message.success('修改成功');
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handlePlansConfigChange = (configs: any[]) => {
    const newConfigs = tableConfigs?.map((item) => {
      const planValue = configs.find((value) => value.__id === item.__id);
      return planValue ? planValue : item;
    });
    setTableConfigs(newConfigs);
  };
  useEffect(() => {
    if (tableConfigs?.length) {
      const disabledSubmit = tableConfigs?.some((item) => !item.strategies);
      setDisabledSubmit(disabledSubmit);
    }
  }, [tableConfigs]);

  useEffect(() => {
    loadData();
  }, [databaseId, sessionId]);

  useEffect(() => {
    const databaseId = partitionPlanData?.databaseId;
    const id = partitionPlanData?.id;
    if (databaseId) {
      form.setFieldsValue({
        databaseId,
      });
    }
    if (id) {
      loadEditData(id);
    }
    return () => {
      setCreateScheduleDatabase(undefined);
    };
  }, []);

  useEffect(() => {
    if (triggerStrategy !== TaskExecStrategy.TIMER) {
      form.setFieldsValue({
        isCustomStrategy: false,
      });
    }
  }, [triggerStrategy]);

  const { run: fetchScheduleDetail, loading } = useRequest(getScheduleDetail, {
    manual: true,
  });

  const loadEditData = async (editId: number) => {
    const detailRes = (await fetchScheduleDetail(editId)) as IScheduleRecord<IPartitionPlan>;
    setCreateScheduleDatabase(detailRes?.parameters?.databaseInfo);
    const { parameters } = detailRes ?? {};
    const { creationTrigger, droppingTrigger } = parameters ?? {};
    const formData = {
      ...parameters,
      isCustomStrategy: !!detailRes?.parameters?.droppingTrigger,
      timeoutMillis: milliSecondsToHour(detailRes?.parameters.timeoutMillis),
      scheduleName: detailRes?.scheduleName,
      triggerStrategy: detailRes?.triggerConfig?.triggerStrategy,
      startAt: undefined,
    };
    if (creationTrigger) {
      const { triggerStrategy, cronExpression, hours, days, startAt } = creationTrigger ?? {};
      if (![TaskExecStrategy.START_NOW, TaskExecStrategy.START_AT].includes(triggerStrategy)) {
        formData.triggerStrategy = TaskExecStrategy.TIMER;
        const crontab = {
          mode:
            triggerStrategy === TaskExecStrategy.CRON ? CrontabMode.custom : CrontabMode.default,
          dateType: triggerStrategy as any,
          cronString: cronExpression,
          hour: hours,
          dayOfMonth: days,
          dayOfWeek: days,
        };
        setCrontab(crontab);
      }
      if (triggerStrategy === TaskExecStrategy.START_AT) {
        formData.startAt = dayjs(startAt) as any;
      }
    }
    if (droppingTrigger) {
      const { triggerStrategy, cronExpression, hours, days } = droppingTrigger ?? {};
      crontabDropRef.current?.setValue({
        mode: triggerStrategy === TaskExecStrategy.CRON ? CrontabMode.custom : CrontabMode.default,
        dateType: triggerStrategy as any,
        cronString: cronExpression,
        hour: hours,
        dayOfMonth: days,
        dayOfWeek: days,
      });
    }
    await form.setFieldsValue(formData);
    setPreTableConfigs(parameters?.partitionTableConfigs);
    const configs = parameters?.partitionTableConfigs?.map((config, index) => ({
      ...config,
      __id: index,
      containsCreateStrategy: config.partitionKeyConfigs?.some(
        (c) => c.strategy === TaskPartitionStrategy.CREATE,
      ),
      containsDropStrategy: config.partitionKeyConfigs?.some(
        (c) => c.strategy === TaskPartitionStrategy.DROP,
      ),
      option: {
        partitionKeyConfigs: config.partitionKeyConfigs?.map((item) => ({
          ...item,
        })),
      },
      strategies: [
        ...(config.partitionKeyConfigs?.some((c) => c.strategy === TaskPartitionStrategy.CREATE)
          ? [TaskPartitionStrategy.CREATE]
          : []),
        ...(config.partitionKeyConfigs?.some((c) => c.strategy === TaskPartitionStrategy.DROP)
          ? [TaskPartitionStrategy.DROP]
          : []),
      ],
    }));
    setCreatedTableConfigs(getCreatedTableConfigs(configs));
    setCreatedOriginTableConfigs(configs);
    setTableConfigs(getCreatedTableConfigs(configs));
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AnchorContainer
        items={[
          {
            key: 'baseInfo',
            href: '#baseInfo',
            title: '基本信息',
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
            layout="vertical"
            requiredMark="optional"
            initialValues={{
              errorStrategy: TaskErrorStrategy.ABORT,
              timeoutMillis: 2,
              triggerStrategy: TaskExecStrategy.START_NOW,
            }}
          >
            <h3 id="baseInfo" className={styles.title}>
              基本信息
            </h3>
            <DatabaseSelect
              disabled={isEdit}
              projectId={projectId}
              scheduleType={ScheduleType.PARTITION_PLAN}
              onChange={(v, db) => {
                setCreateScheduleDatabase(db);
              }}
              onInit={(db) => setCreateScheduleDatabase(db)}
            />
            {hasPartitionPlan && (
              <Alert
                message={'当前数据库已存在分区计划，审批通过后覆盖原有分区计划'}
                type="warning"
                style={{ marginBottom: '8px' }}
                showIcon
              />
            )}

            <Spin spinning={fetchPartitionPlanTablesLoading}>
              <Form.Item
                label={
                  formatMessage({
                    id: 'src.component.Task.PartitionTask.CreateModal.3383DFA3',
                    defaultMessage: '分区策略',
                  }) /*"分区策略"*/
                }
                required
                className={styles.tableWrapper}
              >
                <PartitionPolicyFormTable
                  databaseId={databaseId}
                  sessionId={sessionId}
                  tableConfigs={tableConfigs}
                  createdTableConfigs={createdTableConfigs}
                  onPlansConfigChange={handlePlansConfigChange}
                  onLoad={loadData}
                />
              </Form.Item>
            </Spin>
            <Divider />
            <h3 id="executionMethod" className={styles.title}>
              执行方式
            </h3>
            <Form.Item
              label={formatMessage({
                id: 'odc.DataArchiveTask.CreateModal.ExecutionMethod',
                defaultMessage: '执行方式',
              })}
              name="triggerStrategy"
              required
            >
              <Radio.Group>
                <Radio.Button value={TaskExecStrategy.START_NOW}>
                  {
                    formatMessage({
                      id: 'odc.DataArchiveTask.CreateModal.ExecuteNow',
                      defaultMessage: '立即执行',
                    }) /*立即执行*/
                  }
                </Radio.Button>
                <Radio.Button value={TaskExecStrategy.START_AT}>
                  {
                    formatMessage({
                      id: 'odc.DataArchiveTask.CreateModal.ScheduledExecution',
                      defaultMessage: '定时执行',
                    }) /*定时执行*/
                  }
                </Radio.Button>
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
                const triggerStrategy = getFieldValue('triggerStrategy') || [];

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
                        onValueChange={(value) => {
                          handleCrontabChange(value);
                        }}
                      />
                    </Form.Item>
                  );
                }
              }}
            </Form.Item>
            <Form.Item name="isCustomStrategy" valuePropName="checked">
              <Checkbox disabled={triggerStrategy !== TaskExecStrategy.TIMER}>
                <span>
                  {
                    formatMessage({
                      id: 'src.component.Task.PartitionTask.CreateModal.BE341FCE' /*自定义删除策略执行周期*/,
                      defaultMessage: '自定义删除策略执行周期',
                    }) /* 自定义删除策略执行周期 */
                  }
                </span>
                {!isCustomStrategy && (
                  <Paragraph>
                    <Text type="secondary">
                      {
                        formatMessage({
                          id: 'src.component.Task.PartitionTask.CreateModal.5DEF5FCE' /*未勾选时，删除策略执行周期将与创建一致*/,
                          defaultMessage: '未勾选时，删除策略执行周期将与创建一致',
                        }) /* 未勾选时，删除策略执行周期将与创建一致 */
                      }
                    </Text>
                  </Paragraph>
                )}
              </Checkbox>
            </Form.Item>
            {isCustomStrategy && (
              <Form.Item>
                <Crontab
                  ref={crontabDropRef}
                  title={
                    formatMessage({
                      id: 'src.component.Task.PartitionTask.CreateModal.4E5BCFE8',
                      defaultMessage: '删除策略执行周期',
                    }) /*"删除策略执行周期"*/
                  }
                  initialValue={crontab}
                  onValueChange={(value) => {
                    handleCrontabChange(value, true);
                  }}
                />
              </Form.Item>
            )}
            <h3 id="scheduleSetting" className={styles.title}>
              作业设置
            </h3>
            <FormItemPanel keepExpand>
              <Form.Item
                label={
                  formatMessage({
                    id: 'src.component.Task.PartitionTask.CreateModal.0B2DB017',
                    defaultMessage: '任务错误处理',
                  }) /*"任务错误处理"*/
                }
                name="errorStrategy"
                rules={rules.errorStrategy}
              >
                <Radio.Group
                  options={[
                    {
                      label: formatMessage({
                        id: 'src.component.Task.PartitionTask.CreateModal.A8B04845',
                        defaultMessage: '停止任务',
                      }),
                      value: TaskErrorStrategy.ABORT,
                    },
                    {
                      label: formatMessage({
                        id: 'src.component.Task.PartitionTask.CreateModal.E454F701',
                        defaultMessage: '忽略错误继续任务',
                      }),
                      value: TaskErrorStrategy.CONTINUE,
                    },
                  ]}
                />
              </Form.Item>
            </FormItemPanel>
            <Form.Item
              label={
                formatMessage({
                  id: 'src.component.Task.PartitionTask.CreateModal.59540029',
                  defaultMessage: '执行超时时间',
                }) /*"执行超时时间"*/
              }
              required
            >
              <Form.Item
                label={
                  formatMessage({
                    id: 'src.component.Task.PartitionTask.CreateModal.0A49F493',
                    defaultMessage: '小时',
                  }) /*"小时"*/
                }
                name="timeoutMillis"
                rules={rules.timeoutMillis as Rule[]}
                noStyle
              >
                <InputNumber min={0} precision={1} />
              </Form.Item>
              <span style={{ marginLeft: '5px' }}>
                {
                  formatMessage({
                    id: 'src.component.Task.PartitionTask.CreateModal.53678847' /*小时*/,
                    defaultMessage: '小时',
                  }) /* 小时 */
                }
              </span>
            </Form.Item>
          </Form>
        </Spin>
      </AnchorContainer>
      <div style={{ padding: '16px 16px 0px 0px' }}>
        <Space>
          <Button onClick={closeWithConfirm}>
            {
              formatMessage({
                id: 'odc.components.PartitionDrawer.Cancel',
                defaultMessage: '取消',
              }) /*取消*/
            }
          </Button>
          <Tooltip
            title={
              disabledSubmit
                ? formatMessage({
                    id: 'odc.components.PartitionDrawer.SetPartitionPoliciesForAll',
                    defaultMessage: '请设置所有 Range 分区表的分区策略',
                  }) //请设置所有 Range 分区表的分区策略
                : null
            }
          >
            <Button
              disabled={disabledSubmit}
              type="primary"
              loading={confirmLoading}
              onClick={() => {
                handleSubmit();
              }}
            >
              {
                formatMessage({
                  id: 'odc.components.PartitionDrawer.Submit',
                  defaultMessage: '提交',
                }) /*提交*/
              }
            </Button>
          </Tooltip>
        </Space>
      </div>
      <CreateTaskConfirmModal
        database={createScheduleDatabase}
        initName={form.getFieldValue('scheduleName')}
        open={open}
        isSchedule
        setOpen={setOpen}
        onOk={(scheduleName) => {
          handleSubmit(scheduleName);
        }}
      />
    </div>
  );
};
export default inject('scheduleStore', 'pageStore')(observer(Create));
