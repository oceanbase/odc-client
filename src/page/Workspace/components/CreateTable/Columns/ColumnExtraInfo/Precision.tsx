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

import InputBigNumber from '@/component/InputBigNumber';
import { formatMessage } from '@/util/intl';
import { Form } from 'antd';
import React from 'react';
import { TableColumn } from '../../interface';

interface IProps {
  column: TableColumn;
  onChange: (newColumn: TableColumn) => void;
  secondPrecision?: boolean;
  dayPrecision?: boolean;
  yearPrecision?: boolean;
}

const Precision: React.FC<IProps> = function ({
  column,
  secondPrecision,
  dayPrecision,
  yearPrecision,
  onChange,
}) {
  return (
    <Form layout="vertical">
      {secondPrecision && (
        <Form.Item
          label={formatMessage({
            id: 'odc.Columns.ColumnExtraInfo.Precision.SecondPrecision',
          })} /*秒精度*/
        >
          <InputBigNumber
            style={{ width: 175 }}
            value={column.secondPrecision}
            onChange={(v) => {
              onChange({
                ...column,
                secondPrecision: v,
              });
            }}
          />
        </Form.Item>
      )}

      {dayPrecision && (
        <Form.Item
          label={formatMessage({
            id: 'odc.Columns.ColumnExtraInfo.Precision.DayPrecision',
          })} /*天精度*/
        >
          <InputBigNumber
            style={{ width: 175 }}
            value={column.dayPrecision}
            onChange={(v) => {
              onChange({
                ...column,
                dayPrecision: v,
              });
            }}
          />
        </Form.Item>
      )}

      {yearPrecision && (
        <Form.Item
          label={formatMessage({
            id: 'odc.Columns.ColumnExtraInfo.Precision.AnnualAccuracy',
          })} /*年精度*/
        >
          <InputBigNumber
            style={{ width: 175 }}
            value={column.yearPrecision}
            onChange={(v) => {
              onChange({
                ...column,
                yearPrecision: v,
              });
            }}
          />
        </Form.Item>
      )}
    </Form>
  );
};

export default Precision;
