import InputBigNumber from '@/component/InputBigNumber';
import { formatMessage } from '@/util/intl';
import { Form, Select, Space } from 'antd';
import { FormInstance } from 'antd/es/form/Form';
import React, { forwardRef, useImperativeHandle } from 'react';
import RangeInput from '../../RangeInput';
import { getTextItem } from '../../util';
import WrapItemWithTitle from '../../WrapItemWithTitle';
import { getRangeInputRules, getRequiredRules } from '../valid';

const { Option } = Select;

export enum NumberRuleType {
  NORMAL = 'NORMAL',
  ORDER = 'ORDER',
  RANDOM = 'RANDOM',
  NULL = 'NULL',
  SKIP = 'SKIP',
}

interface INumberItemProps {
  type: 'int' | 'float';
  readonly?: boolean;
  ruleType: NumberRuleType;
  value:
    | {
        // 定值
        genParams: {
          fixNum: string;
        };
      }
    | {
        // 顺序
        genParams: {
          step: string;
        };

        order: 'asc' | 'desc';
        lowValue: string;
      }
    | {
        // 随机
        range: [string, string];
      };

  ref: React.Ref<FormInstance>;
}

const NumberItem: React.FC<INumberItemProps> = forwardRef<FormInstance, INumberItemProps>(
  (props, ref) => {
    const { type, readonly, ruleType, value } = props;

    const [form] = Form.useForm();
    const isInt = type === 'int';

    useImperativeHandle(ref, () => {
      return form;
    });

    let items;
    if (readonly) {
      switch (ruleType) {
        case NumberRuleType.NORMAL: {
          items = getTextItem([
            [
              formatMessage({ id: 'odc.ruleItems.NumberItem.Value' }), // 值
              value?.['genParams']?.fixNum,
            ],
          ]);
          break;
        }
        case NumberRuleType.ORDER: {
          items = getTextItem([
            [
              formatMessage({ id: 'odc.ruleItems.NumberItem.StartValue' }), // 起始值
              value?.['lowValue'],
            ],
            [
              formatMessage({ id: 'odc.ruleItems.NumberItem.StepSize' }), // 步长
              value?.['genParams']?.step,
            ],
            [
              formatMessage({ id: 'odc.ruleItems.NumberItem.SortingMethod' }), // 排序方式
              value?.['order'] === 'asc'
                ? formatMessage({
                    id: 'odc.ruleItems.NumberItem.PositiveSequence',
                  }) // 正序
                : formatMessage({ id: 'odc.ruleItems.NumberItem.Reverse' }), // 倒序
            ],
          ]);
          break;
        }
        case NumberRuleType.RANDOM: {
          items = getTextItem([
            [
              formatMessage({ id: 'odc.ruleItems.NumberItem.Interval' }), // 区间
              value?.['range'],
            ],
          ]);
          break;
        }
        case NumberRuleType.NULL:
        case NumberRuleType.SKIP: {
          items = '';
          break;
        }
      }
    } else {
      switch (ruleType) {
        case NumberRuleType.NORMAL: {
          items = (
            <Form.Item
              rules={getRequiredRules()}
              style={{ width: '100%' }}
              name={['genParams', 'fixNum']}
            >
              <InputBigNumber
                isInt={isInt}
                addonBefore={formatMessage({
                  id: 'odc.ruleItems.NumberItem.Value',
                })} /* 值 */
              />
            </Form.Item>
          );

          break;
        }
        case NumberRuleType.ORDER: {
          items = (
            <Space style={{ width: '100%' }} direction="vertical">
              <Form.Item rules={getRequiredRules()} style={{ width: '100%' }} name="lowValue">
                <InputBigNumber
                  isInt={isInt}
                  addonBefore={formatMessage({
                    id: 'odc.ruleItems.NumberItem.StartValue',
                  })} /* 起始值 */
                />
              </Form.Item>
              <Form.Item
                rules={getRequiredRules()}
                style={{ width: '100%' }}
                name={['genParams', 'step']}
              >
                <InputBigNumber
                  min="1"
                  isInt
                  addonBefore={formatMessage({
                    id: 'odc.ruleItems.NumberItem.StepSize',
                  })} /* 步长 */
                />
              </Form.Item>
              <Form.Item style={{ width: '100%' }} name="order">
                <WrapItemWithTitle
                  addonBefore={formatMessage({
                    id: 'odc.ruleItems.NumberItem.Sort',
                  })} /* 排序 */
                >
                  <Select>
                    <Option key="asc" value="asc">
                      {
                        formatMessage({
                          id: 'odc.ruleItems.NumberItem.PositiveSequence',
                        }) /* 正序 */
                      }
                    </Option>
                    <Option key="desc" value="desc">
                      {
                        formatMessage({
                          id: 'odc.ruleItems.NumberItem.Reverse',
                        }) /* 倒序 */
                      }
                    </Option>
                  </Select>
                </WrapItemWithTitle>
              </Form.Item>
            </Space>
          );

          break;
        }
        case NumberRuleType.RANDOM: {
          items = (
            <Form.Item rules={getRangeInputRules()} style={{ width: '100%' }} name="range">
              <RangeInput isInt={isInt} />
            </Form.Item>
          );

          break;
        }
        case NumberRuleType.NULL:
        case NumberRuleType.SKIP: {
          items = '';
          break;
        }
      }
    }

    return readonly ? (
      items
    ) : (
      <Form layout="inline" component="div" initialValues={value} form={form}>
        {items}
      </Form>
    );
  },
);

export default NumberItem;

export function isShowEmpty(ruleType: NumberRuleType) {
  return [NumberRuleType.SKIP, NumberRuleType.NULL].includes(ruleType);
}
