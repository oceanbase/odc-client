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

import HelpDoc from '@/component/helpDoc';
import { PARTITION_KEY_INVOKER } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { CloseCircleFilled, InfoCircleOutlined } from '@ant-design/icons';
import {
  AutoComplete,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import React, { useState } from 'react';
import { intervalPrecisionOptions } from '../configModal';
import { START_DATE, INCREAMENT_FIELD_TYPE, increamentFieldTypeLabelMap } from '../const';
import styles from '../index.less';

const { Text } = Typography;

const startDateOptionValues = [
  {
    label: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.88D572DE',
      defaultMessage: '当前时间',
    }), //'当前时间'
    value: START_DATE.CURRENT_DATE,
    description: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.684CAF92',
      defaultMessage: '从实际执行的时间开始创建',
    }), //'从实际执行的时间开始创建'
  },
  {
    label: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.9CDC5E14',
      defaultMessage: '指定时间',
    }), //'指定时间'
    value: START_DATE.CUSTOM_DATE,
    description: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.0E0ADD3E',
      defaultMessage: '从指定的某个时间开始创建',
    }), //'从指定的某个时间开始创建'
  },
];

const incrementFieldTypeOptionsValues = [
  {
    label: increamentFieldTypeLabelMap[INCREAMENT_FIELD_TYPE.NUMBER],
    value: INCREAMENT_FIELD_TYPE.NUMBER,
    description: '仅代表数值数据，如：001、002',
  },
  {
    label: increamentFieldTypeLabelMap[INCREAMENT_FIELD_TYPE.TIME_STRING],
    value: INCREAMENT_FIELD_TYPE.TIME_STRING,
    description: '类型为数值但实际含义为日期时间，如: 20250207',
  },
  {
    label: increamentFieldTypeLabelMap[INCREAMENT_FIELD_TYPE.TIMESTAMP],
    value: INCREAMENT_FIELD_TYPE.TIMESTAMP,
    description: '类型为数值但实际含义为时间戳，如: 1609459200',
  },
];

const incrementByDateOptionsInNumber = ['yyyy', 'yyyyMM', 'yyyyMMdd'].map((item) => ({
  label: item,
  value: item,
}));

const incrementByDateOptionsInChar = [
  'yyyy',
  'yyyy年',
  'yyyyMM',
  'yyyy-MM',
  'yyyy年MM月',
  'yyyyMMdd',
  'yyyy-MM-dd',
  'yyyy年MM月dd日',
].map((item) => ({
  label: item,
  value: item,
}));

const getOptionsByValueList = (valueList) => {
  return valueList.map(({ label, value, description }) => {
    return {
      label: (
        <div>
          <div>{label}</div>
          <Text type="secondary">{description}</Text>
        </div>
      ),

      value,
      text: label,
    };
  });
};
const startDateOptions = getOptionsByValueList(startDateOptionValues);
const fieldTypeOptions = getOptionsByValueList(incrementFieldTypeOptionsValues);

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
  isDate: boolean;
  dataTypeName: string;
}

const getIntervalPrecisionOptionsByIncrementDateType = (incrementFieldTypeInDate: string) => {
  const containYear = incrementFieldTypeInDate?.toLocaleLowerCase?.()?.includes?.('y');
  const containMonth = incrementFieldTypeInDate?.toLocaleLowerCase?.()?.includes?.('m');
  const containDay = incrementFieldTypeInDate?.toLocaleLowerCase?.()?.includes?.('d');
  // 只能为年
  if (containYear && !containMonth && !containDay) {
    return intervalPrecisionOptions?.filter((item) => item.value <= 1);
  }
  // 只能为年, 月
  if (containYear && containMonth && !containDay) {
    return intervalPrecisionOptions?.filter((item) => item.value <= 3);
  }
  if (containYear && containMonth && containDay) {
    return intervalPrecisionOptions?.filter((item) => item.value <= 7);
  }
  return intervalPrecisionOptions;
};

const getDefaultPrecisionByIncrementDateType = (incrementFieldTypeInDate: string) => {
  const containYear = incrementFieldTypeInDate?.toLocaleLowerCase?.()?.includes?.('y');
  const containMonth = incrementFieldTypeInDate?.toLocaleLowerCase?.()?.includes?.('m');
  const containDay = incrementFieldTypeInDate?.toLocaleLowerCase?.()?.includes?.('d');
  // 只能为年
  if (containYear && !containMonth && !containDay) {
    return 1;
  }

  return 3;
};

const RuleFormItem: React.FC<TableFormProps> = (props) => {
  const { field, precision, isDate, dataTypeName } = props;
  const [intervalErrorInBlur, setIntervalErrorInBlur] = useState<string[]>();
  return (
    <Form.Item shouldUpdate={true} className={styles.noMarginBottom}>
      {({ getFieldValue, getFieldError, setFieldValue }) => {
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
        const incrementFieldType = getFieldValue([
          'option',
          'partitionKeyConfigs',
          field.name,
          'incrementFieldType',
        ]);
        const incrementFieldTypeInDate = getFieldValue([
          'option',
          'partitionKeyConfigs',
          field.name,
          'incrementFieldTypeInDate',
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

        const validateInput = (error) => {
          setIntervalErrorInBlur(error);
        };

        const isCustom = partitionKeyInvoker === PARTITION_KEY_INVOKER.CUSTOM_GENERATOR;
        const validIntervalPrecisionOptions = intervalPrecisionOptions?.filter(
          (item) => item.value <= precision,
        );

        const intervalFormItemRenderByIncrementFieldType = (type: INCREAMENT_FIELD_TYPE) => {
          switch (type) {
            case INCREAMENT_FIELD_TYPE.NUMBER: {
              return (
                <Input.Group compact style={{ width: '374px', display: 'inline-flex', height: 29 }}>
                  <Tag className={styles.suffix}>
                    <HelpDoc leftText isTip title={'将使用已有分区最大值作为分区起始值，以此递增'}>
                      {
                        formatMessage({
                          id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.9F9223B3' /*间隔*/,
                          defaultMessage: '间隔',
                        }) /* 间隔 */
                      }
                    </HelpDoc>
                  </Tag>
                  <Form.Item
                    {...field}
                    name={[field.name, 'intervalGenerateExpr']}
                    className={styles.noMarginBottom}
                    style={{ flexGrow: 2 }}
                    rules={[
                      {
                        required: true,
                        message: formatMessage({
                          id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.8368A05F',
                          defaultMessage: '请输入',
                        }), //'请输入'
                      },
                    ]}
                  >
                    <InputNumber
                      min={0}
                      style={{ width: 300 }}
                      {...getFieldProps(intervalErrorInBlur, 'prefix')}
                      onBlur={() => {
                        validateInput(intervalError);
                      }}
                    />
                  </Form.Item>
                </Input.Group>
              );
            }
            case INCREAMENT_FIELD_TYPE.TIME_STRING:
            case INCREAMENT_FIELD_TYPE.TIMESTAMP: {
              return (
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
                        defaultMessage: '请输入',
                      }), //'请输入'
                    },
                  ]}
                  help={EmptyHelp}
                >
                  <InputNumber
                    precision={0}
                    min={0}
                    addonBefore={
                      formatMessage({
                        id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.5FE030CF',
                        defaultMessage: '间隔',
                      }) /*"间隔"*/
                    }
                    addonAfter={
                      <Form.Item {...field} name={[field.name, 'intervalPrecision']} noStyle>
                        <Select
                          options={getIntervalPrecisionOptionsByIncrementDateType(
                            incrementFieldTypeInDate,
                          )}
                          style={{ width: 60 }}
                        />
                      </Form.Item>
                    }
                    style={{ width: 243 }}
                    {...getFieldProps(intervalErrorInBlur, 'prefix')}
                    onBlur={() => {
                      validateInput(intervalError);
                    }}
                  />
                </Form.Item>
              );
            }
            default:
              return '';
          }
        };

        const incrementFieldTypeForm = (
          <Input.Group compact>
            <Tag className={styles.suffix}>含义</Tag>
            <Form.Item
              name={[field.name, 'incrementFieldType']}
              rules={[{ required: true, message: '请选择' }]}
              style={{ margin: 0 }}
            >
              <Select
                options={fieldTypeOptions}
                style={{
                  width: incrementFieldType !== INCREAMENT_FIELD_TYPE.TIME_STRING ? 320 : 160,
                }}
                optionLabelProp="text"
                dropdownStyle={{ width: 320 }}
              />
            </Form.Item>
            {incrementFieldType === INCREAMENT_FIELD_TYPE.TIME_STRING && (
              <Form.Item
                {...field}
                name={[field.name, 'incrementFieldTypeInDate']}
                className={styles.noMarginBottom}
                rules={[{ required: true, message: '请输入格式' }]}
              >
                <AutoComplete
                  options={
                    dataTypeName?.toLowerCase()?.includes('number')
                      ? incrementByDateOptionsInNumber
                      : incrementByDateOptionsInChar
                  }
                  style={{ width: 160 }}
                  filterOption={(inputValue, option) =>
                    option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                  }
                  onChange={(e) => {
                    const defaultPrecision = getDefaultPrecisionByIncrementDateType(e);
                    setFieldValue(
                      ['option', 'partitionKeyConfigs', field.name, 'intervalPrecision'],
                      defaultPrecision,
                    );
                  }}
                >
                  <Input
                    suffix={
                      <Tooltip title="请输入格式，格式需与字段内容保持一致。">
                        <InfoCircleOutlined style={{ color: 'var(--icon-color-normal)' }} />
                      </Tooltip>
                    }
                  />
                </AutoComplete>
              </Form.Item>
            )}
          </Input.Group>
        );

        const FormRender = () => {
          // 创建方式: 自定义
          if (isCustom) {
            return (
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
                        defaultMessage: '请输入',
                      }), //'请输入'
                    },
                  ]}
                  help={EmptyHelp}
                >
                  <Input
                    placeholder={
                      formatMessage({
                        id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.13EB1436',
                        defaultMessage: '请输入 SQL 表达式生成分区上界，可引用变量如 ${INTERVAL}',
                      }) /*"请输入 SQL 表达式生成分区上界，可引用变量如 ${INTERVAL}"*/
                    }
                    {...getFieldProps(generateExprError)}
                  />
                </Form.Item>
                <Input.Group compact style={{ width: '374px', display: 'inline-flex', height: 29 }}>
                  <Tag className={styles.suffix}>
                    <HelpDoc
                      leftText
                      isTip
                      title={
                        formatMessage({
                          id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.B0EB9B0D',
                          defaultMessage: 'INTERVAL 初始值及增长步长',
                        }) /*"INTERVAL 初始值及增长步长"*/
                      }
                    >
                      {
                        formatMessage({
                          id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.9F9223B3' /*间隔*/,
                          defaultMessage: '间隔',
                        }) /* 间隔 */
                      }
                    </HelpDoc>
                  </Tag>
                  <Form.Item
                    {...field}
                    name={[field.name, 'intervalGenerateExpr']}
                    className={styles.noMarginBottom}
                    style={{ flexGrow: 2 }}
                    rules={[
                      {
                        required: true,
                        message: formatMessage({
                          id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.8368A05F',
                          defaultMessage: '请输入',
                        }), //'请输入'
                      },
                    ]}
                    help={EmptyHelp}
                  >
                    <Input
                      placeholder={
                        formatMessage({
                          id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.609871AF',
                          defaultMessage: '请输入',
                        }) /*"请输入"*/
                      }
                      {...getFieldProps(intervalErrorInBlur, 'prefix')}
                      onBlur={() => {
                        validateInput(intervalGenerateExprError);
                      }}
                    />
                  </Form.Item>
                </Input.Group>
              </>
            );
          }
          // 创建方式: 顺序递增, 且为时间类型
          if (isDate) {
            return (
              <>
                <Input.Group compact>
                  <Tag className={styles.suffix}>
                    {
                      formatMessage({
                        id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.C6AB94A8' /*起始*/,
                        defaultMessage: '起始',
                      }) /* 起始 */
                    }
                  </Tag>
                  <Form.Item
                    {...field}
                    name={[field.name, 'fromCurrentTime']}
                    className={styles.noMarginBottom}
                  >
                    <Select
                      optionLabelProp="text"
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
                        defaultMessage: '请输入',
                      }), //'请输入'
                    },
                  ]}
                  help={EmptyHelp}
                >
                  <InputNumber
                    precision={0}
                    min={0}
                    addonBefore={
                      formatMessage({
                        id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.5FE030CF',
                        defaultMessage: '间隔',
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
                              defaultMessage: '请选择',
                            }), //'请选择'
                          },
                        ]}
                        noStyle
                      >
                        <Select options={validIntervalPrecisionOptions} style={{ width: 60 }} />
                      </Form.Item>
                    }
                    style={{ width: 243 }}
                    {...getFieldProps(intervalErrorInBlur, 'prefix')}
                    onBlur={() => {
                      validateInput(intervalError);
                    }}
                  />
                </Form.Item>
              </>
            );
          }
          // 创建方式: 顺序递增, 其他非时间类型
          if (!incrementFieldType) {
            return incrementFieldTypeForm;
          }
          return (
            <>
              {incrementFieldTypeForm}
              {incrementFieldType !== INCREAMENT_FIELD_TYPE.NUMBER ? (
                <Input.Group compact>
                  <Tag className={styles.suffix}>
                    {
                      formatMessage({
                        id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.C6AB94A8' /*起始*/,
                        defaultMessage: '起始',
                      }) /* 起始 */
                    }
                  </Tag>
                  <Form.Item
                    {...field}
                    name={[field.name, 'fromCurrentTime']}
                    className={styles.noMarginBottom}
                  >
                    <Select
                      optionLabelProp="text"
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
              ) : null}
              {intervalFormItemRenderByIncrementFieldType(incrementFieldType)}
            </>
          );
        };

        return (
          <Space
            style={{ width: '374px', verticalAlign: 'middle' }}
            size={4}
            direction="vertical"
            align="start"
          >
            {FormRender()}
          </Space>
        );
      }}
    </Form.Item>
  );
};

export default RuleFormItem;
