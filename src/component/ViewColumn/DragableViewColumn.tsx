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

import Icon, { CloseCircleFilled } from '@ant-design/icons';
import { Col, Input, Row } from 'antd';
import React from 'react';
import { IPLParam } from '@/d.ts';
import classNames from 'classnames';
import { IViewParam } from '.';
import Dragable, { IDragable } from '../Dragable';
import styles from './index.less';
import { ReactComponent as DragSvg } from '@/svgr/drag.svg';
import { formatMessage } from '@/util/intl';

export interface IDragableViewParamProps extends IDragable {
  rule: Partial<IViewParam>;
  handleDelete: (idx: number) => void;
  handleEdit: (idx: number, rule: Partial<IPLParam>) => void;
}

const Types = {
  CARD: 'viewColumn',
};

const DragableViewColumn = ({ props }: { props: IDragableViewParamProps }) => {
  const {
    index,
    rule,
    handleDelete,
    handleEdit,
    isDragging,
    connectDropTarget,
    connectDragSource,
    connectDragPreview,
  } = props;
  return connectDragSource(
    <div>
      <Row className={classNames(styles.row, isDragging ? styles.dragging : null)}>
        <Col
          span={20}
          style={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
          }}
        >
          <span style={{ marginRight: 8 }}>
            <Icon component={DragSvg} className={styles.dragHandler} />
          </span>
          {formatMessage({ id: 'workspace.window.createView.columnName', defaultMessage: '名称' })}
          ：
          <Input
            value={rule.paramName}
            style={{ flex: 1 }}
            onChange={(e) => handleEdit(index, { paramName: e.target.value })}
          />
        </Col>
        <CloseCircleFilled className={styles.close} onClick={() => handleDelete(index)} />
      </Row>
    </div>,
  );
};

export default Dragable<IDragableViewParamProps>(
  DragableViewColumn,
  Types.CARD,
) as React.ComponentType<any>;
