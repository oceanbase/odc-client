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

import InputBigNumber from '@/component/InputBigNumber';
import { getColumnMaxValue } from '@/util/column';
import { formatMessage } from '@/util/intl';
import { DatePicker, Form, Input, InputNumber, Select, Space } from 'antd';
import { FormInstance } from 'antd/es/form/Form';
import moment from 'moment';
import React, { forwardRef, useImperativeHandle } from 'react';
import RangeInput from '../../RangeInput';
import { disabledDateOfMock, getTextItem } from '../../util';
import WrapItemWithTitle from '../../WrapItemWithTitle';
import { getRangeInputRules, getRequiredRules } from '../valid';

const { Option } = Select;

export enum CharRuleType {
  NORMAL_TEXT = 'NORMAL_TEXT',
  RANDOM_TEXT = 'RANDOM_TEXT',
  REGEXP_TEXT = 'REGEXP_TEXT',
  NORMAL_BOOL = 'NORMAL_BOOL',
  RANDOM_BOOL = 'RANDOM_BOOL',
  NORMAL_DATE = 'NORMAL_DATE',
  RANDOM_DATE = 'RANDOM_DATE',
  ORDER_DATE = 'ORDER_DATE',
  NORMAL_NUMBER = 'NORMAL_NUMBER',
  RANDOM_NUMBER = 'RANDOM_NUMBER',
  ORDER_NUMBER = 'ORDER_NUMBER',
  NULL = 'NULL',
  SKIP = 'SKIP',
}

interface ICharItemProps {
  maxLength?: number;
  readonly?: boolean;
  ruleType: CharRuleType;
  value:
    | {
        // 随机文本
        genParams: {
          caseOption: 'ALL_LOWER_CASE' | 'ALL_UPPER_CASE';
        };

        range: [number, number];
      }
    | {
        // 正则文本
        genParams: {
          regText: string;
        };
      }
    | {
        // 定值文本, 定值布尔
        genParams: {
          fixText: string;
        };
      }
    | {
        // 随机日期
        range: [typeof moment, typeof moment];
      }
    | {
        // 随机数字
        range: [string, string];
      }
    | {
        // 定值日期
        genParams: {
          timestamp: typeof moment;
        };
      }
    | {
        // 顺序日期
        genParams: {
          step: number;
          timeUnit: 'DAYS';
        };

        order: 'asc' | 'desc';
        lowValue: typeof moment;
      }
    | {
        // 定值数字
        genParams: {
          fixNum: string;
        };
      }
    | {
        // 顺序数字
        genParams: {
          step: string;
        };

        order: 'asc' | 'desc';
        lowValue: string;
      };

  ref: React.Ref<FormInstance>;
}

const CharItem: React.FC<ICharItemProps> = forwardRef<FormInstance, ICharItemProps>(
  (props, ref) => {
    const { readonly, ruleType, value, maxLength } = props;
    const [form] = Form.useForm();

    useImperativeHandle(ref, () => {
      return form;
    });

    let items;
    if (readonly) {
      switch (ruleType) {
        case CharRuleType.NORMAL_TEXT: {
          items = getTextItem([
            [
              formatMessage({ id: 'odc.ruleItems.CharItem.Value' }), // 值
              value?.['genParams']?.fixText,
            ],
          ]);
          break;
        }
        case CharRuleType.RANDOM_TEXT: {
          items = getTextItem([
            [
              formatMessage({ id: 'odc.ruleItems.CharItem.LengthRange' }), // 长度区间
              value?.['range'],
            ],

            [
              formatMessage({ id: 'odc.ruleItems.CharItem.Case' }), // 大小写
              value?.['genParams']?.caseOption === 'ALL_LOWER_CASE'
                ? formatMessage({ id: 'odc.ruleItems.CharItem.AllLowercase' }) // 全部小写
                : formatMessage({ id: 'odc.ruleItems.CharItem.AllUppercase' }), // 全部大写
            ],
          ]);
          break;
        }
        case CharRuleType.REGEXP_TEXT: {
          items = getTextItem([
            [
              formatMessage({ id: 'odc.ruleItems.CharItem.RegularExpression' }), // 正则表达式
              value?.['genParams']?.regText,
            ],
          ]);
          break;
        }
        case CharRuleType.RANDOM_BOOL: {
          items = '';
          break;
        }
        case CharRuleType.NORMAL_BOOL: {
          items = getTextItem([
            [
              formatMessage({ id: 'odc.ruleItems.CharItem.BooleanValue' }), // 布尔值
              value?.['genParams']?.fixText,
            ],
          ]);
          break;
        }
        case CharRuleType.NORMAL_DATE: {
          items = getTextItem([
            [
              formatMessage({ id: 'odc.ruleItems.CharItem.Date' }), // 日期
              value?.['genParams']?.timestamp,
            ],
          ]);
          break;
        }
        case CharRuleType.RANDOM_DATE:
        case CharRuleType.RANDOM_NUMBER: {
          items = getTextItem([
            [
              formatMessage({ id: 'odc.ruleItems.CharItem.Interval' }), // 区间
              value?.['range'],
            ],
          ]);
          break;
        }
        case CharRuleType.ORDER_DATE: {
          const step = value?.['genParams']?.step;
          items = getTextItem([
            [
              formatMessage({ id: 'odc.ruleItems.CharItem.Date' }), // 日期
              value?.['lowValue'],
            ],

            [
              formatMessage({ id: 'odc.ruleItems.CharItem.StepSize' }), // 步长
              step + formatMessage({ id: 'odc.ruleItems.CharItem.Days' }), // 天
            ],
            [
              formatMessage({ id: 'odc.ruleItems.CharItem.Sort' }), // 排序
              value?.['order'] === 'asc'
                ? formatMessage({ id: 'odc.ruleItems.CharItem.PositiveSequence' }) // 正序
                : formatMessage({ id: 'odc.ruleItems.CharItem.Reverse' }), // 倒序
            ],
          ]);
          break;
        }
        case CharRuleType.ORDER_NUMBER: {
          const step = value?.['genParams']?.step;
          items = getTextItem([
            [
              formatMessage({ id: 'odc.ruleItems.CharItem.StartValue' }), // 起始值
              value?.['lowValue'],
            ],

            [
              formatMessage({ id: 'odc.ruleItems.CharItem.StepSize' }), // 步长
              step,
            ],

            [
              formatMessage({ id: 'odc.ruleItems.CharItem.Sort' }), // 排序
              value?.['order'] === 'asc'
                ? formatMessage({ id: 'odc.ruleItems.CharItem.PositiveSequence' }) // 正序
                : formatMessage({ id: 'odc.ruleItems.CharItem.Reverse' }), // 倒序
            ],
          ]);
          break;
        }
        case CharRuleType.NORMAL_NUMBER: {
          items = getTextItem([
            [
              formatMessage({ id: 'odc.ruleItems.CharItem.Value' }), // 值
              value?.['genParams']?.fixNum,
            ],
          ]);
          break;
        }
        case CharRuleType.NULL:
        case CharRuleType.SKIP: {
          items = '';
          break;
        }
      }
    } else {
      switch (ruleType) {
        case CharRuleType.NORMAL_TEXT: {
          items = (
            <Space style={{ width: '100%' }} direction="vertical">
              <Form.Item
                rules={getRequiredRules()}
                style={{ width: '100%' }}
                name={['genParams', 'fixText']}
              >
                <Input
                  maxLength={maxLength}
                  addonBefore={formatMessage({
                    id: 'odc.ruleItems.CharItem.Value',
                  })} /* 值 */
                />
              </Form.Item>
            </Space>
          );

          break;
        }
        case CharRuleType.RANDOM_TEXT: {
          items = (
            <Space style={{ width: '100%' }} direction="vertical">
              <Form.Item rules={getRangeInputRules()} style={{ width: '100%' }} name="range">
                <RangeInput
                  max={`${maxLength}`}
                  min={`${1}`}
                  addonBefore={formatMessage({
                    id: 'odc.ruleItems.CharItem.LengthRange',
                  })} /* 长度区间 */
                />
              </Form.Item>
              <Form.Item style={{ width: '100%' }} name={['genParams', 'caseOption']}>
                <WrapItemWithTitle
                  addonBefore={formatMessage({
                    id: 'odc.ruleItems.CharItem.Case',
                  })} /* 大小写 */
                >
                  <Select>
                    <Option key="ALL_LOWER_CASE" value="ALL_LOWER_CASE">
                      {
                        formatMessage({
                          id: 'odc.ruleItems.CharItem.AllLowercase',
                        }) /* 全部小写 */
                      }
                    </Option>
                    <Option key="ALL_UPPER_CASE" value="ALL_UPPER_CASE">
                      {
                        formatMessage({
                          id: 'odc.ruleItems.CharItem.AllUppercase',
                        }) /* 全部大写 */
                      }
                    </Option>
                  </Select>
                </WrapItemWithTitle>
              </Form.Item>
            </Space>
          );

          break;
        }
        case CharRuleType.REGEXP_TEXT: {
          items = (
            <Form.Item style={{ width: '100%' }} name={['genParams', 'regText']}>
              <Input
                addonBefore={formatMessage({
                  id: 'odc.ruleItems.CharItem.RegularExpression',
                })} /* 正则表达式 */
              />
            </Form.Item>
          );

          break;
        }
        case CharRuleType.NORMAL_BOOL: {
          items = (
            <Form.Item style={{ width: '100%' }} name={['genParams', 'fixText']}>
              <WrapItemWithTitle
                addonBefore={formatMessage({
                  id: 'odc.ruleItems.CharItem.Value',
                })} /* 值 */
              >
                <Select>
                  <Option key="TRUE" value="TRUE">
                    TRUE
                  </Option>
                  <Option key="FALSE" value="FALSE">
                    FALSE
                  </Option>
                </Select>
              </WrapItemWithTitle>
            </Form.Item>
          );

          break;
        }
        case CharRuleType.NORMAL_DATE: {
          items = (
            <Form.Item
              rules={getRequiredRules()}
              style={{ width: '100%' }}
              name={['genParams', 'timestamp']}
            >
              <WrapItemWithTitle
                addonBefore={formatMessage({
                  id: 'odc.ruleItems.CharItem.Date',
                })} /* 日期 */
              >
                <DatePicker disabledDate={disabledDateOfMock} />
              </WrapItemWithTitle>
            </Form.Item>
          );

          break;
        }
        case CharRuleType.RANDOM_DATE: {
          items = (
            <Form.Item rules={getRangeInputRules(true)} style={{ width: '100%' }} name="range">
              <WrapItemWithTitle
                addonBefore={formatMessage({
                  id: 'odc.ruleItems.CharItem.DateRange',
                })} /* 日期范围 */
              >
                <DatePicker.RangePicker disabledDate={disabledDateOfMock} />
              </WrapItemWithTitle>
            </Form.Item>
          );

          break;
        }
        case CharRuleType.ORDER_DATE: {
          items = (
            <Space style={{ width: '100%' }} direction="vertical">
              <Form.Item rules={getRequiredRules()} style={{ width: '100%' }} name="lowValue">
                <WrapItemWithTitle
                  addonBefore={formatMessage({
                    id: 'odc.ruleItems.CharItem.Date',
                  })} /* 日期 */
                >
                  <DatePicker disabledDate={disabledDateOfMock} />
                </WrapItemWithTitle>
              </Form.Item>
              <Form.Item
                rules={getRequiredRules()}
                style={{ width: '100%' }}
                name={['genParams', 'step']}
              >
                <WrapItemWithTitle
                  addonBefore={formatMessage({
                    id: 'odc.ruleItems.CharItem.StepSize',
                  })} /* 步长 */
                >
                  <InputNumber<number | string>
                    precision={0}
                    min={0}
                    formatter={
                      (value) =>
                        `${value}${formatMessage({
                          id: 'odc.ruleItems.CharItem.Days',
                        })}` // 天
                    }
                    parser={(value) =>
                      value.replace(formatMessage({ id: 'odc.ruleItems.CharItem.Days' }), '')
                    }
                  />
                </WrapItemWithTitle>
              </Form.Item>
              <Form.Item style={{ width: '100%' }} name="order">
                <WrapItemWithTitle
                  addonBefore={formatMessage({
                    id: 'odc.ruleItems.CharItem.Sort',
                  })} /* 排序 */
                >
                  <Select>
                    <Option key="asc" value="asc">
                      {
                        formatMessage({
                          id: 'odc.ruleItems.CharItem.PositiveSequence',
                        }) /* 正序 */
                      }
                    </Option>
                    <Option key="desc" value="desc">
                      {
                        formatMessage({
                          id: 'odc.ruleItems.CharItem.Reverse',
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
        case CharRuleType.NORMAL_NUMBER: {
          items = (
            <Form.Item
              rules={getRequiredRules()}
              style={{ width: '100%' }}
              name={['genParams', 'fixNum']}
            >
              <InputBigNumber
                min="-9223372036854775808"
                max={getColumnMaxValue(maxLength, 0, '9223372036854775807')}
                addonBefore={formatMessage({
                  id: 'odc.ruleItems.CharItem.Value',
                })} /* 值 */
              />
            </Form.Item>
          );

          break;
        }
        case CharRuleType.ORDER_NUMBER: {
          items = (
            <Space style={{ width: '100%' }} direction="vertical">
              <Form.Item rules={getRequiredRules()} style={{ width: '100%' }} name="lowValue">
                <InputBigNumber
                  min="-9223372036854775808"
                  max={getColumnMaxValue(maxLength, 0, '9223372036854775807')}
                  addonBefore={formatMessage({
                    id: 'odc.ruleItems.CharItem.StartValue',
                  })} /* 起始值 */
                />
              </Form.Item>
              <Form.Item
                rules={getRequiredRules()}
                style={{ width: '100%' }}
                name={['genParams', 'step']}
              >
                <InputBigNumber
                  min="0"
                  addonBefore={formatMessage({
                    id: 'odc.ruleItems.CharItem.StepSize',
                  })} /* 步长 */
                />
              </Form.Item>
              <Form.Item style={{ width: '100%' }} name="order">
                <WrapItemWithTitle
                  addonBefore={formatMessage({
                    id: 'odc.ruleItems.CharItem.Sort',
                  })} /* 排序 */
                >
                  <Select>
                    <Option key="asc" value="asc">
                      {
                        formatMessage({
                          id: 'odc.ruleItems.CharItem.PositiveSequence',
                        }) /* 正序 */
                      }
                    </Option>
                    <Option key="desc" value="desc">
                      {
                        formatMessage({
                          id: 'odc.ruleItems.CharItem.Reverse',
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
        case CharRuleType.RANDOM_NUMBER: {
          items = (
            <Form.Item rules={getRangeInputRules()} style={{ width: '100%' }} name="range">
              <RangeInput
                min="-9223372036854775808"
                max={getColumnMaxValue(maxLength, 0, '9223372036854775807')}
                addonBefore={formatMessage({
                  id: 'odc.ruleItems.CharItem.Interval',
                })} /* 区间 */
              />
            </Form.Item>
          );

          break;
        }
        case CharRuleType.RANDOM_BOOL:
        case CharRuleType.NULL:
        case CharRuleType.SKIP: {
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

export default CharItem;

export function isShowEmpty(ruleType: CharRuleType) {
  return [CharRuleType.RANDOM_BOOL, CharRuleType.NULL, CharRuleType.SKIP].includes(ruleType);
}
