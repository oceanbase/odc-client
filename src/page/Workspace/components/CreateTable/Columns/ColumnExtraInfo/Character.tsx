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
import { Col, Form, Row, Select } from 'antd';
import { isNil } from 'lodash';
import { useContext } from 'react';
import TablePageContext from '../../../TablePage/context';
import { getDefaultCollation } from '../../helper';
import { TableColumn } from '../../interface';
import TableContext from '../../TableContext';

const Option = Select.Option;

interface IProps {
  column: TableColumn;
  onChange: (newColumn: TableColumn) => void;
}

export default function ({ column, onChange }: IProps) {
  const tableContext = useContext(TableContext);
  const { collations, charsets } = tableContext.session;
  const { character, collation, ordinalPosition } = column;
  const pageContext = useContext(TablePageContext);
  const configValue = [];
  if (column.unsigned) {
    configValue.push('unsigned');
  }
  if (column.zerofill) {
    configValue.push('zerofill');
  }
  return (
    <Form layout="vertical">
      <Row gutter={32} style={{ width: 350 }}>
        <Col span={12}>
          <Form.Item
            label={formatMessage({
              id: 'odc.Columns.ColumnExtraInfo.Character.CharacterSet',
              defaultMessage: '字符集',
            })} /*字符集*/
          >
            <Select
              disabled={pageContext?.editMode && !isNil(ordinalPosition)}
              value={character}
              onChange={(v) => {
                onChange({
                  ...column,
                  character: v,
                  collation: getDefaultCollation(v, collations),
                });
              }}
            >
              {charsets?.map((c) => (
                <Option key={c} value={c}>
                  {c}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={formatMessage({
              id: 'odc.Columns.ColumnExtraInfo.Character.SortingRules',
              defaultMessage: '排序规则',
            })} /*排序规则*/
          >
            <Select
              disabled={pageContext?.editMode && !isNil(ordinalPosition)}
              value={collation}
              onChange={(v) => {
                onChange({
                  ...column,
                  collation: v,
                });
              }}
            >
              {collations
                ?.filter((c) => {
                  let _character = character || '';
                  return c.indexOf(_character) > -1;
                })
                .map((c) => (
                  <Option key={c} value={c}>
                    {c}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}
