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

import { generateUpdateTableDDL } from '@/common/network/table';
import Toolbar from '@/component/Toolbar';
import { formatMessage } from '@/util/intl';
import { DeleteOutlined, PlusOutlined, SyncOutlined } from '@ant-design/icons';
import { DataGridRef } from '@oceanbase-odc/ob-react-data-grid';
import { clone, cloneDeep } from 'lodash';
import React, { useContext, useMemo, useRef, useState, useEffect } from 'react';
import { generateUniqKey } from '@/util/utils';
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
  const session = tableContext.session;
  const [selectedRowsIdx, setSelectedRowIdx] = useState<number[]>([]);
  const gridColumns: any[] = useColumns(tableContext.columns, session?.connection);
  const gridRef = useRef<DataGridRef>();
  const rows = useMemo(() => {
    return tableContext.indexes.map((index, idx) => {
      return {
        ...index,
        key: `${index.name || ''}@@${idx}`,
      };
    });
  }, [tableContext.indexes]);

  useEffect(() => {
    gridRef.current?.setRows?.(rows ?? []);
  }, [rows]);

  useEffect(() => {
    gridRef.current?.setColumns?.(gridColumns ?? []);
  }, [gridColumns]);

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
            const { sql: updateTableDML, tip } = await generateUpdateTableDDL(
              {
                ...pageContext.table,
                indexes: newData,
              },

              pageContext.table,

              session?.sessionId,
              session?.database.dbName,
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
              tip,
            );
          }}
        >
          <Toolbar>
            <Toolbar.Button
              text={formatMessage({ id: 'workspace.header.create' })}
              icon={PlusOutlined}
              onClick={() => {
                const row = {
                  ...defaultIndex,
                  key: generateUniqKey(),
                };
                gridRef.current?.addRows([row]);
              }}
            />

            <Toolbar.Button
              text={
                formatMessage({ id: 'odc.CreateTable.TableIndex.Delete' }) //删除
              }
              icon={DeleteOutlined}
              onClick={() => {
                gridRef.current?.deleteRows();
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
          tableContext.setIndexes(removeGridParams(newRows));
          console.log('set new Indexes');
        }}
      />
    </TableCardLayout>
  );
};

export default TableIndex;
