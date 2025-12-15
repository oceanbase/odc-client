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
import { Form, Input } from 'antd';

const IntervalGenerateExprFormItem = () => {
  return (
    <Form.Item
      name="intervalGenerateExpr"
      label={
        formatMessage({
          id: 'src.component.Task.component.PartitionPolicyFormTable.7BC3752C',
          defaultMessage: '命名间隔',
        }) /*"命名间隔"*/
      }
      tooltip={formatMessage({
        id: 'src.component.Task.component.PartitionPolicyFormTable.7F47487A',
        defaultMessage:
          "可在命名规则表达式中通过 ${INTERVAL} 变量引用，比如:concat('P_',${COL1}+${INTERVAL})",
      })}
    >
      <Input
        style={{ width: 180 }}
        placeholder={
          formatMessage({
            id: 'src.component.Task.component.PartitionPolicyFormTable.07788524',
            defaultMessage: '请输入',
          }) /*"请输入"*/
        }
      />
    </Form.Item>
  );
};

export default IntervalGenerateExprFormItem;
