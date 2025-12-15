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

import { formatMessage } from '@/util/intl';
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
            <Toolbar.Button
              icon={<PlusOutlined />}
              text={formatMessage({
                id: 'src.page.Workspace.components.MaterializedViewPage.Constraints.12B20B8D',
                defaultMessage: '暂不支持',
              })}
              disabled
            />
            <Toolbar.Button
              icon={<DeleteOutlined />}
              text={formatMessage({
                id: 'src.page.Workspace.components.MaterializedViewPage.Constraints.7EB7A258',
                defaultMessage: '暂不支持',
              })}
              disabled
            />
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
