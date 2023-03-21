import { MenuOutlined } from '@ant-design/icons';
import { Table } from 'antd';
import { arrayMoveImmutable } from 'array-move';
import React from 'react';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { ITaskFlowConfig } from '../../interface';

export const DragHandle = SortableHandle(() => <MenuOutlined />);

const SortableItem = SortableElement((props) => <tr {...props} />);
const SortableBody = SortableContainer((props) => <tbody {...props} />);

interface IProps {
  columns: any[];
  dataSource?: ITaskFlowConfig[];
  wrapperRef?: any;
  onSourceChange: (source: ITaskFlowConfig[]) => void;
}

const DraggableTable: React.FC<IProps> = (props) => {
  const { columns, dataSource, wrapperRef, onSourceChange } = props;

  const onSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex !== newIndex) {
      const newData = arrayMoveImmutable(dataSource.slice(), oldIndex, newIndex).filter(
        (el) => !!el,
      );
      onSourceChange(newData);
    }
  };

  const DraggableContainer = (props) => (
    <SortableBody
      lockAxis="y"
      useDragHandle
      disableAutoscroll
      helperClass="row-dragging"
      onSortEnd={onSortEnd}
      helperContainer={() => wrapperRef.current}
      {...props}
    />
  );

  const DraggableBodyRow = ({ className, style, ...restProps }) => {
    const index = dataSource?.findIndex((x) => x.id === restProps['data-row-key']);
    return dataSource?.[index]?.builtIn ? (
      <tr {...restProps} />
    ) : (
      <SortableItem index={index} {...restProps} />
    );
  };

  return (
    <Table
      pagination={false}
      dataSource={dataSource}
      columns={columns}
      rowKey="id"
      components={{
        body: {
          wrapper: DraggableContainer,
          row: DraggableBodyRow,
        },
      }}
    />
  );
};

export default DraggableTable;
