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
import { Checkbox, CheckboxChangeEvent, Form, FormInstance, Radio, Space } from 'antd';
import { ShardingStrategy } from '@/d.ts';
import HelpDoc from '@/component/helpDoc';
import { useState, useEffect, useMemo } from 'react';

interface IProps {
  form: FormInstance;
}

const ShardingStrategyItem: React.FC<IProps> = ({ form }) => {
  const [fullTableSearch, setFullTableSearch] = useState<boolean>(
    form.getFieldValue('shardingStrategy') === ShardingStrategy.FIXED_LENGTH,
  );
  const handleChange = (e: CheckboxChangeEvent) => {
    form.setFieldsValue({
      shardingStrategy: e.target.checked ? ShardingStrategy.FIXED_LENGTH : ShardingStrategy.MATCH,
    });
    setFullTableSearch(e.target.checked);
  };

  return (
    <Form.Item
      extra={formatMessage({
        id: 'src.component.Schedule.components.ShardingStrategyFormItem.3A6B92E5',
        defaultMessage: '若使用全表扫描方式进行数据搜索，处理过程将更加稳定但性能可能会受到影响',
      })}
      name="shardingStrategy"
      rules={[
        {
          required: true,
          message: formatMessage({
            id: 'src.component.Task.component.ShardingStrategyItem.D5F45B7A',
            defaultMessage: '请选择搜索策略',
          }),
        },
      ]}
    >
      <Checkbox checked={fullTableSearch} onChange={handleChange}>
        {formatMessage({
          id: 'src.component.Schedule.components.ShardingStrategyFormItem.C9AEACD4',
          defaultMessage: '通过全表扫描进行数据搜索',
        })}
      </Checkbox>
    </Form.Item>
  );
};
export default ShardingStrategyItem;
