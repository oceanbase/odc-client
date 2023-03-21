import Toolbar from '@/component/Toolbar';
import { TableConstraintDefer } from '@/d.ts/table';
import { formatMessage } from '@/util/intl';
import { DataGridRef } from '@alipay/ob-react-data-grid';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { clone } from 'lodash';
import React, { useContext, useMemo, useRef, useState } from 'react';
import EditableTable from '../../../EditableTable';
import EditToolbar from '../../EditToolbar';
import { removeGridParams } from '../../helper';
import { TableUniqueConstraint } from '../../interface';
import TableCardLayout from '../../TableCardLayout';
import TableContext from '../../TableContext';
import { useColumns } from './columns';

const defaultUniqueConstraints: TableUniqueConstraint = {
  name: null,
  columns: [],
  defer: TableConstraintDefer.NOT,
  enable: true,
};

interface IProps {
  modified?: boolean;
}

const UniqueConstraints: React.FC<IProps> = function ({ modified }) {
  const tableContext = useContext(TableContext);
  const [selectedRowsIdx, setSelectedRowIdx] = useState<number[]>([]);
  const gridColumns: any[] = useColumns(tableContext.columns);
  const gridRef = useRef<DataGridRef>();
  const rows = useMemo(() => {
    return tableContext.uniqueConstraints.map((index, idx) => {
      return {
        ...index,
        key: `${index.name || ''}@@${idx}`,
      };
    });
  }, [tableContext.uniqueConstraints]);

  return (
    <TableCardLayout
      toolbar={
        <EditToolbar modified={modified}>
          <Toolbar>
            <Toolbar.Button
              text={formatMessage({ id: 'workspace.header.create' })}
              icon={PlusOutlined}
              onClick={() => {
                tableContext.setUniqueConstraints(
                  tableContext.uniqueConstraints.concat(defaultUniqueConstraints),
                );
              }}
            />

            <Toolbar.Button
              text={
                formatMessage({ id: 'odc.TableConstraint.Unique.Delete' }) //删除
              }
              icon={DeleteOutlined}
              disabled={!selectedRowsIdx?.length}
              onClick={() => {
                let newRows = [...rows]?.filter((row, index) => {
                  return !selectedRowsIdx?.includes(index);
                });
                tableContext.setUniqueConstraints(removeGridParams(newRows));
              }}
            />
          </Toolbar>
        </EditToolbar>
      }
    >
      <EditableTable
        rowKey="key"
        bordered={false}
        minHeight="100%"
        columns={gridColumns}
        enableFilterRow
        rows={rows as any[]}
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
        onRowsChange={(rows, data) => {
          const newRows: any[] = clone(rows);
          tableContext.setUniqueConstraints(removeGridParams(newRows));
        }}
      />
    </TableCardLayout>
  );
};

export default UniqueConstraints;
