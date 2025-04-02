import React, { useContext, useRef, useState, useEffect, useMemo } from 'react';
import Toolbar from '@/component/Toolbar';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import MaterializedViewPageContext from '../context';
import EditableTable from '@/page/Workspace/components/EditableTable';
import { DataGridRef } from '@oceanbase-odc/ob-react-data-grid';
import TableCardLayout from '@/page/Workspace/components/CreateTable/TableCardLayout';
import EditToolbar from '@/page/Workspace/components/CreateTable/EditToolbar';
import { useColumns } from './columns';

interface IProps {}
const MvViewConstraints: React.FC<IProps> = () => {
  const { materializedView, session, onRefresh } = useContext(MaterializedViewPageContext);
  const gridRef = useRef<DataGridRef>();

  const gridColumns: any[] = useColumns(materializedView.columns, session?.connection?.dialectType);
  useEffect(() => {
    gridRef.current?.setColumns?.(gridColumns ?? []);
  }, [gridColumns]);

  const rows = useMemo(() => {
    return materializedView.primaryConstraints.map((index, idx) => {
      return {
        ...index,
        key: `${index.name || ''}@@${idx}`,
      };
    });
  }, [materializedView.primaryConstraints]);

  return (
    <TableCardLayout
      toolbar={
        <EditToolbar modified={false}>
          <Toolbar>
            <Toolbar.Button icon={<PlusOutlined />} text={'暂不支持'} disabled />
            <Toolbar.Button icon={<DeleteOutlined />} text={'暂不支持'} disabled />
          </Toolbar>
        </EditToolbar>
      }
    >
      <EditableTable
        readonly
        rowKey="key"
        bordered={false}
        minHeight="100%"
        initialColumns={gridColumns}
        enableFilterRow
        enableFlushDelete
        initialRows={rows as any[]}
        enableRowRecord={true}
        enableColumnRecord={false}
        enableSortRow={false}
        gridRef={gridRef}
      />
    </TableCardLayout>
  );
};

export default MvViewConstraints;
