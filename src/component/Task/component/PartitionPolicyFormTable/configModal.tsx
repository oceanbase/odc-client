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

import { previewPartitionPlans } from '@/common/network/task';
import Action from '@/component/Action';
import FormItemPanel from '@/component/FormItemPanel';
import { PartitionBound } from '@/constant';
import { PARTITION_KEY_INVOKER, PARTITION_NAME_INVOKER, TaskPartitionStrategy } from '@/d.ts';
import odc from '@/plugins/odc';
import { formatMessage, getLocalDocs } from '@/util/intl';
import {
  Alert,
  Button,
  Checkbox,
  Descriptions,
  Drawer,
  Form,
  InputNumber,
  Popconfirm,
  Select,
  Space,
  Tooltip,
  Typography,
} from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { ITableConfig } from '@/component/Task/modals/PartitionTask/CreateModal';
import {
  getPartitionKeyInvokerByIncrementFieldType,
  INCREAMENT_FIELD_TYPE,
  NameRuleType,
  rules,
  START_DATE,
  StrategyOptions,
} from './const';
import EditTable from './components/EditTable';
import styles from './index.less';
import PreviewSQLModal from './components/PreviewSQLModal';
import { filteredNameRuleOptions, getAlertMessage } from './utils';
import DropPatitionFormItems from './components/DropPartitionFormItems';
import IntervalGenerateExprFormItem from './components/IntervalGenerateExprFormItem';
import PreSuffixNamingRules from './components/PreSuffixNamingRules';
import CustomNamingRules from './components/CustomNamingRules';

const { Text } = Typography;

const defaultInitialValues = {
  strategies: [TaskPartitionStrategy.CREATE, TaskPartitionStrategy.DROP],
  nameRuleType: NameRuleType.PRE_SUFFIX,
  interval: 1,
  reloadIndexes: true,
  namingPrefix: 'p',
  namingSuffixExpression: 'yyyyMMdd',
  namingSuffixStrategy: PartitionBound.PARTITION_LOWER_BOUND,
};

interface IProps {
  visible: boolean;
  isBatch: boolean;
  sessionId: string;
  configs: ITableConfig[];
  theme?: string;
  onClose: () => void;
  onChange?: (values: ITableConfig[]) => void;
  dateTypes: boolean;
}

const ConfigDrawer: React.FC<IProps> = (props) => {
  const { visible, configs, isBatch, sessionId, theme, onClose, dateTypes } = props;
  const [previewSQLVisible, setPreviewSQLVisible] = useState(false);
  const [ruleExample, setRuleExample] = useState('');
  const [previewData, setPreviewData] = useState<
    {
      tableName: string;
      sqls: string[];
    }[]
  >([]);
  const [form] = Form.useForm();
  const strategies = Form.useWatch('strategies', form);
  const nameRuleType = Form.useWatch('nameRuleType', form);
  const generateCount = Form.useWatch('generateCount', form);
  const incrementFieldType = Form.useWatch(
    ['option', 'partitionKeyConfigs', '0', 'incrementFieldType'],
    form,
  );
  const partitionKeyOptions =
    configs?.[0]?.option?.partitionKeyConfigs
      ?.filter(
        (item) =>
          item?.type?.localizedMessage || incrementFieldType === INCREAMENT_FIELD_TYPE.TIME_STRING,
      )
      ?.map((item) => ({
        label: item?.name,
        value: item?.name,
      })) ?? [];
  const alertMessage = getAlertMessage(strategies);
  const isDropConfigVisible = strategies?.includes(TaskPartitionStrategy.DROP);
  const isCreateConfigVisible = strategies?.includes(TaskPartitionStrategy.CREATE);
  const isCustomRuleType = nameRuleType === NameRuleType.CUSTOM;

  const tableNames = configs?.map((item) => item.tableName);

  const tableLen = configs?.length;
  const moreText =
    tableLen > 10
      ? formatMessage(
          {
            id: 'odc.components.PartitionPolicyTable.configModal.WaitForTablelenTables',
            defaultMessage: '...等 {tableLen} 个表',
          },
          { tableLen },
        ) //`...等 ${tableLen} 个表`
      : '';
  const tableLabels = configs
    ?.slice(0, 10)
    ?.map((item) => item?.tableName)
    ?.join('; ');

  const handlePlansConfigChange = (value: ITableConfig) => {
    const values = configs?.map((item) => {
      return {
        ...item,
        ...value,
        __isCreate: true,
      };
    });
    props.onChange(values);
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handlePreview = (isPreview: boolean = true, onlyForPartitionName: boolean = false) => {
    form
      .validateFields()
      .then(async (data) => {
        const {
          strategies,
          generateCount,
          nameRuleType,
          namingPrefix,
          namingSuffixExpression,
          generateExpr,
          option,
          keepLatestCount,
          refPartitionKey,
          intervalGenerateExpr,
          reloadIndexes,
          namingSuffixStrategy,
        } = data;
        const partitionKeyConfigs =
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
            // 创建方式: 自定义
            if (partitionKeyInvoker === PARTITION_KEY_INVOKER.CUSTOM_GENERATOR) {
              return {
                partitionKey,
                partitionKeyInvoker,
                strategy: 'CREATE',
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
              // 创建方式: 顺序递增
              // 时间类型
              // 非时间类型
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
                strategy: 'CREATE',
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

        if (strategies?.includes('DROP')) {
          partitionKeyConfigs.push({
            partitionKeyInvoker: PARTITION_KEY_INVOKER.KEEP_MOST_LATEST_GENERATOR,
            strategy: 'DROP',
            partitionKeyInvokerParameters: {
              keepLatestCount,
              reloadIndexes,
            },
          });
        }

        const formData = {
          tableNames,
          onlyForPartitionName,
          template: {
            partitionKeyConfigs: partitionKeyConfigs?.filter((item) =>
              strategies?.includes(item.strategy),
            ),
            partitionNameInvoker: null,
            partitionNameInvokerParameters: null,
          },
        };

        if (nameRuleType === 'PRE_SUFFIX') {
          formData.template.partitionNameInvoker =
            PARTITION_NAME_INVOKER.DATE_BASED_PARTITION_NAME_GENERATOR;
          formData.template.partitionNameInvokerParameters = {
            partitionNameGeneratorConfig: {
              namingPrefix,
              namingSuffixExpression,
              refPartitionKey,
              namingSuffixStrategy,
            },
          };
        } else {
          formData.template.partitionNameInvoker =
            PARTITION_NAME_INVOKER.CUSTOM_PARTITION_NAME_GENERATOR;
          formData.template.partitionNameInvokerParameters = {
            partitionNameGeneratorConfig: {
              generateExpr,
              intervalGenerateExpr,
            },
          };
        }

        if (strategies?.length === 1 && strategies?.includes('DROP')) {
          delete formData.template.partitionNameInvokerParameters;
        }
        const res = await previewPartitionPlans(sessionId, formData);
        if (res?.contents?.length) {
          if (isPreview) {
            setPreviewSQLVisible(true);
            setPreviewData(res?.contents);
          } else if (onlyForPartitionName) {
            const rule = res?.contents?.map((item) => item?.partitionName)?.join(', ');
            setRuleExample(rule);
          } else {
            handlePlansConfigChange(data);
            handleClose();
          }
        }
      })
      .catch((error) => {
        console.error(JSON.stringify(error));
      });
  };

  const handleTest = async () => {
    handlePreview(false, true);
  };

  const handleOk = () => {
    handlePreview(false);
  };

  const handleClosePreviewSQL = () => {
    setPreviewSQLVisible(false);
  };

  const handleChange = () => {
    setRuleExample('');
  };

  useEffect(() => {
    if (visible) {
      const value = configs?.[0] ?? defaultInitialValues;
      form.setFieldsValue({
        ...value,
        refPartitionKey: partitionKeyOptions?.[0]?.value,
      });
    }
  }, [configs, visible]);

  useEffect(() => {
    if (nameRuleType === NameRuleType.PRE_SUFFIX) {
      form.setFieldValue('refPartitionKey', partitionKeyOptions?.[0]?.value);
    }
  }, [nameRuleType]);

  useEffect(() => {
    if (
      configs?.[0]?.option?.partitionKeyConfigs?.[0]?.incrementFieldType ===
      INCREAMENT_FIELD_TYPE.TIME_STRING
    ) {
      form.setFieldValue('nameRuleType', NameRuleType.PRE_SUFFIX);
    }
  }, [configs]);

  const submitBtn = useMemo(() => {
    const isSingleGenerateCount = generateCount === 1;
    const isSingleGenerateCountMessage = formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.B988E243',
      defaultMessage:
        '当前预创建分区数量过小，若调度失败恐影响业务运行，建议调整预创建分区数量至2个及以上。',
    });

    const isBatchMessage = formatMessage({
      id: 'odc.components.PartitionPolicyTable.configModal.BatchSettingWillOverwriteThe',
      defaultMessage: '批量设置将覆盖原有的策略，是否确定设置？',
    });

    const renderConfirmButton = () => {
      return (
        <Button type="primary">
          {
            formatMessage({
              id: 'odc.components.PartitionPolicyTable.configModal.Ok',
              defaultMessage: '确定',
            }) /*确定*/
          }
        </Button>
      );
    };

    if (isBatch || isSingleGenerateCount) {
      return (
        <Popconfirm
          styles={{ root: { width: '216px' } }}
          title={
            <>
              {isSingleGenerateCount && <div>{isSingleGenerateCountMessage}</div>}
              {isBatch && <div>{isBatchMessage}</div>}
            </>
          } /*批量设置将覆盖原有的策略，是否确定设置？*/
          onConfirm={handleOk}
          okText={formatMessage({
            id: 'odc.components.PartitionPolicyTable.configModal.Ok',
            defaultMessage: '确定',
          })} /*确定*/
          cancelText={formatMessage({
            id: 'odc.components.PartitionPolicyTable.configModal.Return',
            defaultMessage: '返回',
          })} /*返回*/
        >
          {renderConfirmButton()}
        </Popconfirm>
      );
    }
    return renderConfirmButton();
  }, [isBatch, generateCount]);

  return (
    <Drawer
      title={
        isBatch
          ? formatMessage({
              id: 'src.component.Task.component.PartitionPolicyFormTable.C3B6B344',
              defaultMessage: '批量设置分区策略',
            })
          : formatMessage({
              id: 'src.component.Task.component.PartitionPolicyFormTable.F441A07F',
              defaultMessage: '设置分区策略',
            })
      }
      open={visible}
      destroyOnClose
      width={720}
      rootClassName={styles.configDrawer}
      onClose={handleClose}
      footer={
        <Space style={{ float: 'right' }}>
          <Button onClick={handleClose}>
            {
              formatMessage({
                id: 'odc.components.PartitionPolicyTable.configModal.Cancel',
                defaultMessage: '取消',
              }) /*取消*/
            }
          </Button>
          <Tooltip
            title={
              strategies?.length
                ? null
                : formatMessage({
                    id: 'src.component.Task.component.PartitionPolicyFormTable.E753A67D',
                    defaultMessage: '暂未设置创建策略，无 SQL 可预览',
                  })
            }
          >
            <Button
              onClick={() => {
                handlePreview();
              }}
              disabled={!strategies?.length}
            >
              {
                formatMessage({
                  id: 'src.component.Task.component.PartitionPolicyFormTable.E0664950' /*预览 SQL*/,
                  defaultMessage: '预览 SQL',
                }) /* 预览 SQL */
              }
            </Button>
          </Tooltip>
          {submitBtn}
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
        initialValues={{
          ...defaultInitialValues,
          refPartitionKey: partitionKeyOptions?.[0]?.value,
        }}
        onChange={handleChange}
      >
        <Descriptions
          column={1}
          style={{ paddingBottom: 24 }}
          items={[
            {
              key: 1,
              label: formatMessage({
                id: 'src.component.Task.component.PartitionPolicyFormTable.AE09B3CB',
                defaultMessage: '分区表',
              }) /*"分区表"*/,
              children: `${tableLabels}${moreText}`,
            },
            {
              key: '2',
              label: formatMessage({
                id: 'src.component.Task.component.PartitionPolicyFormTable.D50C1358',
                defaultMessage: '分区类型',
              }) /*"分区类型"*/,
              children: 'Range',
            },
          ]}
        />
        <Form.Item
          name="strategies"
          label={
            formatMessage({
              id: 'src.component.Task.component.PartitionPolicyFormTable.7632AF45',
              defaultMessage: '分区策略',
            }) /*"分区策略"*/
          }
          style={{ marginBottom: 16 }}
        >
          <Checkbox.Group options={StrategyOptions} />
        </Form.Item>
        {!!alertMessage.length && (
          <Alert
            message={alertMessage?.map((item) => (
              <div>{item}</div>
            ))}
            type="warning"
            style={{ marginBottom: '16px' }}
            showIcon
          />
        )}

        {isCreateConfigVisible && (
          <FormItemPanel
            keepExpand
            label={
              formatMessage({
                id: 'src.component.Task.component.PartitionPolicyFormTable.8686ABA2',
                defaultMessage: '创建分区',
              }) /*"创建分区"*/
            }
          >
            <Form.Item
              required
              name="generateCount"
              label={
                formatMessage({
                  id: 'src.component.Task.component.PartitionPolicyFormTable.C0FD367F',
                  defaultMessage: '预创建分区数量',
                }) /*"预创建分区数量"*/
              }
              rules={rules.generateCount}
            >
              <InputNumber
                placeholder={
                  formatMessage({
                    id: 'src.component.Task.component.PartitionPolicyFormTable.F4F136CA',
                    defaultMessage: '请输入',
                  }) /*"请输入"*/
                }
                min={1}
                precision={0}
                style={{ width: 100 }}
              />
            </Form.Item>
            <Form.Item
              required
              label={
                <Space>
                  <span>
                    {
                      formatMessage({
                        id: 'src.component.Task.component.PartitionPolicyFormTable.C28CD656' /*创建规则*/,
                        defaultMessage: '创建规则',
                      }) /* 创建规则 */
                    }
                  </span>
                  <Action.Link
                    onClick={() => {
                      window.open(
                        odc.appConfig?.docs.url ||
                          getLocalDocs('320.set-partitioning-strategies.html'),
                      );
                    }}
                  >
                    {
                      formatMessage({
                        id: 'src.component.Task.component.PartitionPolicyFormTable.DF75EB9E' /*如何配置*/,
                        defaultMessage: '如何配置',
                      }) /* 如何配置 */
                    }
                  </Action.Link>
                </Space>
              }
            >
              <EditTable form={form} />
            </Form.Item>
            <Form.Item
              label={
                formatMessage({
                  id: 'src.component.Task.component.PartitionPolicyFormTable.C49FCEB6',
                  defaultMessage: '命名方式',
                }) /*"命名方式"*/
              }
              name="nameRuleType"
              tooltip={formatMessage({
                id: 'src.component.Task.component.PartitionPolicyFormTable.18397BFF',
                defaultMessage: '分区名的生成方式',
              })}
              rules={rules.nameRuleType}
            >
              <Select
                options={filteredNameRuleOptions(dateTypes, incrementFieldType)}
                style={{ width: 120 }}
              />
            </Form.Item>
            <Form.Item
              label={
                formatMessage({
                  id: 'src.component.Task.component.PartitionPolicyFormTable.D82DD59C',
                  defaultMessage: '命名规则',
                }) /*"命名规则"*/
              }
              required
              style={{ marginBottom: '0' }}
              tooltip={
                isCustomRuleType
                  ? formatMessage({
                      id: 'src.component.Task.component.PartitionPolicyFormTable.044700A2',
                      defaultMessage:
                        "分区名的生成规则，可引用变量。比如：concat('P_',${COL1})，其中 COL1 表示分区表的分区键。",
                    })
                  : null
              }
            >
              <Space size={8} align="start" style={{ width: '100%' }}>
                {isCustomRuleType ? (
                  <CustomNamingRules />
                ) : (
                  <PreSuffixNamingRules partitionKeyOptions={partitionKeyOptions} />
                )}
              </Space>
            </Form.Item>
            <Space direction="vertical" size={4} className={styles.testBlock}>
              <Action.Link onClick={handleTest}>
                {
                  formatMessage({
                    id: 'src.component.Task.component.PartitionPolicyFormTable.8067C91E' /*测试生成*/,
                    defaultMessage: '测试生成',
                  }) /* 测试生成 */
                }
              </Action.Link>
              {!!ruleExample && (
                <Text type="secondary">
                  {formatMessage({
                    id: 'src.component.Task.component.PartitionPolicyFormTable.B0571B5B' /*分区名示例:*/,
                    defaultMessage: '分区名示例：',
                  })}

                  {ruleExample}
                </Text>
              )}
            </Space>
            {isCustomRuleType && <IntervalGenerateExprFormItem />}
          </FormItemPanel>
        )}

        {isDropConfigVisible && <DropPatitionFormItems />}
      </Form>
      <PreviewSQLModal
        theme={theme}
        visible={previewSQLVisible}
        previewData={previewData}
        onClose={handleClosePreviewSQL}
      />
    </Drawer>
  );
};

export default ConfigDrawer;
