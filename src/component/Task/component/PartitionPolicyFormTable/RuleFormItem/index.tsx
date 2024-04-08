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

import { formatMessage } from '@/util/intl';
import React from 'react';
import {
  Form,
  Input,
  Select,
  Space,
  Tag,
  InputNumber,
  Tooltip,
  DatePicker,
  Typography,
} from 'antd';
import { CloseCircleFilled } from '@ant-design/icons';
import HelpDoc from '@/component/helpDoc';
import { intervalPrecisionOptions } from '../configModal';
import { START_DATE } from '../const';
import { PARTITION_KEY_INVOKER } from '@/d.ts';
import styles from '../index.less';

const { Text } = Typography;

const startDateOptionValues = [
  {
    label: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.88D572DE',
    }), //'当前时间'
    value: START_DATE.CURRENT_DATE,
    description: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.684CAF92',
    }), //'从实际执行的时间开始创建'
  },
  {
    label: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.9CDC5E14',
    }), //'指定时间'
    value: START_DATE.CUSTOM_DATE,
    description: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.0E0ADD3E',
    }), //'从指定的某个时间开始创建'
  },
];

const startDateOptions = startDateOptionValues.map(({ label, value, description }) => {
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

const EmptyHelp = () => null;

const getFieldProps: (
  error: string[],
  position?: 'prefix' | 'suffix',
) => Partial<{
  status: 'error';
  prefix: React.ReactNode;
  suffix: React.ReactNode;
}> = (error, position = 'suffix') => {
  return error?.length
    ? {
        status: 'error',
        [position]: (
          <Tooltip title={error?.join('')}>
            <CloseCircleFilled style={{ color: 'var(--function-red6-color)' }} />
          </Tooltip>
        ),
      }
    : {};
};

interface TableFormProps {
  field: any;
  precision: number;
}

const RuleFormItem: React.FC<TableFormProps> = (props) => {
  const { field, precision } = props;

  return (
    <Form.Item shouldUpdate={true} className={styles.noMarginBottom}>
      {({ getFieldValue, getFieldError }) => {
        const partitionKeyInvoker = getFieldValue([
          'option',
          'partitionKeyConfigs',
          field.name,
          'partitionKeyInvoker',
        ]);
        const fromCurrentTime = getFieldValue([
          'option',
          'partitionKeyConfigs',
          field.name,
          'fromCurrentTime',
        ]);
        const generateExprError = getFieldError([
          'option',
          'partitionKeyConfigs',
          field.name,
          'generateExpr',
        ]);
        const intervalGenerateExprError = getFieldError([
          'option',
          'partitionKeyConfigs',
          field.name,
          'intervalGenerateExpr',
        ]);
        const intervalError = getFieldError([
          'option',
          'partitionKeyConfigs',
          field.name,
          'interval',
        ]);
        const isCustom = partitionKeyInvoker === PARTITION_KEY_INVOKER.CUSTOM_GENERATOR;
        const validIntervalPrecisionOptions = intervalPrecisionOptions?.filter(
          (item) => item.value <= precision,
        );

        return (
          <Space
            style={{ width: '374px', verticalAlign: 'middle' }}
            size={2}
            direction="vertical"
            align="start"
          >
            {isCustom ? (
              <>
                <Form.Item
                  {...field}
                  name={[field.name, 'generateExpr']}
                  className={styles.noMarginBottom}
                  style={{ width: '374px' }}
                  rules={[
                    {
                      required: true,
                      message: formatMessage({
                        id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.DE258551',
                      }), //'请输入'
                    },
                  ]}
                  help={EmptyHelp}
                >
                  <Input
                    placeholder={
                      formatMessage({
                        id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.13EB1436',
                      }) /*"请输入 SQL 表达式生成分区上界，可引用变量如 ${INTERVAL}"*/
                    }
                    {...getFieldProps(generateExprError)}
                  />
                </Form.Item>
                <Input.Group compact>
                  <Tag className={styles.suffix}>
                    <HelpDoc
                      leftText
                      isTip
                      title={
                        formatMessage({
                          id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.B0EB9B0D',
                        }) /*"INTERVAL 初始值及增长步长"*/
                      }
                    >
                      {
                        formatMessage({
                          id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.9F9223B3' /*间隔*/,
                        }) /* 间隔 */
                      }
                    </HelpDoc>
                  </Tag>
                  <Form.Item
                    {...field}
                    name={[field.name, 'intervalGenerateExpr']}
                    className={styles.noMarginBottom}
                    style={{ width: '306px' }}
                    rules={[
                      {
                        required: true,
                        message: formatMessage({
                          id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.8368A05F',
                        }), //'请输入'
                      },
                    ]}
                    help={EmptyHelp}
                  >
                    <Input
                      placeholder={
                        formatMessage({
                          id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.609871AF',
                        }) /*"请输入"*/
                      }
                      {...getFieldProps(intervalGenerateExprError)}
                    />
                  </Form.Item>
                </Input.Group>
              </>
            ) : (
              <>
                <Input.Group compact>
                  <Tag className={styles.suffix}>
                    {
                      formatMessage({
                        id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.C6AB94A8' /*起始*/,
                      }) /* 起始 */
                    }
                  </Tag>
                  <Form.Item
                    {...field}
                    name={[field.name, 'fromCurrentTime']}
                    className={styles.noMarginBottom}
                  >
                    <Select
                      optionLabelProp="label"
                      options={startDateOptions}
                      dropdownMatchSelectWidth={224}
                      style={{ width: 135 }}
                    />
                  </Form.Item>
                  {fromCurrentTime === START_DATE.CUSTOM_DATE && (
                    <Form.Item
                      {...field}
                      name={[field.name, 'baseTimestampMillis']}
                      className={styles.noMarginBottom}
                    >
                      <DatePicker showTime {...getFieldProps(intervalGenerateExprError)} />
                    </Form.Item>
                  )}
                </Input.Group>
                <Form.Item
                  required
                  {...field}
                  name={[field.name, 'interval']}
                  className={styles.noMarginBottom}
                  rules={[
                    {
                      required: true,
                      message: formatMessage({
                        id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.2F986FD8',
                      }), //'请输入'
                    },
                  ]}
                  help={EmptyHelp}
                >
                  <InputNumber
                    min={0}
                    addonBefore={
                      formatMessage({
                        id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.5FE030CF',
                      }) /*"间隔"*/
                    }
                    addonAfter={
                      <Form.Item
                        {...field}
                        name={[field.name, 'intervalPrecision']}
                        rules={[
                          {
                            required: true,
                            message: formatMessage({
                              id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.7FB4A416',
                            }), //'请选择'
                          },
                        ]}
                        noStyle
                      >
                        <Select options={validIntervalPrecisionOptions} style={{ width: 60 }} />
                      </Form.Item>
                    }
                    style={{ width: 243 }}
                    {...getFieldProps(intervalError, 'prefix')}
                  />
                </Form.Item>
              </>
            )}
          </Space>
        );
      }}
    </Form.Item>
  );
};

export default RuleFormItem;
