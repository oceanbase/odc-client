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

import React, { useEffect, useState } from 'react';
import { parse } from 'query-string';
import classNames from 'classnames';
import { Col, Row, Select, Space } from 'antd';
import styles from './index.less';
import Icon, { DeleteOutlined } from '@ant-design/icons';
import ObjectName, { EnumObjectType } from '../ObjectName';
import { ReactComponent as DragSvg } from '@/svgr/DragItem.svg';
import EditableText from '../EditableText';
import { formatMessage } from '@/util/intl';

const { Option } = Select;

interface IProps {
  dataKey: string;
  handleDelete: (key: string) => void;
  handleChange: (idx: any) => void;
  isLast: boolean;
}

const JOIN_KEYWORDS = [
  ',',
  'join',
  'inner join',
  'left join',
  'right join',
  'cross join',
  'full join',
  'union',
  'union all',
  'intersect',
  'minus',
  'left outer join',
  'right outer join',
  'full outer join',
];
const Item: React.FC<IProps> = React.memo((props) => {
  const { dataKey, isLast, handleDelete, handleChange } = props;
  const params = parse(dataKey);
  const { d, v, t, uid } = params;

  const handleChangeAliasName = (value) => {
    handleChange({ dataKey, aliasName: value });
  };

  const handleChangeOperation = (value) => {
    handleChange({ dataKey, operation: value });
  };

  return (
    <div className="dragable-item">
      <Row className={classNames(styles.column, styles.dragable)}>
        <Col className={styles['dragable-item']} span={24}>
          <Space>
            <Icon component={DragSvg} className={styles.dragHandler} />
            {t ? <ObjectName title={t} type={EnumObjectType.TABLE} /> : null}
            {v ? <ObjectName title={v} type={EnumObjectType.VIEW} /> : null}
            <span className={styles.groupName}>({d})</span>
            <EditableText
              onChange={handleChangeAliasName}
              placeholder={formatMessage({
                id: 'odc.component.TableSelector.Item.Alias',
                defaultMessage: '别名',
              })} /* 别名 */
            />

            {!isLast && (
              <Select
                defaultValue={JOIN_KEYWORDS[0]}
                dropdownStyle={{ minWidth: '150px' }}
                onChange={handleChangeOperation}
                bordered={false}
                style={{ marginLeft: '-8px' }}
              >
                {JOIN_KEYWORDS.map((keyword) => (
                  <Option key={keyword} value={keyword}>
                    {keyword.toUpperCase()}
                  </Option>
                ))}
              </Select>
            )}
          </Space>
          <DeleteOutlined
            className={styles.close}
            onClick={() => {
              handleDelete(dataKey);
            }}
          />
        </Col>
      </Row>
    </div>
  );
});

export default Item;
