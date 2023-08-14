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

import Icon, { DeleteOutlined } from '@ant-design/icons';
import { Col, Row } from 'antd';
import React from 'react';
// @ts-ignore
import { ColumnShowType } from '@/d.ts';
import classNames from 'classnames';
import { ColumnIcon, IIndexColumn } from '.';
import Dragable, { IDragable } from '../Dragable';
import styles from './index.less';
// @ts-ignore
import DragSvg from '@/svgr/drag.svg';

export interface IDragableColumnProps extends IDragable {
  column: Partial<IIndexColumn>;
  dataShowType: ColumnShowType;
  handleDelete: (idx: number) => void;
}

const Types = {
  CARD: 'indexColumn',
};

const DragableParam = ({ props }: { props: IDragableColumnProps }) => {
  const { index, column, dataShowType, handleDelete, isDragging, connectDragSource } = props;
  return connectDragSource(
    <div>
      <Row
        className={classNames(styles.column, styles.dragable, isDragging ? styles.dragging : null)}
      >
        <Col
          span={24}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flex: 1,
          }}
        >
          <span>
            <span style={{ marginRight: 8 }}>
              <Icon component={DragSvg} className={styles.dragHandler} />
            </span>
            <ColumnIcon dataShowType={dataShowType} />
            {column.columnName}
          </span>
          <DeleteOutlined className={styles.close} onClick={() => handleDelete(index)} />
        </Col>
      </Row>
    </div>,
  );
};

export default Dragable<IDragableColumnProps>(
  DragableParam,
  Types.CARD,
) as React.ComponentType<any>;
