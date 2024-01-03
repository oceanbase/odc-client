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
import { Form, Radio } from 'antd';
import React from 'react';
import { TableColumn } from '../../interface';

interface IProps {
  column: TableColumn;
  onChange: (newColumn: TableColumn) => void;
}

const Generation: React.FC<IProps> = function ({ column, onChange }) {
  return (
    <Form layout="vertical">
      <Form.Item
        label={formatMessage({
          id: 'odc.Columns.ColumnExtraInfo.Generation.VirtualColumnSettings',
        })} /*虚拟列设置*/
      >
        <Radio.Group
          value={!!column.stored}
          onChange={(e) => {
            const v = e.target.value;
            onChange({
              ...column,
              stored: v,
            });
          }}
        >
          <Radio value={false}>
            {
              formatMessage({
                id: 'odc.Columns.ColumnExtraInfo.Generation.NoStorage',
              }) /*不存储*/
            }
          </Radio>
          <Radio value={true}>
            {
              formatMessage({
                id: 'odc.Columns.ColumnExtraInfo.Generation.Storage',
              }) /*存储*/
            }
          </Radio>
        </Radio.Group>
      </Form.Item>
    </Form>
  );
};
export default Generation;
