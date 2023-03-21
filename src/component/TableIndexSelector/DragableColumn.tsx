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
