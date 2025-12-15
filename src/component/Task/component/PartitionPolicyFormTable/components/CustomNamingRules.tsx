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
import { Form, Input, Space } from 'antd';
import { rules } from '../const';
import styles from '../index.less';

const CustomNamingRules = () => {
  return (
    <Space>
      <Form.Item
        name="generateExpr"
        className={styles.noMarginBottom}
        rules={rules.generateExpr}
        style={{ width: 320 }}
      >
        <Input
          placeholder={
            formatMessage({
              id: 'src.component.Task.component.PartitionPolicyFormTable.23B74BBB',
              defaultMessage: '请输入表达式',
            }) /*"请输入表达式"*/
          }
          addonBefore={
            formatMessage({
              id: 'src.component.Task.component.PartitionPolicyFormTable.D97787FE',
              defaultMessage: '表达式',
            }) /*"表达式"*/
          }
        />
      </Form.Item>
    </Space>
  );
};

export default CustomNamingRules;
