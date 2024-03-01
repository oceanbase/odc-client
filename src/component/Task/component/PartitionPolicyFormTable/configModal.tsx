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
import { startDateOptions } from './RuleFormItem';
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

export enum NameRuleType {
  PRE_SUFFIX = 'PRE_SUFFIX',
  CUSTOM = 'CUSTOM',
}

export const intervalPrecisionOptions = [
  {
    label: '秒',
    value: 63,
  },
  {
    label: '分',
    value: 31,
  },
  {
    label: '时',
    value: 15,
  },
  {
    label: '日',
    value: 7,
  },
  {
    label: '月',
    value: 3,
  },
  {
    label: '年',
    value: 1,
  },
];

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
    label: '前缀 + 后缀',
    value: NameRuleType.PRE_SUFFIX,
  },
  {
    label: '自定义',
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
              ...item.option.partitionKeyConfigs[index],
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
            generateExpr,
            intervalGenerateExpr,
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
      title={isBatch ? '批量设置分区策略' : '设置分区策略'}
      open={visible}
      destroyOnClose
      width={720}
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
          <Button onClick={handlePreview}>预览 SQL</Button>
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
          <Descriptions.Item label="分区表">{`${tableLabels}${moreText}`}</Descriptions.Item>
          <Descriptions.Item label="分区类型">{`${tableLabels}${moreText}`}</Descriptions.Item>
        </Descriptions>
        <Form.Item
          name="strategies"
          label="分区策略"
          rules={[
            {
              required: true,
              message: '请选择',
            },
          ]}
        >
          <Checkbox.Group options={StrategyOptions} />
        </Form.Item>
        {isCreateConfigVisible && (
          <Alert
            message="当前表如果属于表组（tablegroup），创建分区可能会失败或破坏负载均衡，请谨慎配置创建策略"
            type="warning"
            style={{ marginBottom: '8px' }}
            showIcon
          />
        )}
        {isCreateConfigVisible && (
          <FormItemPanel keepExpand label="创建分区">
            <Form.Item
              required
              name="generateCount"
              label="预创建分区数量"
              rules={[
                {
                  required: true,
                  message: '请输入预创建分区数量',
                },
              ]}
            >
              <InputNumber placeholder="请输入" min={0} style={{ width: 100 }} />
            </Form.Item>
            <Form.Item
              required
              label={
                <Space>
                  <span>创建规则</span>
                  <Action.Link>如何配置</Action.Link>
                </Space>
              }
            >
              <EditTable form={form} />
            </Form.Item>
            <Form.Item
              label="命名方式"
              name="nameRuleType"
              rules={[
                {
                  required: true,
                  message: '请选择',
                },
              ]}
            >
              <Select options={nameRuleOptions} style={{ width: 120 }} />
            </Form.Item>
            <Form.Item label="命名规则" required style={{ marginBottom: '0' }}>
              <Space size={8} align="start" style={{ width: '100%' }}>
                {isCustomRuleType ? (
                  <Space>
                    <Form.Item
                      name="generateExpr"
                      rules={[
                        {
                          required: true,
                          message: '请输入表达式',
                        },
                      ]}
                      style={{ width: 320 }}
                    >
                      <Input placeholder="请输入表达式" addonBefore="表达式" />
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
                          message: '请输入前缀',
                        },
                        {
                          pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
                          message: '仅支持英文/数字/下划线，且以英文开头',
                        },
                        {
                          max: 32,
                          message: '不超过32个字符',
                        },
                      ]}
                      style={{ width: 140 }}
                    >
                      <Input addonBefore="前缀" placeholder="请输入前缀" />
                    </Form.Item>
                    <Input.Group compact>
                      <Tag className={styles.suffix}>后缀</Tag>
                      <Form.Item
                        name="fromCurrentTime"
                        rules={[
                          {
                            required: true,
                            message: '请选择',
                          },
                        ]}
                      >
                        <Select
                          placeholder="请选择"
                          optionLabelProp="label"
                          options={startDateOptions}
                          style={{ width: 135 }}
                        />
                      </Form.Item>
                      {fromCurrentTime === START_DATE.CUSTOM_DATE && (
                        <Form.Item
                          name="baseTimestampMillis"
                          rules={[
                            {
                              required: true,
                              message: '请选择',
                            },
                          ]}
                        >
                          <DatePicker showTime placeholder="请选择" />
                        </Form.Item>
                      )}
                      <Form.Item
                        name="namingSuffixExpression"
                        rules={[
                          {
                            required: true,
                            message: '请选择后缀',
                          },
                        ]}
                      >
                        <Select
                          placeholder="请选择"
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
              <Action.Link onClick={handleTest}>测试生成</Action.Link>
              {!!ruleExample && <Text type="secondary">示例名称: {ruleExample}</Text>}
            </Space>
            {isCustomRuleType ? (
              <Form.Item
                name="intervalGenerateExpr"
                label="命名间隔"
                rules={[
                  {
                    required: true,
                    message: '请输入',
                  },
                ]}
              >
                <Input style={{ width: 180 }} placeholder="请输入" />
              </Form.Item>
            ) : (
              <Form.Item
                name="interval"
                label="命名间隔"
                rules={[
                  {
                    required: true,
                    message: '请输入',
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
                          message: '请选择',
                        },
                      ]}
                      noStyle
                    >
                      <Select
                        placeholder="请选择"
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
            message="当前表如果包含全局索引，删除分区会导致全局索引失效，请谨慎操作，如果选择重建全局索引可能耗时很久，请谨慎操作"
            type="warning"
            style={{ marginBottom: '8px' }}
            showIcon
          />
        )}
        {isDropConfigVisible && (
          <FormItemPanel keepExpand label="删除分区">
            <Space size={40} align="start">
              <Form.Item
                required
                name="keepLatestCount"
                label={
                  <HelpDoc doc="partitionInterval" leftText>
                    分区保留数量
                  </HelpDoc>
                }
                rules={[
                  {
                    required: true,
                    message: '请输入',
                  },
                ]}
              >
                <InputNumber placeholder="请输入" min={0} style={{ width: 100 }} />
              </Form.Item>
              <Form.Item
                required
                name="reloadIndexes"
                label="删除后是否重建索引"
                rules={[
                  {
                    required: true,
                    message: '请选择',
                  },
                ]}
              >
                <Radio.Group>
                  <Radio value={true}>是</Radio>
                  <Radio value={false}>否</Radio>
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
