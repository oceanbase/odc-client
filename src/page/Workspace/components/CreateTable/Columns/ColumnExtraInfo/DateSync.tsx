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
import { Checkbox, Form } from 'antd';
import React from 'react';
import { TableColumn } from '../../interface';

interface IProps {
  column: TableColumn;
  onChange: (newColumn: TableColumn) => void;
}

const DataSync: React.FC<IProps> = function ({ column, onChange }) {
  const { currentTime } = column;
  return (
    <Form layout="vertical">
      <Form.Item
        label={formatMessage({
          id: 'odc.Columns.ColumnExtraInfo.DateSync.TimeSetting',
        })} /*时间设置*/
      >
        <Checkbox
          checked={!!currentTime}
          onChange={(e) => {
            const v = e.target.checked;
            onChange({
              ...column,
              currentTime: v,
            });
          }}
        >
          {
            formatMessage({
              id: 'odc.Columns.ColumnExtraInfo.DateSync.UpdateBasedOnTheCurrent',
            }) /*根据当前时间戳更新*/
          }
        </Checkbox>
      </Form.Item>
    </Form>
  );
};

export default DataSync;
