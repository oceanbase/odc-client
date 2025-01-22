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
import { formatMessage } from '@/util/intl';
import Icon, { DeleteOutlined } from '@ant-design/icons';
import { Col, Row, Space } from 'antd';
import classNames from 'classnames';
import { parse } from 'query-string';
import { PureComponent } from 'react';
// @ts-ignore
import { ReactComponent as DragSvg } from '@/svgr/DragItem.svg';
import EditableText from '../EditableText';
import ObjectName, { EnumObjectType } from '../ObjectName';
// @ts-ignore
import styles from './index.less';

export interface IProps {
  dataKey: string;
  handleDelete: (key: string) => void;
  handleChange: (idx: any) => void;
}

const Item: React.FC<IProps> = React.memo((props) => {
  const { dataKey, handleDelete, handleChange } = props;
  const isCustomer = dataKey.includes('odc.customer.column');
  const params = parse(dataKey);
  const { v, c, t, d, aliasName } = params;
  const handleChangeAliasName = (value) => {
    handleChange({ dataKey, aliasName: value });
  };

  const handleSetColumnName = (value) => {
    handleChange({ dataKey, columnName: value });
  };
  return (
    <div className="dragable-item">
      <Row className={classNames(styles.column, styles.dragable)}>
        <Col className={styles['dragable-item']} span={24}>
          <Space>
            <Icon component={DragSvg} className={styles.dragHandler} />
            {!isCustomer ? (
              c
            ) : (
              <EditableText
                hideArrow
                onChange={handleSetColumnName}
                placeholder={formatMessage({
                  id: 'odc.component.ColumnSelector.Item.CustomFields',
                  defaultMessage: '自定义字段',
                })} /* 自定义字段 */
              />
            )}

            {!isCustomer && t ? (
              <span>
                ({' '}
                <ObjectName
                  title={`${d}.${t}${aliasName ? `<${aliasName}>` : ''}`}
                  type={EnumObjectType.TABLE}
                />{' '}
                )
              </span>
            ) : null}
            {!isCustomer && v ? (
              <span>
                ({' '}
                <ObjectName
                  title={`${d}.${v}${aliasName ? `<${aliasName}>` : ''}`}
                  type={EnumObjectType.VIEW}
                />{' '}
                )
              </span>
            ) : null}
            <EditableText
              onChange={handleChangeAliasName}
              placeholder={formatMessage({
                id: 'odc.component.ColumnSelector.Item.Alias',
                defaultMessage: '别名',
              })} /* 别名 */
            />
          </Space>
          <DeleteOutlined className={styles.close} onClick={() => handleDelete(dataKey)} />
        </Col>
      </Row>
    </div>
  );
});

export default Item;
