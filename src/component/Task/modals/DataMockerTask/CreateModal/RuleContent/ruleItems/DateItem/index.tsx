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
import { DatePicker, Form, InputNumber, Select, Space } from 'antd';
import { FormInstance } from 'antd/es/form/Form';
import dayjs from 'dayjs';
import React, { forwardRef, useImperativeHandle } from 'react';
import { disabledDateOfMock, getTextItem } from '../../util';
import WrapItemWithTitle from '../../WrapItemWithTitle';
import { getRangeInputRules, getRequiredRules } from '../valid';

const { Option } = Select;

export enum DateRuleType {
  NORMAL = 'NORMAL',
  ORDER = 'ORDER',
  RANDOM = 'RANDOM',
  NULL = 'NULL',
  SKIP = 'SKIP',
}

interface IDateItemProps {
  readonly?: boolean;
  ruleType: DateRuleType;
  value:
    | {
        // 定值日期
        genParams: {
          timestamp: typeof dayjs;
        };
      }
    | {
        // 随机日期
        range: [typeof dayjs, typeof dayjs];
      }
    | {
        // 顺序日期
        genParams: {
          step: number;
          timeUnit: 'DAYS';
        };

        order: 'asc' | 'desc';
        lowValue: typeof dayjs;
      };

  ref: React.Ref<FormInstance>;
}

const DateItem: React.FC<IDateItemProps> = forwardRef<FormInstance, IDateItemProps>(
  (props, ref) => {
    const { readonly, ruleType, value } = props;

    const [form] = Form.useForm();

    useImperativeHandle(ref, () => {
      return form;
    });

    let items;
    if (readonly) {
      switch (ruleType) {
        case DateRuleType.NORMAL: {
          items = getTextItem([
            [
              formatMessage({ id: 'odc.ruleItems.DateItem.Date', defaultMessage: '日期' }), // 日期
              value?.['genParams']?.timestamp,
            ],
          ]);
          break;
        }
        case DateRuleType.ORDER: {
          items = getTextItem([
            [
              formatMessage({ id: 'odc.ruleItems.DateItem.Date', defaultMessage: '日期' }), // 日期
              value?.['lowValue'],
            ],

            [
              formatMessage({ id: 'odc.ruleItems.DateItem.StepSize', defaultMessage: '步长' }), // 步长
              value?.['genParams']?.step +
                formatMessage({ id: 'odc.ruleItems.DateItem.Days', defaultMessage: '天' }), // 天
            ],
            [
              formatMessage({
                id: 'odc.ruleItems.DateItem.SortingMethod',
                defaultMessage: '排序方式',
              }), // 排序方式
              value?.['order'] === 'asc'
                ? formatMessage({
                    id: 'odc.ruleItems.DateItem.PositiveSequence',
                    defaultMessage: '正序',
                  }) // 正序
                : formatMessage({ id: 'odc.ruleItems.DateItem.Reverse', defaultMessage: '倒序' }), // 倒序
            ],
          ]);
          break;
        }
        case DateRuleType.RANDOM: {
          items = getTextItem([
            [
              formatMessage({ id: 'odc.ruleItems.DateItem.DateRange', defaultMessage: '日期范围' }), // 日期范围
              value?.['range'],
            ],
          ]);
          break;
        }
        case DateRuleType.NULL:
        case DateRuleType.SKIP: {
          items = '';
          break;
        }
      }
    } else {
      switch (ruleType) {
        case DateRuleType.NORMAL: {
          items = (
            <Form.Item
              rules={getRequiredRules()}
              style={{ width: '100%' }}
              name={['genParams', 'timestamp']}
            >
              <WrapItemWithTitle
                addonBefore={formatMessage({
                  id: 'odc.ruleItems.DateItem.Date',
                  defaultMessage: '日期',
                })} /* 日期 */
              >
                <DatePicker disabledDate={disabledDateOfMock} />
              </WrapItemWithTitle>
            </Form.Item>
          );

          break;
        }
        case DateRuleType.ORDER: {
          items = (
            <Space style={{ width: '100%' }} direction="vertical">
              <Form.Item rules={getRequiredRules()} style={{ width: '100%' }} name="lowValue">
                <WrapItemWithTitle
                  addonBefore={formatMessage({
                    id: 'odc.ruleItems.DateItem.Date',
                    defaultMessage: '日期',
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
                    id: 'odc.ruleItems.DateItem.StepSize',
                    defaultMessage: '步长',
                  })} /* 步长 */
                >
                  <InputNumber<number | string>
                    precision={0}
                    min={0}
                    formatter={
                      (value) =>
                        value +
                        formatMessage({
                          id: 'odc.ruleItems.DateItem.Days',
                          defaultMessage: '天',
                        }) // 天
                    }
                    parser={(value) =>
                      value.replace(
                        formatMessage({ id: 'odc.ruleItems.DateItem.Days', defaultMessage: '天' }),
                        '',
                      )
                    }
                  />
                </WrapItemWithTitle>
              </Form.Item>
              <Form.Item style={{ width: '100%' }} name="order">
                <WrapItemWithTitle
                  addonBefore={formatMessage({
                    id: 'odc.ruleItems.DateItem.Sort',
                    defaultMessage: '排序',
                  })} /* 排序 */
                >
                  <Select>
                    <Option key="asc" value="asc">
                      {
                        formatMessage({
                          id: 'odc.ruleItems.DateItem.PositiveSequence',
                          defaultMessage: '正序',
                        }) /* 正序 */
                      }
                    </Option>
                    <Option key="desc" value="desc">
                      {
                        formatMessage({
                          id: 'odc.ruleItems.DateItem.Reverse',
                          defaultMessage: '倒序',
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
        case DateRuleType.RANDOM: {
          items = (
            <Form.Item rules={getRangeInputRules(true)} style={{ width: '100%' }} name="range">
              <WrapItemWithTitle
                addonBefore={formatMessage({
                  id: 'odc.ruleItems.DateItem.Date',
                  defaultMessage: '日期',
                })} /* 日期 */
              >
                <DatePicker.RangePicker disabledDate={disabledDateOfMock} />
              </WrapItemWithTitle>
            </Form.Item>
          );

          break;
        }
        case DateRuleType.NULL:
        case DateRuleType.SKIP: {
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

export default DateItem;

export function isShowEmpty(ruleType: DateRuleType) {
  return [DateRuleType.NULL, DateRuleType.SKIP].includes(ruleType);
}
