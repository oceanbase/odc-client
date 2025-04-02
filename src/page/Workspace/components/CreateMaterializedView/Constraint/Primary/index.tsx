import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import Toolbar from '@/component/Toolbar';
import { TableConstraintDefer } from '@/d.ts/table';
import { formatMessage } from '@/util/intl';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { DataGridRef } from '@oceanbase-odc/ob-react-data-grid';
import { clone } from 'lodash';
import { useColumns } from './columns';
import SessionStore from '@/store/sessionManager/session';
import TableCardLayout from '@/page/Workspace/components/CreateTable/TableCardLayout';
import EditToolbar from '@/page/Workspace/components/CreateTable/EditToolbar';
import { removeGridParams } from '@/page/Workspace/components/CreateTable/helper';
import EditableTable from '@/page/Workspace/components/EditableTable';

const defaultPrimaryConstraint = {
  name: null,
  columns: [],
  defer: TableConstraintDefer.NOT,
  enable: true,
};

interface IProps {
  modified?: boolean;
  primaryConstraints: any[];
  setPrimaryConstraints: (a: any) => void;
  columns: any;
  session: SessionStore;
  editMode: boolean;
}
const PrimaryConstaint: React.FC<IProps> = (props) => {
  const { modified, primaryConstraints, columns, session, editMode, setPrimaryConstraints } = props;
  const gridColumns: any[] = useColumns(columns, session?.connection?.dialectType);
  const gridRef = useRef<DataGridRef>();
  const [selectedRowsIdx, setSelectedRowIdx] = useState<number[]>([]);
  const rows = useMemo(() => {
    return primaryConstraints?.map((index, idx) => {
      return {
        ...index,
        key: `${index.name || ''}@@${idx}`,
      };
    });
  }, [primaryConstraints]);

  useEffect(() => {
    gridRef.current?.setRows?.(rows ?? []);
  }, [rows]);

  useEffect(() => {
    gridRef.current?.setColumns?.(gridColumns ?? []);
  }, [gridColumns]);

  return (
    <TableCardLayout
      toolbar={
        <EditToolbar modified={modified}>
          <Toolbar>
            <Toolbar.Button
              disabled={editMode}
              text={formatMessage({ id: 'workspace.header.create', defaultMessage: '新建' })}
              icon={PlusOutlined}
              onClick={() => {
                setPrimaryConstraints(primaryConstraints.concat(defaultPrimaryConstraint));
              }}
            />

            <Toolbar.Button
              disabled={editMode}
              text={
                formatMessage({ id: 'odc.TableConstraint.Primary.Delete', defaultMessage: '删除' }) //删除
              }
              icon={DeleteOutlined}
              onClick={() => {
                let newRows = [...rows]?.filter((row, index) => {
                  return !selectedRowsIdx?.includes(index);
                });
                setPrimaryConstraints(removeGridParams(newRows));
              }}
            />
          </Toolbar>
        </EditToolbar>
      }
    >
      <EditableTable
        readonly={editMode}
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
        onSelectChange={(keys) => {
          setSelectedRowIdx(
            keys.map((key) => {
              return rows.findIndex((row) => row.key === key);
            }),
          );
        }}
        gridRef={gridRef}
        onRowsChange={(rows) => {
          const newRows: any[] = clone(rows);
          setPrimaryConstraints(removeGridParams(newRows));
        }}
      />
    </TableCardLayout>
  );
};

export default PrimaryConstaint;
