import { generateUpdateTableDDL } from '@/common/network/table';
import Toolbar from '@/component/Toolbar';
import { formatMessage } from '@/util/intl';
import { DataGridRef } from '@alipay/ob-react-data-grid';
import { DeleteOutlined, PlusOutlined, SyncOutlined } from '@ant-design/icons';
import { clone, cloneDeep } from 'lodash';
import React, { useContext, useMemo, useRef, useState } from 'react';
import EditableTable from '../../EditableTable';
import TablePageContext from '../../TablePage/context';
import EditToolbar from '../EditToolbar';
import { removeGridParams } from '../helper';
import {
  TableIndex as ITableIndex,
  TableIndexMehod,
  TableIndexScope,
  TableIndexType,
} from '../interface';
import TableCardLayout from '../TableCardLayout';
import TableContext from '../TableContext';
import { useColumns } from './columns';

const defaultIndex: ITableIndex = {
  name: null,
  method: TableIndexMehod.BTREE,
  scope: TableIndexScope.GLOBAL,
  columns: [],
  visible: true,
  type: TableIndexType.NORMAL,
  ordinalPosition: null,
};

interface IProps {
  modified?: boolean;
}

const TableIndex: React.FC<IProps> = function ({ modified }) {
  const tableContext = useContext(TableContext);
  const pageContext = useContext(TablePageContext);
  const [selectedRowsIdx, setSelectedRowIdx] = useState<number[]>([]);
  const gridColumns: any[] = useColumns(tableContext.columns);
  const gridRef = useRef<DataGridRef>();
  const rows = useMemo(() => {
    return tableContext.indexes.map((index, idx) => {
      return {
        ...index,
        key: `${index.name || ''}@@${idx}`,
      };
    });
  }, [tableContext.indexes]);

  return (
    <TableCardLayout
      toolbar={
        <EditToolbar
          modified={modified}
          onCancel={() => {
            tableContext.setIndexes(null);
          }}
          onOk={async () => {
            const newData = cloneDeep(tableContext.indexes);
            const updateTableDML = await generateUpdateTableDDL(
              {
                ...pageContext.table,
                indexes: newData,
              },

              pageContext.table,
            );

            if (!updateTableDML) {
              return;
            }
            const isSuccess = await pageContext.showExecuteModal?.(
              updateTableDML,
              pageContext?.table?.info?.tableName,
              async () => {
                await pageContext.onRefresh();
                tableContext.setIndexes(null);
              },
            );
          }}
        >
          <Toolbar>
            <Toolbar.Button
              text={formatMessage({ id: 'workspace.header.create' })}
              icon={PlusOutlined}
              onClick={() => {
                tableContext.setIndexes(tableContext.indexes.concat(defaultIndex));
              }}
            />

            <Toolbar.Button
              text={
                formatMessage({ id: 'odc.CreateTable.TableIndex.Delete' }) //删除
              }
              icon={DeleteOutlined}
              onClick={() => {
                let newRows = [...rows]?.filter((row, index) => {
                  return !selectedRowsIdx?.includes(index);
                });
                tableContext.setIndexes(removeGridParams(newRows));
              }}
            />

            {pageContext?.editMode && (
              <Toolbar.Button
                icon={<SyncOutlined />}
                text={formatMessage({
                  id: 'odc.components.ShowTableBaseInfoForm.Refresh',
                })}
                /* 刷新 */ onClick={pageContext.onRefresh}
              />
            )}
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
          tableContext.setIndexes(removeGridParams(newRows));
          console.log('set new Indexes');
        }}
      />
    </TableCardLayout>
  );
};

export default TableIndex;
