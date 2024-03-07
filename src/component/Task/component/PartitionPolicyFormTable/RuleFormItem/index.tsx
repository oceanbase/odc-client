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
}

const RuleFormItem: React.FC<TableFormProps> = (props) => {
  const { field } = props;

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
          'columns',
          field.name,
          'generateExpr',
        ]);
        const intervalGenerateExprError = getFieldError([
          'option',
          'partitionKeyConfigs',
          'columns',
          field.name,
          'intervalGenerateExpr',
        ]);
        const intervalError = getFieldError([
          'option',
          'partitionKeyConfigs',
          'columns',
          field.name,
          'interval',
        ]);
        const isCustom = partitionKeyInvoker === PARTITION_KEY_INVOKER.CUSTOM_GENERATOR;

        return (
          <Space
            style={{ width: '364px', verticalAlign: 'middle' }}
            size={4}
            direction="vertical"
            align="start"
          >
            {isCustom ? (
              <>
                <Form.Item
                  {...field}
                  name={[field.name, 'generateExpr']}
                  className={styles.noMarginBottom}
                  style={{ width: '364px' }}
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
                        id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.D749A5F7',
                      }) /*"请输入 SQL 表达式生成分区下界"*/
                    }
                    {...getFieldProps(generateExprError)}
                  />
                </Form.Item>
                <Input.Group compact>
                  <Tag className={styles.suffix}>
                    {
                      formatMessage({
                        id: 'src.component.Task.component.PartitionPolicyFormTable.RuleFormItem.9F9223B3' /*间隔*/,
                      }) /* 间隔 */
                    }
                  </Tag>
                  <Form.Item
                    {...field}
                    name={[field.name, 'intervalGenerateExpr']}
                    className={styles.noMarginBottom}
                    style={{ width: '316px' }}
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
                        <Select options={intervalPrecisionOptions} style={{ width: 60 }} />
                      </Form.Item>
                    }
                    style={{ width: 260 }}
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
