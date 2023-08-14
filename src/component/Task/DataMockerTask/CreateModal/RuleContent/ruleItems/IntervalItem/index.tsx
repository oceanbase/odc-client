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
import { Form, Input, Select } from 'antd';
import { FormInstance } from 'antd/es/form/Form';
import React, { forwardRef, useImperativeHandle } from 'react';
import { getTextItem } from '../../util';
import { getRequiredRules } from '../valid';

const { Option } = Select;

export enum IntervalRuleType {
  NORMAL = 'NORMAL',
  SKIP = 'SKIP',
}

interface IIntervalItemProps {
  readonly?: boolean;
  ruleType: IntervalRuleType;
  value: {
    // 定值
    genParams: {
      fixText: string;
    };
  };

  ref: React.Ref<FormInstance>;
}

const IntervalItem: React.FC<IIntervalItemProps> = forwardRef<FormInstance, IIntervalItemProps>(
  (props, ref) => {
    const { readonly, ruleType, value } = props;

    const [form] = Form.useForm();

    useImperativeHandle(ref, () => {
      return form;
    });

    let items;
    if (readonly) {
      switch (ruleType) {
        case IntervalRuleType.NORMAL: {
          items = getTextItem([
            [
              formatMessage({ id: 'odc.ruleItems.IntervalItem.Value' }), // 值
              value?.genParams?.fixText,
            ],
          ]);
          break;
        }
        case IntervalRuleType.SKIP: {
          items = '';
          break;
        }
      }
    } else {
      switch (ruleType) {
        case IntervalRuleType.NORMAL: {
          items = (
            <Form.Item
              rules={getRequiredRules()}
              style={{ width: '100%' }}
              name={['genParams', 'fixText']}
            >
              <Input
                addonBefore={formatMessage({
                  id: 'odc.ruleItems.IntervalItem.Value',
                })} /* 值 */
              />
            </Form.Item>
          );

          break;
        }
        case IntervalRuleType.SKIP: {
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

export default IntervalItem;

export function isShowEmpty(ruleType: IntervalRuleType) {
  return [IntervalRuleType.SKIP].includes(ruleType);
}
