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

import FormItemPanel from '@/component/FormItemPanel';
import { previewPartitionPlans, getPartitionPlanKeyDataTypes } from '@/common/network/task';
import HelpDoc from '@/component/helpDoc';
import Action from '@/component/Action';
import { TaskPartitionStrategy, PARTITION_KEY_INVOKER, PARTITION_NAME_INVOKER } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { TaskPartitionStrategyMap } from '../../const';
import { START_DATE } from './const';
import EditTable from './EditTable';
import PreviewSQLModal from './PreviewSQLModal';
import { ITableConfig } from '../../PartitionTask/CreateModal';
import {
  Alert,
  Button,
  Checkbox,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Drawer,
  Popconfirm,
  Select,
  Space,
  Tag,
  Radio,
  Typography,
  DatePicker,
} from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less';

const { Text } = Typography;

const startDateOptionValues = [
  {
    label: '当前时间',
    value: START_DATE.CURRENT_DATE,
    description: '从实际执行时间开始命名',
  },
  {
    label: '指定时间',
    value: START_DATE.CUSTOM_DATE,
    description: '从指定时间开始命名',
  },
];

export const startDateOptions = startDateOptionValues.map(({ label, value, description }) => {
  return {
    label: (
      <div>
        <div>{label}</div>
        <Text type="secondary">{description}</Text>
      </div>
    ),

    value,
  };
});

export enum NameRuleType {
  PRE_SUFFIX = 'PRE_SUFFIX',
  CUSTOM = 'CUSTOM',
}

export const intervalPrecisionOptions = [
  {
    label: formatMessage({ id: 'src.component.Task.component.PartitionPolicyFormTable.436BC171' }), //'秒'
    value: 63,
  },
  {
    label: formatMessage({ id: 'src.component.Task.component.PartitionPolicyFormTable.0E0CEBAC' }), //'分'
    value: 31,
  },
  {
    label: formatMessage({ id: 'src.component.Task.component.PartitionPolicyFormTable.9EC2D1FF' }), //'时'
    value: 15,
  },
  {
    label: formatMessage({ id: 'src.component.Task.component.PartitionPolicyFormTable.1E11DFEA' }), //'日'
    value: 7,
  },
  {
    label: formatMessage({ id: 'src.component.Task.component.PartitionPolicyFormTable.1FB1ABDC' }), //'月'
    value: 3,
  },
  {
    label: formatMessage({ id: 'src.component.Task.component.PartitionPolicyFormTable.069255DB' }), //'年'
    value: 1,
  },
];

export const getIntervalPrecisionLabel = (value) => {
  return intervalPrecisionOptions?.find((item) => item.value === value)?.label;
};

const defaultInitialValues = {
  strategies: [TaskPartitionStrategy.CREATE, TaskPartitionStrategy.DROP],
  nameRuleType: NameRuleType.PRE_SUFFIX,
  interval: 1,
  intervalPrecision: 63,
  reloadIndexes: true,
};

const StrategyOptions = Object.keys(TaskPartitionStrategyMap)?.map((key) => ({
  label: TaskPartitionStrategyMap[key],
  value: key,
}));

const nameRuleOptions = [
  {
    label: formatMessage({ id: 'src.component.Task.component.PartitionPolicyFormTable.EB655A6C' }), //'前缀 + 后缀'
    value: NameRuleType.PRE_SUFFIX,
  },
  {
    label: formatMessage({ id: 'src.component.Task.component.PartitionPolicyFormTable.AB4964B2' }), //'自定义'
    value: NameRuleType.CUSTOM,
  },
];

interface IProps {
  visible: boolean;
  isBatch: boolean;
  sessionId: string;
  databaseId: number;
  configs: ITableConfig[];
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

export const getUnitLabel = (value: number) => {
  return intervalPrecisionOptions.find((item) => item.value === value)?.label;
};

const ConfigDrawer: React.FC<IProps> = (props) => {
  const { visible, configs, isBatch, sessionId, databaseId, onClose } = props;
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
  const fromCurrentTime = Form.useWatch('fromCurrentTime', form);
  const isDropConfigVisible = strategies?.includes(TaskPartitionStrategy.DROP);
  const isCreateConfigVisible = strategies?.includes(TaskPartitionStrategy.CREATE);
  const isCustomRuleType = nameRuleType === NameRuleType.CUSTOM;
  const tableNames = configs?.map((item) => item.tableName);
  const firstTableName = tableNames?.[0];

  const tableLen = configs?.length;
  const moreText =
    tableLen > 10
      ? formatMessage(
          {
            id: 'odc.components.PartitionPolicyTable.configModal.WaitForTablelenTables',
          },
          { tableLen: tableLen },
        ) //`...等 ${tableLen} 个表`
      : '';
  const tableLabels = configs
    ?.slice(0, 10)
    ?.map((item) => item?.tableName)
    ?.join('; ');

  const loadKeyTypes = async () => {
    const res = await getPartitionPlanKeyDataTypes(sessionId, databaseId, firstTableName);
    const values = configs.map((item) => {
      return {
        ...item,
        option: {
          partitionKeyConfigs: res?.contents?.map((type, index) => {
            const isDateType = !!type?.localizedMessage;
            return {
              partitionKeyInvoker: isDateType
                ? PARTITION_KEY_INVOKER.TIME_INCREASING_GENERATOR
                : PARTITION_KEY_INVOKER.CUSTOM_GENERATOR,
              ...item.option.partitionKeyConfigs?.[index],
              type,
            };
          }),
        },
      };
    });
    props.onChange(values);
  };

  const handlePlansConfigChange = (value: ITableConfig) => {
    const values = configs?.map((item) => {
      return {
        ...item,
        ...value,
      };
    });
    props.onChange(values);
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((data) => {
        handlePlansConfigChange(data);
        handleClose();
      })
      .catch((error) => {
        console.error(JSON.stringify(error));
      });
  };

  const handlePreview = () => {
    form
      .validateFields()
      .then(async (data) => {
        const {
          strategies,
          generateCount,
          nameRuleType,
          namingPrefix,
          namingSuffixExpression,
          fromCurrentTime,
          baseTimestampMillis,
          generateExpr,
          option,
          keepLatestCount,
          interval,
          intervalPrecision,
          intervalGenerateExpr,
          reloadIndexes,
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
            } = item;
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
          template: {
            partitionKeyConfigs: partitionKeyConfigs?.filter((item) =>
              strategies?.includes(item.strategy),
            ),
            partitionNameInvoker: null,
            partitionNameInvokerParameters: null,
          },
        };

        if (nameRuleType === 'PRE_SUFFIX') {
          const currentTimeParameter = {
            fromCurrentTime: fromCurrentTime === START_DATE.CURRENT_DATE,
            baseTimestampMillis: baseTimestampMillis?.valueOf(),
          };
          if (fromCurrentTime !== START_DATE.CUSTOM_DATE) {
            delete currentTimeParameter.baseTimestampMillis;
          }
          formData.template.partitionNameInvoker =
            PARTITION_NAME_INVOKER.DATE_BASED_PARTITION_NAME_GENERATOR;
          formData.template.partitionNameInvokerParameters = {
            partitionNameGeneratorConfig: {
              namingPrefix,
              namingSuffixExpression,
              interval,
              intervalPrecision,
              ...currentTimeParameter,
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
          setPreviewSQLVisible(true);
          setPreviewData(res?.contents);
        }
      })
      .catch((error) => {
        console.error(JSON.stringify(error));
      });
  };

  const handleTest = async () => {
    form
      .validateFields([
        'nameRuleType',
        'namingPrefix',
        'namingSuffixExpression',
        'generateExpr',
        'interval',
        'intervalPrecision',
        'intervalGenerateExpr',
        'fromCurrentTime',
        'baseTimestampMillis',
        'namingSuffixExpression',
      ])
      .then(async (data) => {
        const {
          nameRuleType,
          namingPrefix,
          namingSuffixExpression,
          fromCurrentTime,
          baseTimestampMillis,
          generateExpr,
          interval,
          intervalPrecision,
          intervalGenerateExpr,
        } = data;
        const formData = {
          tableNames,
          onlyForPartitionName: true,
          template: {
            partitionNameInvoker: null,
            partitionNameInvokerParameters: null,
          },
        };

        if (nameRuleType === 'PRE_SUFFIX') {
          const currentTimeParameter = {
            fromCurrentTime: fromCurrentTime === START_DATE.CURRENT_DATE,
            baseTimestampMillis: baseTimestampMillis?.valueOf(),
          };
          if (fromCurrentTime !== START_DATE.CUSTOM_DATE) {
            delete currentTimeParameter.baseTimestampMillis;
          }
          formData.template.partitionNameInvoker =
            PARTITION_NAME_INVOKER.DATE_BASED_PARTITION_NAME_GENERATOR;
          formData.template.partitionNameInvokerParameters = {
            partitionNameGeneratorConfig: {
              namingPrefix,
              namingSuffixExpression,
              interval,
              intervalPrecision,
              ...currentTimeParameter,
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
        const res = await previewPartitionPlans(sessionId, formData);
        if (res?.contents?.length) {
          const rule = res?.contents?.map((item) => item?.partitionName)?.join(', ');
          setRuleExample(rule);
        }
      })
      .catch((error) => {
        console.error(JSON.stringify(error));
      });
  };

  const handleClosePreviewSQL = () => {
    setPreviewSQLVisible(false);
  };

  const handleChange = () => {
    setRuleExample('');
  };

  useEffect(() => {
    if (visible && databaseId && sessionId && firstTableName) {
      loadKeyTypes();
    }
  }, [databaseId, sessionId, firstTableName, visible]);

  useEffect(() => {
    if (visible) {
      const value = configs?.[0] ?? defaultInitialValues;
      form.setFieldsValue({
        ...value,
      });
    }
  }, [configs, visible]);

  return (
    <Drawer
      title={
        isBatch
          ? formatMessage({ id: 'src.component.Task.component.PartitionPolicyFormTable.C3B6B344' })
          : formatMessage({ id: 'src.component.Task.component.PartitionPolicyFormTable.F441A07F' })
      }
      open={visible}
      destroyOnClose
      width={720}
      className={styles.configDrawer}
      onClose={handleClose}
      footer={
        <Space style={{ float: 'right' }}>
          <Button onClick={handleClose}>
            {
              formatMessage({
                id: 'odc.components.PartitionPolicyTable.configModal.Cancel',
              }) /*取消*/
            }
          </Button>
          <Button onClick={handlePreview}>
            {
              formatMessage({
                id: 'src.component.Task.component.PartitionPolicyFormTable.E0664950' /*预览 SQL*/,
              }) /* 预览 SQL */
            }
          </Button>
          {isBatch ? (
            <Popconfirm
              overlayStyle={{ width: '216px' }}
              title={formatMessage({
                id: 'odc.components.PartitionPolicyTable.configModal.BatchSettingWillOverwriteThe',
              })} /*批量设置将覆盖原有的策略，是否确定设置？*/
              onConfirm={handleOk}
              okText={formatMessage({
                id: 'odc.components.PartitionPolicyTable.configModal.Ok',
              })} /*确定*/
              cancelText={formatMessage({
                id: 'odc.components.PartitionPolicyTable.configModal.Return',
              })} /*返回*/
            >
              <Button type="primary">
                {
                  formatMessage({
                    id: 'odc.components.PartitionPolicyTable.configModal.Ok',
                  }) /*确定*/
                }
              </Button>
            </Popconfirm>
          ) : (
            <Button type="primary" onClick={handleOk}>
              {
                formatMessage({
                  id: 'odc.components.PartitionPolicyTable.configModal.Ok',
                }) /*确定*/
              }
            </Button>
          )}
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
        initialValues={defaultInitialValues}
        onChange={handleChange}
      >
        <Descriptions column={1}>
          <Descriptions.Item
            label={
              formatMessage({
                id: 'src.component.Task.component.PartitionPolicyFormTable.AE09B3CB',
              }) /*"分区表"*/
            }
          >{`${tableLabels}${moreText}`}</Descriptions.Item>
          <Descriptions.Item
            label={
              formatMessage({
                id: 'src.component.Task.component.PartitionPolicyFormTable.D50C1358',
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
            }) /*"分区策略"*/
          }
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'src.component.Task.component.PartitionPolicyFormTable.CD65E4CD',
              }), //'请选择'
            },
          ]}
        >
          <Checkbox.Group options={StrategyOptions} />
        </Form.Item>
        {isCreateConfigVisible && (
          <Alert
            message={
              formatMessage({
                id: 'src.component.Task.component.PartitionPolicyFormTable.8DC77765',
              }) /*"当前表如果属于表组（tablegroup），创建分区可能会失败或破坏负载均衡，请谨慎配置创建策略"*/
            }
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
              }) /*"创建分区"*/
            }
          >
            <Form.Item
              required
              name="generateCount"
              label={
                formatMessage({
                  id: 'src.component.Task.component.PartitionPolicyFormTable.C0FD367F',
                }) /*"预创建分区数量"*/
              }
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'src.component.Task.component.PartitionPolicyFormTable.16355175',
                  }), //'请输入预创建分区数量'
                },
              ]}
            >
              <InputNumber
                placeholder={
                  formatMessage({
                    id: 'src.component.Task.component.PartitionPolicyFormTable.F4F136CA',
                  }) /*"请输入"*/
                }
                min={0}
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
                      }) /* 创建规则 */
                    }
                  </span>
                  <Action.Link>
                    {
                      formatMessage({
                        id: 'src.component.Task.component.PartitionPolicyFormTable.DF75EB9E' /*如何配置*/,
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
                }) /*"命名方式"*/
              }
              name="nameRuleType"
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'src.component.Task.component.PartitionPolicyFormTable.87D4D0BB',
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
                }) /*"命名规则"*/
              }
              required
              style={{ marginBottom: '0' }}
            >
              <Space size={8} align="start" style={{ width: '100%' }}>
                {isCustomRuleType ? (
                  <Space>
                    <Form.Item
                      name="generateExpr"
                      rules={[
                        {
                          required: true,
                          message: formatMessage({
                            id: 'src.component.Task.component.PartitionPolicyFormTable.E5DA1FA4',
                          }), //'请输入表达式'
                        },
                      ]}
                      style={{ width: 320 }}
                    >
                      <Input
                        placeholder={
                          formatMessage({
                            id: 'src.component.Task.component.PartitionPolicyFormTable.23B74BBB',
                          }) /*"请输入表达式"*/
                        }
                        addonBefore={
                          formatMessage({
                            id: 'src.component.Task.component.PartitionPolicyFormTable.D97787FE',
                          }) /*"表达式"*/
                        }
                      />
                    </Form.Item>
                  </Space>
                ) : (
                  <Space size={8} align="start">
                    <Form.Item
                      validateFirst
                      name="namingPrefix"
                      rules={[
                        {
                          required: true,
                          message: formatMessage({
                            id: 'src.component.Task.component.PartitionPolicyFormTable.4293BED4',
                          }), //'请输入前缀'
                        },
                        {
                          pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
                          message: formatMessage({
                            id: 'src.component.Task.component.PartitionPolicyFormTable.F70A7891',
                          }), //'仅支持英文/数字/下划线，且以英文开头'
                        },
                        {
                          max: 32,
                          message: formatMessage({
                            id: 'src.component.Task.component.PartitionPolicyFormTable.D76C944C',
                          }), //'不超过32个字符'
                        },
                      ]}
                      style={{ width: 140 }}
                    >
                      <Input
                        addonBefore={
                          formatMessage({
                            id: 'src.component.Task.component.PartitionPolicyFormTable.7D91EBA7',
                          }) /*"前缀"*/
                        }
                        placeholder={
                          formatMessage({
                            id: 'src.component.Task.component.PartitionPolicyFormTable.D2573F4C',
                          }) /*"请输入前缀"*/
                        }
                      />
                    </Form.Item>
                    <Input.Group compact>
                      <Tag className={styles.suffix}>
                        {
                          formatMessage({
                            id: 'src.component.Task.component.PartitionPolicyFormTable.0F79EE9C' /*后缀*/,
                          }) /* 后缀 */
                        }
                      </Tag>
                      <Form.Item
                        name="fromCurrentTime"
                        rules={[
                          {
                            required: true,
                            message: formatMessage({
                              id: 'src.component.Task.component.PartitionPolicyFormTable.CC74D506',
                            }), //'请选择'
                          },
                        ]}
                      >
                        <Select
                          placeholder={
                            formatMessage({
                              id: 'src.component.Task.component.PartitionPolicyFormTable.B7A571C8',
                            }) /*"请选择"*/
                          }
                          optionLabelProp="label"
                          options={startDateOptions}
                          dropdownMatchSelectWidth={154}
                          style={{ width: 135 }}
                        />
                      </Form.Item>
                      {fromCurrentTime === START_DATE.CUSTOM_DATE && (
                        <Form.Item
                          name="baseTimestampMillis"
                          rules={[
                            {
                              required: true,
                              message: formatMessage({
                                id: 'src.component.Task.component.PartitionPolicyFormTable.E89659CE',
                              }), //'请选择'
                            },
                          ]}
                        >
                          <DatePicker
                            showTime
                            placeholder={
                              formatMessage({
                                id: 'src.component.Task.component.PartitionPolicyFormTable.05D91017',
                              }) /*"请选择"*/
                            }
                          />
                        </Form.Item>
                      )}

                      <Form.Item
                        name="namingSuffixExpression"
                        rules={[
                          {
                            required: true,
                            message: formatMessage({
                              id: 'src.component.Task.component.PartitionPolicyFormTable.7183DAA0',
                            }), //'请选择后缀'
                          },
                        ]}
                      >
                        <Select
                          placeholder={
                            formatMessage({
                              id: 'src.component.Task.component.PartitionPolicyFormTable.0259BAC2',
                            }) /*"请选择"*/
                          }
                          style={{ width: 124 }}
                          options={suffixOptions}
                        />
                      </Form.Item>
                    </Input.Group>
                  </Space>
                )}
              </Space>
            </Form.Item>
            <Space direction="vertical" size={2}>
              <Action.Link onClick={handleTest}>
                {
                  formatMessage({
                    id: 'src.component.Task.component.PartitionPolicyFormTable.8067C91E' /*测试生成*/,
                  }) /* 测试生成 */
                }
              </Action.Link>
              {!!ruleExample && (
                <Text type="secondary">
                  {formatMessage({
                    id: 'src.component.Task.component.PartitionPolicyFormTable.797EC6B1' /*示例名称:*/,
                  })}
                  {ruleExample}
                </Text>
              )}
            </Space>
            {isCustomRuleType ? (
              <Form.Item
                name="intervalGenerateExpr"
                label={
                  formatMessage({
                    id: 'src.component.Task.component.PartitionPolicyFormTable.7BC3752C',
                  }) /*"命名间隔"*/
                }
                rules={[
                  {
                    required: true,
                    message: formatMessage({
                      id: 'src.component.Task.component.PartitionPolicyFormTable.FB42838A',
                    }), //'请输入'
                  },
                ]}
              >
                <Input
                  style={{ width: 180 }}
                  placeholder={
                    formatMessage({
                      id: 'src.component.Task.component.PartitionPolicyFormTable.07788524',
                    }) /*"请输入"*/
                  }
                />
              </Form.Item>
            ) : (
              <Form.Item
                name="interval"
                label={
                  formatMessage({
                    id: 'src.component.Task.component.PartitionPolicyFormTable.85FFB10E',
                  }) /*"命名间隔"*/
                }
                rules={[
                  {
                    required: true,
                    message: formatMessage({
                      id: 'src.component.Task.component.PartitionPolicyFormTable.BC96D1C3',
                    }), //'请输入'
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  addonAfter={
                    <Form.Item
                      name="intervalPrecision"
                      rules={[
                        {
                          required: true,
                          message: formatMessage({
                            id: 'src.component.Task.component.PartitionPolicyFormTable.A464079B',
                          }), //'请选择'
                        },
                      ]}
                      noStyle
                    >
                      <Select
                        placeholder={
                          formatMessage({
                            id: 'src.component.Task.component.PartitionPolicyFormTable.572D785C',
                          }) /*"请选择"*/
                        }
                        options={intervalPrecisionOptions}
                        style={{ width: 60 }}
                      />
                    </Form.Item>
                  }
                  style={{ width: 180 }}
                />
              </Form.Item>
            )}
          </FormItemPanel>
        )}

        {isDropConfigVisible && (
          <Alert
            message={
              formatMessage({
                id: 'src.component.Task.component.PartitionPolicyFormTable.A9C95E9D',
              }) /*"当前表如果包含全局索引，删除分区会导致全局索引失效，请谨慎操作，如果选择重建全局索引可能耗时很久，请谨慎操作"*/
            }
            type="warning"
            style={{ marginBottom: '8px' }}
            showIcon
          />
        )}

        {isDropConfigVisible && (
          <FormItemPanel
            keepExpand
            label={
              formatMessage({
                id: 'src.component.Task.component.PartitionPolicyFormTable.40F7E641',
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
                      }) /* 分区保留数量 */
                    }
                  </HelpDoc>
                }
                rules={[
                  {
                    required: true,
                    message: formatMessage({
                      id: 'src.component.Task.component.PartitionPolicyFormTable.967356C8',
                    }), //'请输入'
                  },
                ]}
              >
                <InputNumber
                  placeholder={
                    formatMessage({
                      id: 'src.component.Task.component.PartitionPolicyFormTable.94B98AF7',
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
                  }) /*"删除后是否重建索引"*/
                }
                rules={[
                  {
                    required: true,
                    message: formatMessage({
                      id: 'src.component.Task.component.PartitionPolicyFormTable.393D1F82',
                    }), //'请选择'
                  },
                ]}
              >
                <Radio.Group>
                  <Radio value={true}>
                    {
                      formatMessage({
                        id: 'src.component.Task.component.PartitionPolicyFormTable.77C8BE4D' /*是*/,
                      }) /* 是 */
                    }
                  </Radio>
                  <Radio value={false}>
                    {
                      formatMessage({
                        id: 'src.component.Task.component.PartitionPolicyFormTable.E374E7C8' /*否*/,
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
        visible={previewSQLVisible}
        previewData={previewData}
        onClose={handleClosePreviewSQL}
      />
    </Drawer>
  );
};

export default ConfigDrawer;
