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

import React, { useContext, useRef, useEffect, useMemo } from 'react';
import MaterializedViewPageContext from '../context';
import EditableTable from '@/page/Workspace/components/EditableTable';
import { DataGridRef } from '@oceanbase-odc/ob-react-data-grid';
import { useColumns } from './columns';
import TableCardLayout from '@/page/Workspace/components/CreateTable/TableCardLayout';
import { isNil } from 'lodash';
import Toolbar from '@/component/Toolbar';
import EditToolbar from '@/page/Workspace/components/CreateTable/EditToolbar';
import { SyncOutlined } from '@ant-design/icons';

interface IProps {}
const MvViewColumns: React.FC<IProps> = () => {
  const { materializedView, session, onRefresh, pageKey } = useContext(MaterializedViewPageContext);
  const gridRef = useRef<DataGridRef>();
  const gridColumns = useColumns();

  useEffect(() => {
    gridRef.current?.setColumns?.(gridColumns ?? []);
  }, [gridColumns]);

  const rows = useMemo(() => {
    return materializedView?.columns?.map((column, idx) => {
      return {
        ...column,
        key: isNil(column.ordinalPosition)
          ? `${column.name || ''}@@${idx}`
          : column.ordinalPosition,
      };
    });
  }, [materializedView.columns]);

  return (
    <TableCardLayout
      toolbar={
        <EditToolbar modified={false}>
          <Toolbar>
            <Toolbar.Button icon={<SyncOutlined />} onClick={onRefresh} />
          </Toolbar>
        </EditToolbar>
      }
    >
      <EditableTable
        readonly
        bordered={false}
        minHeight="100%"
        initialColumns={gridColumns}
        enableFilterRow
        enableFlushDelete
        initialRows={rows as any[]}
        rowKey={'key'}
        enableSortRow={false}
        enableColumnRecord={false}
        gridRef={gridRef}
      />
    </TableCardLayout>
  );
};

export default MvViewColumns;
