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
import HelpDoc from '@/component/helpDoc';
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
  Input,
  InputNumber,
  Popconfirm,
  Radio,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { TaskPartitionStrategyMap } from '../../const';
import { ITableConfig } from '../../PartitionTask/CreateModal';
import {
  getPartitionKeyInvokerByIncrementFieldType,
  INCREAMENT_FIELD_TYPE,
  START_DATE,
} from './const';
import EditTable from './EditTable';
import styles from './index.less';
import PreviewSQLModal from './PreviewSQLModal';

const { Text } = Typography;

export enum NameRuleType {
  PRE_SUFFIX = 'PRE_SUFFIX',
  CUSTOM = 'CUSTOM',
}

export const intervalPrecisionOptions = [
  {
    label: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.436BC171',
      defaultMessage: '秒',
    }), //'秒'
    value: 63,
  },
  {
    label: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.0E0CEBAC',
      defaultMessage: '分',
    }), //'分'
    value: 31,
  },
  {
    label: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.9EC2D1FF',
      defaultMessage: '时',
    }), //'时'
    value: 15,
  },
  {
    label: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.1E11DFEA',
      defaultMessage: '日',
    }), //'日'
    value: 7,
  },
  {
    label: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.1FB1ABDC',
      defaultMessage: '月',
    }), //'月'
    value: 3,
  },
  {
    label: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.069255DB',
      defaultMessage: '年',
    }), //'年'
    value: 1,
  },
];

const defaultInitialValues = {
  strategies: [TaskPartitionStrategy.CREATE, TaskPartitionStrategy.DROP],
  nameRuleType: NameRuleType.PRE_SUFFIX,
  interval: 1,
  reloadIndexes: true,
  namingPrefix: 'p',
  namingSuffixExpression: 'yyyyMMdd',
  namingSuffixStrategy: PartitionBound.PARTITION_LOWER_BOUND,
};

const StrategyOptions = Object.keys(TaskPartitionStrategyMap)?.map((key) => ({
  label: TaskPartitionStrategyMap[key],
  value: key,
}));

const nameRuleOptions = [
  {
    label: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.EB655A6C',
      defaultMessage: '前缀 + 后缀',
    }), //'前缀 + 后缀'
    value: NameRuleType.PRE_SUFFIX,
  },
  {
    label: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.AB4964B2',
      defaultMessage: '自定义',
    }), //'自定义'
    value: NameRuleType.CUSTOM,
  },
];

interface IProps {
  visible: boolean;
  isBatch: boolean;
  sessionId: string;
  configs: ITableConfig[];
  theme?: string;
  onClose: () => void;
  onChange?: (values: ITableConfig[]) => void;
}

const suffixOptions = [
  {
    label: 'yyyy',
    value: 'yyyy',
  },

  {
    label: 'yyyyMMdd',
    value: 'yyyyMMdd',
  },

  {
    label: 'yyyyMM',
    value: 'yyyyMM',
  },

  {
    label: 'yyyy_MM_dd',
    value: 'yyyy_MM_dd',
  },

  {
    label: 'yyyy_MM',
    value: 'yyyy_MM',
  },
];

const DropConfigMessage = formatMessage({
  id: 'src.component.Task.component.PartitionPolicyFormTable.A9C95E9D',
  defaultMessage:
    '当前表如果包含全局索引，删除分区会导致全局索引失效，如果选择重建全局索引可能耗时很久，请谨慎操作',
}); /*"当前表如果包含全局索引，删除分区会导致全局索引失效，请谨慎操作，如果选择重建全局索引可能耗时很久，请谨慎操作"*/

const CreateConfigMessage = formatMessage({
  id: 'src.component.Task.component.PartitionPolicyFormTable.8DC77765',
  defaultMessage:
    '当前表如果属于表组（tablegroup），创建分区可能会失败或破坏负载均衡，请谨慎配置创建策略',
}); /*"当前表如果属于表组（tablegroup），创建分区可能会失败或破坏负载均衡，请谨慎配置创建策略"*/

export const getAlertMessage = (strategies: TaskPartitionStrategy[]) => {
  const messages = [];
  if (strategies?.includes(TaskPartitionStrategy.DROP)) {
    messages.push(DropConfigMessage);
  }
  if (strategies?.includes(TaskPartitionStrategy.CREATE)) {
    messages.push(CreateConfigMessage);
  }
  return messages;
};

export const getUnitLabel = (value: number) => {
  return intervalPrecisionOptions.find((item) => item.value === value)?.label;
};

const ConfigDrawer: React.FC<IProps> = (props) => {
  const { visible, configs, isBatch, sessionId, theme, onClose } = props;
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
  const partitionKeyOptions =
    configs?.[0]?.option?.partitionKeyConfigs?.map((item) => ({
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

  const submitBtn = useMemo(() => {
    const isSingleGenerateCount = generateCount === 1;
    const isSingleGenerateCountMessage =
      '当前预创建分区数量过小，若调度失败恐影响业务运行，建议调整预创建分区数量至2个及以上。';
    const isBatchMessage = formatMessage({
      id: 'odc.components.PartitionPolicyTable.configModal.BatchSettingWillOverwriteThe',
      defaultMessage: '批量设置将覆盖原有的策略，是否确定设置？',
    });
    if (isBatch) {
      return (
        <Popconfirm
          overlayStyle={{ width: '216px' }}
          title={
            isSingleGenerateCount ? (
              <>
                <div>{isSingleGenerateCountMessage}</div>
                <div>{isBatchMessage}</div>
              </>
            ) : (
              isBatchMessage
            )
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
          <Button type="primary">
            {
              formatMessage({
                id: 'odc.components.PartitionPolicyTable.configModal.Ok',
                defaultMessage: '确定',
              }) /*确定*/
            }
          </Button>
        </Popconfirm>
      );
    }
    if (isSingleGenerateCount) {
      return (
        <Popconfirm
          overlayStyle={{ width: '216px' }}
          title={isSingleGenerateCountMessage}
          onConfirm={handleOk}
          okText={formatMessage({
            id: 'odc.components.PartitionPolicyTable.configModal.Ok',
            defaultMessage: '确定',
          })} /*确定*/
          cancelText={formatMessage({
            id: 'odc.components.PartitionPolicyTable.configModal.Return',
            defaultMessage: '返回',
          })} /*返回*/
          placement="topRight"
        >
          <Button type="primary">
            {
              formatMessage({
                id: 'odc.components.PartitionPolicyTable.configModal.Ok',
                defaultMessage: '确定',
              }) /*确定*/
            }
          </Button>
        </Popconfirm>
      );
    }
    return (
      <Button type="primary" onClick={handleOk}>
        {
          formatMessage({
            id: 'odc.components.PartitionPolicyTable.configModal.Ok',
            defaultMessage: '确定',
          }) /*确定*/
        }
      </Button>
    );
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
          <Tooltip title={strategies?.length ? null : '暂未设置创建策略，无 SQL 可预览'}>
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
        <Descriptions column={1} style={{ paddingBottom: 16 }}>
          <Descriptions.Item
            label={
              formatMessage({
                id: 'src.component.Task.component.PartitionPolicyFormTable.AE09B3CB',
                defaultMessage: '分区表',
              }) /*"分区表"*/
            }
          >
            {`${tableLabels}${moreText}`}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              formatMessage({
                id: 'src.component.Task.component.PartitionPolicyFormTable.D50C1358',
                defaultMessage: '分区类型',
              }) /*"分区类型"*/
            }
          >
            Range
          </Descriptions.Item>
        </Descriptions>
        <Form.Item
          name="strategies"
          label={
            formatMessage({
              id: 'src.component.Task.component.PartitionPolicyFormTable.7632AF45',
              defaultMessage: '分区策略',
            }) /*"分区策略"*/
          }
        >
          <Checkbox.Group options={StrategyOptions} />
        </Form.Item>
        {!!alertMessage.length && (
          <Alert
            message={alertMessage?.map((item) => (
              <div>{item}</div>
            ))}
            type="warning"
            style={{ marginBottom: '8px' }}
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
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'src.component.Task.component.PartitionPolicyFormTable.16355175',
                    defaultMessage: '请输入预创建分区数量',
                  }), //'请输入预创建分区数量'
                },
              ]}
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
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'src.component.Task.component.PartitionPolicyFormTable.87D4D0BB',
                    defaultMessage: '请选择',
                  }), //'请选择'
                },
              ]}
            >
              <Select options={nameRuleOptions} style={{ width: 120 }} />
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
                  ? "分区名的生成规则，可引用变量。比如：concat('P_',${COL1})，其中 COL1 表示分区表的分区键。"
                  : null
              }
            >
              <Space size={8} align="start" style={{ width: '100%' }}>
                {isCustomRuleType ? (
                  <Space>
                    <Form.Item
                      name="generateExpr"
                      className={styles.noMarginBottom}
                      rules={[
                        {
                          required: true,
                          message: formatMessage({
                            id: 'src.component.Task.component.PartitionPolicyFormTable.E5DA1FA4',
                            defaultMessage: '请输入表达式',
                          }), //'请输入表达式'
                        },
                      ]}
                      style={{ width: 320 }}
                    >
                      <Input
                        placeholder={
                          formatMessage({
                            id: 'src.component.Task.component.PartitionPolicyFormTable.23B74BBB',
                            defaultMessage: '请输入表达式',
                          }) /*"请输入表达式"*/
                        }
                        addonBefore={
                          formatMessage({
                            id: 'src.component.Task.component.PartitionPolicyFormTable.D97787FE',
                            defaultMessage: '表达式',
                          }) /*"表达式"*/
                        }
                      />
                    </Form.Item>
                  </Space>
                ) : (
                  <Space size={8} align="start">
                    <Form.Item
                      validateFirst
                      className={styles.noMarginBottom}
                      name="namingPrefix"
                      rules={[
                        {
                          required: true,
                          message: formatMessage({
                            id: 'src.component.Task.component.PartitionPolicyFormTable.4293BED4',
                            defaultMessage: '请输入前缀',
                          }), //'请输入前缀'
                        },
                        {
                          pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
                          message: formatMessage({
                            id: 'src.component.Task.component.PartitionPolicyFormTable.F70A7891',
                            defaultMessage: '仅支持英文/数字/下划线，且以英文开头',
                          }), //'仅支持英文/数字/下划线，且以英文开头'
                        },
                        {
                          max: 32,
                          message: formatMessage({
                            id: 'src.component.Task.component.PartitionPolicyFormTable.D76C944C',
                            defaultMessage: '不超过32个字符',
                          }), //'不超过32个字符'
                        },
                      ]}
                      style={{ width: 140 }}
                    >
                      <Input
                        addonBefore={
                          formatMessage({
                            id: 'src.component.Task.component.PartitionPolicyFormTable.7D91EBA7',
                            defaultMessage: '前缀',
                          }) /*"前缀"*/
                        }
                        placeholder={
                          formatMessage({
                            id: 'src.component.Task.component.PartitionPolicyFormTable.D2573F4C',
                            defaultMessage: '请输入前缀',
                          }) /*"请输入前缀"*/
                        }
                      />
                    </Form.Item>
                    <Input.Group compact>
                      <Tag className={styles.suffix}>
                        <HelpDoc
                          leftText
                          isTip
                          title={formatMessage({
                            id: 'src.component.Task.component.PartitionPolicyFormTable.BB3B1843',
                            defaultMessage: '后缀根据指定的分区键取值策略生成',
                          })}
                        >
                          {
                            formatMessage({
                              id: 'src.component.Task.component.PartitionPolicyFormTable.0F79EE9C' /*后缀*/,
                              defaultMessage: '后缀',
                            }) /* 后缀 */
                          }
                        </HelpDoc>
                      </Tag>
                      <Form.Item
                        name="refPartitionKey"
                        className={styles.noMarginBottom}
                        rules={[
                          {
                            required: true,
                            message: formatMessage({
                              id: 'src.component.Task.component.PartitionPolicyFormTable.CC74D506',
                              defaultMessage: '请选择',
                            }), //'请选择'
                          },
                        ]}
                      >
                        <Select
                          placeholder={
                            formatMessage({
                              id: 'src.component.Task.component.PartitionPolicyFormTable.B7A571C8',
                              defaultMessage: '请选择',
                            }) /*"请选择"*/
                          }
                          optionLabelProp="label"
                          options={partitionKeyOptions}
                          dropdownMatchSelectWidth={154}
                          style={{ width: 135 }}
                        />
                      </Form.Item>
                      <Form.Item
                        name="namingSuffixExpression"
                        className={styles.noMarginBottom}
                        rules={[
                          {
                            required: true,
                            message: formatMessage({
                              id: 'src.component.Task.component.PartitionPolicyFormTable.7183DAA0',
                              defaultMessage: '请选择后缀',
                            }), //'请选择后缀'
                          },
                        ]}
                      >
                        <Select
                          placeholder={
                            formatMessage({
                              id: 'src.component.Task.component.PartitionPolicyFormTable.0259BAC2',
                              defaultMessage: '请选择',
                            }) /*"请选择"*/
                          }
                          style={{ width: 124 }}
                          options={suffixOptions}
                        />
                      </Form.Item>
                    </Input.Group>
                    <Input.Group compact>
                      <Tag className={styles.suffix}>
                        {formatMessage({
                          id: 'src.component.Task.component.PartitionPolicyFormTable.7B83EDD7',
                          defaultMessage: '取值策略',
                        })}
                      </Tag>
                      <Form.Item
                        name="namingSuffixStrategy"
                        className={styles.noMarginBottom}
                        rules={[
                          {
                            required: true,
                          },
                        ]}
                      >
                        <Select
                          placeholder={formatMessage({
                            id: 'src.component.Task.component.PartitionPolicyFormTable.ACFEE807',
                            defaultMessage: '请选择',
                          })}
                          dropdownMatchSelectWidth={100}
                          style={{ width: 100 }}
                        >
                          <Select.Option value={PartitionBound.PARTITION_UPPER_BOUND}>
                            {formatMessage({
                              id: 'src.component.Task.component.PartitionPolicyFormTable.602BD66C',
                              defaultMessage: '分区上界',
                            })}
                          </Select.Option>
                          <Select.Option value={PartitionBound.PARTITION_LOWER_BOUND}>
                            {formatMessage({
                              id: 'src.component.Task.component.PartitionPolicyFormTable.2384A1C3',
                              defaultMessage: '分区下界',
                            })}
                          </Select.Option>
                        </Select>
                      </Form.Item>
                    </Input.Group>
                  </Space>
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
            {isCustomRuleType && (
              <Form.Item
                name="intervalGenerateExpr"
                label={
                  formatMessage({
                    id: 'src.component.Task.component.PartitionPolicyFormTable.7BC3752C',
                    defaultMessage: '命名间隔',
                  }) /*"命名间隔"*/
                }
                tooltip={
                  "可在命名规则表达式中通过 ${INTERVAL} 变量引用，比如:concat('P_',${COL1}+${INTERVAL})"
                }
              >
                <Input
                  style={{ width: 180 }}
                  placeholder={
                    formatMessage({
                      id: 'src.component.Task.component.PartitionPolicyFormTable.07788524',
                      defaultMessage: '请输入',
                    }) /*"请输入"*/
                  }
                />
              </Form.Item>
            )}
          </FormItemPanel>
        )}

        {isDropConfigVisible && (
          <FormItemPanel
            keepExpand
            label={
              formatMessage({
                id: 'src.component.Task.component.PartitionPolicyFormTable.40F7E641',
                defaultMessage: '删除分区',
              }) /*"删除分区"*/
            }
          >
            <Space size={40} align="start">
              <Form.Item
                required
                name="keepLatestCount"
                label={
                  <HelpDoc doc="partitionKeepLatestCount" leftText>
                    {
                      formatMessage({
                        id: 'src.component.Task.component.PartitionPolicyFormTable.7D6F23AE' /*分区保留数量*/,
                        defaultMessage: '分区保留数量',
                      }) /* 分区保留数量 */
                    }
                  </HelpDoc>
                }
                rules={[
                  {
                    required: true,
                    message: formatMessage({
                      id: 'src.component.Task.component.PartitionPolicyFormTable.967356C8',
                      defaultMessage: '请输入',
                    }), //'请输入'
                  },
                ]}
              >
                <InputNumber
                  placeholder={
                    formatMessage({
                      id: 'src.component.Task.component.PartitionPolicyFormTable.94B98AF7',
                      defaultMessage: '请输入',
                    }) /*"请输入"*/
                  }
                  min={0}
                  style={{ width: 100 }}
                />
              </Form.Item>
              <Form.Item
                required
                name="reloadIndexes"
                label={
                  formatMessage({
                    id: 'src.component.Task.component.PartitionPolicyFormTable.3C92777E',
                    defaultMessage: '删除后是否重建索引',
                  }) /*"删除后是否重建索引"*/
                }
                rules={[
                  {
                    required: true,
                    message: formatMessage({
                      id: 'src.component.Task.component.PartitionPolicyFormTable.393D1F82',
                      defaultMessage: '请选择',
                    }), //'请选择'
                  },
                ]}
              >
                <Radio.Group>
                  <Radio value={true}>
                    {
                      formatMessage({
                        id: 'src.component.Task.component.PartitionPolicyFormTable.77C8BE4D' /*是*/,
                        defaultMessage: '是',
                      }) /* 是 */
                    }
                  </Radio>
                  <Radio value={false}>
                    {
                      formatMessage({
                        id: 'src.component.Task.component.PartitionPolicyFormTable.E374E7C8' /*否*/,
                        defaultMessage: '否',
                      }) /* 否 */
                    }
                  </Radio>
                </Radio.Group>
              </Form.Item>
            </Space>
          </FormItemPanel>
        )}
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
