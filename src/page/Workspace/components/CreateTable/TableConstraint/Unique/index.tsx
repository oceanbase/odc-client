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

import Toolbar from '@/component/Toolbar';
import { TableConstraintDefer } from '@/d.ts/table';
import { formatMessage } from '@/util/intl';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { DataGridRef } from '@oceanbase-odc/ob-react-data-grid';
import { clone } from 'lodash';
import React, { useContext, useMemo, useRef, useState, useEffect } from 'react';
import { generateUniqKey } from '@/util/utils';
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
  const gridColumns: any[] = useColumns(
    tableContext.columns,
    tableContext?.session?.connection?.dialectType,
  );
  const gridRef = useRef<DataGridRef>();
  const rows = useMemo(() => {
    return tableContext.uniqueConstraints.map((index, idx) => {
      return {
        ...index,
        key: `${index.name || ''}@@${idx}`,
      };
    });
  }, [tableContext.uniqueConstraints]);

  useEffect(() => {
    gridRef.current?.setRows(rows);
  }, [rows]);

  useEffect(() => {
    gridRef.current?.setColumns(gridColumns);
  }, [gridColumns]);

  return (
    <TableCardLayout
      toolbar={
        <EditToolbar modified={modified}>
          <Toolbar>
            <Toolbar.Button
              text={formatMessage({ id: 'workspace.header.create' })}
              icon={PlusOutlined}
              onClick={() => {
                const row = {
                  ...defaultUniqueConstraints,
                  key: generateUniqKey(),
                  _created: true,
                };
                gridRef.current?.addRows([row]);
              }}
            />

            <Toolbar.Button
              text={
                formatMessage({ id: 'odc.TableConstraint.Unique.Delete' }) //删除
              }
              icon={DeleteOutlined}
              disabled={!selectedRowsIdx?.length}
              onClick={() => {
                gridRef.current?.deleteRows();
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
          tableContext.setUniqueConstraints(removeGridParams(newRows));
        }}
      />
    </TableCardLayout>
  );
};

export default UniqueConstraints;
