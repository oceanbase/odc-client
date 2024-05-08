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

import { createTask, getPartitionPlanTables } from '@/common/network/task';
import Crontab from '@/component/Crontab';
import { CrontabDateType, ICrontab } from '@/component/Crontab/interface';
import FormItemPanel from '@/component/FormItemPanel';
import {
  IPartitionPlanKeyType,
  IPartitionTableConfig,
  PARTITION_KEY_INVOKER,
  PARTITION_NAME_INVOKER,
  TaskErrorStrategy,
  TaskExecStrategy,
  TaskPageScope,
  TaskPageType,
  TaskPartitionStrategy,
  TaskType,
} from '@/d.ts';
import { openTasksPage } from '@/store/helper/page';
import { ModalStore } from '@/store/modal';
import { useDBSession } from '@/store/sessionManager/hooks';
import { formatMessage } from '@/util/intl';
import { hourToMilliSeconds } from '@/util/utils';
import {
  Alert,
  Button,
  Checkbox,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Space,
  Tooltip,
  Typography,
} from 'antd';
import { DrawerProps } from 'antd/es/drawer';
import { inject, observer } from 'mobx-react';
import moment from 'moment';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import DatabaseSelect from '../../component/DatabaseSelect';
import PartitionPolicyFormTable from '../../component/PartitionPolicyFormTable';
import { START_DATE } from '../../component/PartitionPolicyFormTable/const';
import styles from './index.less';

const { Paragraph, Text } = Typography;

const historyPartitionKeyInvokers = [
  PARTITION_KEY_INVOKER.HISTORICAL_PARTITION_PLAN_CREATE_GENERATOR,
  PARTITION_KEY_INVOKER.HISTORICAL_PARTITION_PLAN_DROP_GENERATOR,
];

const validPartitionKeyInvokers = [
  PARTITION_KEY_INVOKER.CUSTOM_GENERATOR,
  PARTITION_KEY_INVOKER.TIME_INCREASING_GENERATOR,
  PARTITION_KEY_INVOKER.KEEP_MOST_LATEST_GENERATOR,
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
          ? moment(generateParameter?.baseTimestampMillis)
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

interface IProps extends Pick<DrawerProps, 'visible'> {
  modalStore?: ModalStore;
  projectId?: number;
  theme?: string;
}
const CreateModal: React.FC<IProps> = inject('modalStore')(
  observer((props) => {
    const { modalStore, projectId, theme } = props;
    const { partitionVisible, partitionData } = modalStore;
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
    const databaseId = Form.useWatch('databaseId', form);
    const { session } = useDBSession(databaseId);
    const sessionId = session?.sessionId;
    const crontabRef = useRef<{
      setValue: (value: ICrontab) => void;
      resetFields: () => void;
    }>();
    const crontabDropRef = useRef<{
      setValue: (value: ICrontab) => void;
      resetFields: () => void;
    }>();

    const loadData = async () => {
      if (sessionId && databaseId) {
        const res = await getPartitionPlanTables(sessionId, databaseId);
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
        const createdTableConfigs = getCreatedTableConfigs(createdOriginTableConfigs);
        const historyOriginTableConfigs = allPartitionPlanTableConfigs?.filter(
          ({ partitionKeyConfigs }) => {
            return partitionKeyConfigs?.some((item) =>
              historyPartitionKeyInvokers.includes(item?.partitionKeyInvoker),
            );
          },
        );
        setCreatedTableConfigs(createdTableConfigs);
        setCreatedOriginTableConfigs(createdOriginTableConfigs);
        setHistoryOriginTableConfigs(historyOriginTableConfigs);
        setHasPartitionPlan(hasPartitionPlan);
        console.log(
          'createdTableConfigs',
          createdTableConfigs,
          createdOriginTableConfigs,
          allPartitionPlanTableConfigs,
        );
        setTableConfigs(
          res?.contents?.map((config, index) => {
            const strategies = [];
            const {
              containsCreateStrategy,
              containsDropStrategy,
              name: tableName,
              partition,
              partitionMode,
            } = config;
            if (containsCreateStrategy) {
              strategies.push(TaskPartitionStrategy.CREATE);
            }
            if (containsDropStrategy) {
              strategies.push(TaskPartitionStrategy.DROP);
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
          }),
        );
      }
    };

    const onClose = useCallback(() => {
      form?.resetFields();
      setCrontab(null);
      setDropCrontab(null);
      setDisabledSubmit(true);
      setHasPartitionPlan(false);
      setTableConfigs([]);
      modalStore.changePartitionModal(false);
    }, [modalStore]);
    const closeWithConfirm = useCallback(() => {
      Modal.confirm({
        title: formatMessage({
          id: 'odc.components.PartitionDrawer.AreYouSureYouWant',
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

    const handleSubmit = async () => {
      try {
        const values = await form.validateFields();
        const { description, databaseId, timeoutMillis, errorStrategy } = values;
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
                  const currentTimeParameter = {
                    fromCurrentTime: fromCurrentTime === START_DATE.CURRENT_DATE,
                    baseTimestampMillis: baseTimestampMillis?.valueOf(),
                  };
                  if (fromCurrentTime !== START_DATE.CUSTOM_DATE) {
                    delete currentTimeParameter.baseTimestampMillis;
                  }
                  return {
                    partitionKey,
                    partitionKeyInvoker,
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
        const params = {
          taskType: TaskType.PARTITION_PLAN,
          description,
          projectId,
          databaseId,
          parameters: {
            databaseId,
            enabled: true,
            partitionTableConfigs,
            creationTrigger: null,
            droppingTrigger: null,
            timeoutMillis: hourToMilliSeconds(timeoutMillis),
            errorStrategy,
          },
        };
        const { mode, dateType, cronString, hour, dayOfMonth, dayOfWeek } = crontab;
        params.parameters.creationTrigger = {
          triggerStrategy: (mode === 'custom' ? 'CRON' : dateType) as TaskExecStrategy,
          days: dateType === CrontabDateType.weekly ? dayOfWeek : dayOfMonth,
          hours: hour,
          cronExpression: cronString,
        };
        if (isCustomStrategy) {
          const { mode, dateType, cronString, hour, dayOfMonth, dayOfWeek } = dropCrontab;
          params.parameters.droppingTrigger = {
            triggerStrategy: (mode === 'custom' ? 'CRON' : dateType) as TaskExecStrategy,
            days: dateType === CrontabDateType.weekly ? dayOfWeek : dayOfMonth,
            hours: hour,
            cronExpression: cronString,
          };
        }
        setConfirmLoading(true);
        const resCount = await createTask(params);
        setConfirmLoading(false);
        if (resCount) {
          onClose();
          openTasksPage(TaskPageType.PARTITION_PLAN, TaskPageScope.CREATED_BY_CURRENT_USER);
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
      const databaseId = partitionData?.databaseId;
      if (databaseId) {
        form.setFieldsValue({
          databaseId,
        });
      }
    }, [partitionData?.databaseId]);
    return (
      <Drawer
        open={partitionVisible}
        onClose={closeWithConfirm}
        destroyOnClose
        width={720}
        title={formatMessage({
          id: 'odc.components.PartitionDrawer.CreateAPartitionPlan',
        })}
        /*新建分区计划*/ footer={
          <Space
            style={{
              float: 'right',
            }}
          >
            <Button onClick={closeWithConfirm}>
              {
                formatMessage({
                  id: 'odc.components.PartitionDrawer.Cancel',
                }) /*取消*/
              }
            </Button>
            <Tooltip
              title={
                disabledSubmit
                  ? formatMessage({
                      id: 'odc.components.PartitionDrawer.SetPartitionPoliciesForAll',
                    }) //请设置所有 Range 分区表的分区策略
                  : null
              }
            >
              <Button
                disabled={disabledSubmit}
                type="primary"
                loading={confirmLoading}
                onClick={handleSubmit}
              >
                {
                  formatMessage({
                    id: 'odc.components.PartitionDrawer.Submit',
                  }) /*提交*/
                }
              </Button>
            </Tooltip>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark="optional"
          initialValues={{
            errorStrategy: TaskErrorStrategy.ABORT,
            timeoutMillis: 2,
          }}
        >
          <DatabaseSelect projectId={projectId} type={TaskType.PARTITION_PLAN} />
          {hasPartitionPlan && (
            <Alert
              message={
                formatMessage({
                  id: 'src.component.Task.PartitionTask.CreateModal.518BD6F7',
                }) /*"当前数据库已存在一个分区计划，审批通过后覆盖原有分区计划"*/
              }
              type="warning"
              style={{ marginBottom: '8px' }}
              showIcon
            />
          )}

          <Form.Item
            label={
              formatMessage({
                id: 'src.component.Task.PartitionTask.CreateModal.3383DFA3',
              }) /*"分区策略"*/
            }
            required
            className={styles.tableWrapper}
          >
            <PartitionPolicyFormTable
              theme={theme}
              databaseId={databaseId}
              sessionId={sessionId}
              tableConfigs={tableConfigs}
              createdTableConfigs={createdTableConfigs}
              onPlansConfigChange={handlePlansConfigChange}
              onLoad={loadData}
            />
          </Form.Item>
          <Divider />
          <Form.Item>
            <Crontab
              ref={crontabRef}
              title={
                formatMessage({
                  id: 'src.component.Task.PartitionTask.CreateModal.FE8DED05',
                }) /*"创建策略执行周期"*/
              }
              initialValue={crontab}
              onValueChange={(value) => {
                handleCrontabChange(value);
              }}
            />
          </Form.Item>
          <Form.Item name="isCustomStrategy" valuePropName="checked">
            <Checkbox>
              <span>
                {
                  formatMessage({
                    id: 'src.component.Task.PartitionTask.CreateModal.BE341FCE' /*自定义删除策略执行周期*/,
                  }) /* 自定义删除策略执行周期 */
                }
              </span>
              {!isCustomStrategy && (
                <Paragraph>
                  <Text type="secondary">
                    {
                      formatMessage({
                        id: 'src.component.Task.PartitionTask.CreateModal.5DEF5FCE' /*未勾选时，删除策略执行周期将与创建一致*/,
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
                  }) /*"删除策略执行周期"*/
                }
                initialValue={crontab}
                onValueChange={(value) => {
                  handleCrontabChange(value, true);
                }}
              />
            </Form.Item>
          )}

          <FormItemPanel
            label={
              formatMessage({
                id: 'src.component.Task.PartitionTask.CreateModal.5E1CE4EC',
              }) /*"任务设置"*/
            }
            keepExpand
          >
            <Form.Item
              label={
                formatMessage({
                  id: 'src.component.Task.PartitionTask.CreateModal.0B2DB017',
                }) /*"任务错误处理"*/
              }
              name="errorStrategy"
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'src.component.Task.PartitionTask.CreateModal.6C651A64',
                  }), //'请选择任务错误处理'
                },
              ]}
            >
              <Radio.Group>
                <Radio value={TaskErrorStrategy.ABORT}>
                  {
                    formatMessage({
                      id: 'src.component.Task.PartitionTask.CreateModal.A8B04845' /*停止任务*/,
                    }) /* 停止任务 */
                  }
                </Radio>
                <Radio value={TaskErrorStrategy.CONTINUE}>
                  {
                    formatMessage({
                      id: 'src.component.Task.PartitionTask.CreateModal.E454F701' /*忽略错误继续任务*/,
                    }) /* 忽略错误继续任务 */
                  }
                </Radio>
              </Radio.Group>
            </Form.Item>
          </FormItemPanel>
          <Form.Item
            label={
              formatMessage({
                id: 'src.component.Task.PartitionTask.CreateModal.59540029',
              }) /*"执行超时时间"*/
            }
            required
          >
            <Form.Item
              label={
                formatMessage({
                  id: 'src.component.Task.PartitionTask.CreateModal.0A49F493',
                }) /*"小时"*/
              }
              name="timeoutMillis"
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'src.component.Task.PartitionTask.CreateModal.05B817DF',
                  }), //'请输入超时时间'
                },
                {
                  type: 'number',
                  max: 480,
                  message: formatMessage({
                    id: 'src.component.Task.PartitionTask.CreateModal.25D1BD6D',
                  }), //'最大不超过480小时'
                },
              ]}
              noStyle
            >
              <InputNumber min={0} precision={1} />
            </Form.Item>
            <span style={{ marginLeft: '5px' }}>
              {
                formatMessage({
                  id: 'src.component.Task.PartitionTask.CreateModal.53678847' /*小时*/,
                }) /* 小时 */
              }
            </span>
          </Form.Item>
          <Form.Item
            name="description"
            label={formatMessage({
              id: 'odc.components.PartitionDrawer.Remarks',
            })} /*备注*/
          >
            <Input.TextArea
              rows={5}
              placeholder={
                formatMessage({
                  id: 'src.component.Task.PartitionTask.CreateModal.026392ED',
                }) /*"请输入描述，200字以内；未输入时，系统会根据对象和工单类型自动生成描述信息"*/
              }
            />
          </Form.Item>
        </Form>
      </Drawer>
    );
  }),
);
export default CreateModal;
