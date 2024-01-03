/*
 * Copyright 2024 OceanBase
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
import { Checkbox, Form, Typography } from 'antd';

export default function ({ column, onChange }) {
  const configValue = [];
  if (column.unsigned) {
    configValue.push('unsigned');
  }
  if (column.zerofill) {
    configValue.push('zerofill');
  }
  return (
    <Form layout="vertical">
      <Typography.Text type="secondary">
        {
          formatMessage({
            id: 'odc.Columns.ColumnExtraInfo.Number.OnlyOneAutoIncrementField',
          }) /*每个表仅设置一个自增字段*/
        }
      </Typography.Text>
      <Form.Item
        label={formatMessage({
          id: 'odc.Columns.ColumnExtraInfo.Number.ValueSetting',
        })} /*数值设置*/
      >
        <Checkbox.Group
          value={configValue}
          onChange={(checkedValues) => {
            onChange({
              ...column,
              unsigned: checkedValues.includes('unsigned'),
              zerofill: checkedValues.includes('zerofill'),
            });
          }}
          options={[
            {
              label: formatMessage({
                id: 'odc.Columns.ColumnExtraInfo.Number.Unsigned',
              }), //无符号
              value: 'unsigned',
            },

            {
              label: formatMessage({
                id: 'odc.Columns.ColumnExtraInfo.Number.FillZero',
              }), //填充零
              value: 'zerofill',
            },
          ]}
        />
      </Form.Item>
    </Form>
  );
}
