/*
 * Copyright 2024 OceanBase
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

import { getTableColumnList, getTableListByDatabaseName } from '@/common/network/table';
import { ConnectionMode, ITable, ITableColumn } from '@/d.ts';
import { IDatabase } from '@/d.ts/database';
import {
  TableForeignConstraintOnDeleteType,
  TableForeignConstraintOnUpdateType,
} from '@/d.ts/table';
import { formatMessage } from '@/util/intl';
import { Column } from '@oceanbase-odc/ob-react-data-grid';
import { useRequest } from 'ahooks';
import { uniq } from 'lodash';
import { useContext, useEffect, useMemo, useState } from 'react';
import { SelectEditor, WrapSelectEditor } from '../../../EditableTable/Editors/SelectEditor';
import { TextEditor } from '../../../EditableTable/Editors/TextEditor';
import { TableColumn, TableForeignConstraint } from '../../interface';
import TableContext from '../../TableContext';
import { useDeferColumn, useEnableColumnForeign } from '../baseColumn';

function TableSelect(props) {
  const { row } = props;
  const schemaname = row['schemaname'];
  const tableContext = useContext(TableContext);
  const [tableList, setTableList] = useState<ITable[]>([]);
  const { loading, run: _fetchTable } = useRequest(getTableListByDatabaseName, {
    manual: true,
  });

  const fetchTable = async () => {
    if (!tableContext?.session?.sessionId) {
      return;
    }
    const list = await _fetchTable(tableContext?.session?.sessionId, schemaname);
    setTableList(list);
  };
  useEffect(() => {
    if (schemaname) {
      fetchTable();
    } else {
      setTableList([]);
    }
  }, [schemaname, tableContext?.session]);
  return (
    <SelectEditor
      loading={loading}
      multiple={false}
      options={tableList?.map((t) => t.tableName)}
      {...props}
    />
  );
}

function ColumnSelect(props) {
  const { row } = props;
  const tableName = row['tableName'];
  const tableContext = useContext(TableContext);
  const [columnList, setColumnList] = useState<ITableColumn[]>([]);
  const { loading, run: _fetchTable } = useRequest(getTableColumnList, {
    manual: true,
  });

  const fetchColumns = async () => {
    const sessionId = tableContext?.session?.sessionId;
    if (!sessionId) {
      return;
    }
    const list = await _fetchTable(tableName, row['schemaname'], sessionId);
    setColumnList(list);
  };
  useEffect(() => {
    if (tableName) {
      fetchColumns();
    } else {
      setColumnList([]);
    }
  }, [tableName, tableContext?.session]);
  return (
    <SelectEditor
      loading={loading}
      multiple={false}
      options={columnList?.map((t) => t.columnName)}
      {...props}
    />
  );
}

export function useColumns(
  columns: TableColumn[],
  databases: IDatabase[],
  mode: ConnectionMode,
): Column<TableForeignConstraint, TableForeignConstraint>[] {
  const enableColumn = useEnableColumnForeign(mode);
  const deferColumn = useDeferColumn(mode);
  const validColumns = useMemo(() => {
    return uniq(columns?.filter((column) => !!column.name?.trim()).map((column) => column.name));
  }, [columns]);
  const ColumnsMultipleSelect = useMemo(() => {
    return WrapSelectEditor(validColumns);
  }, [columns]);
  const schemaSelect = useMemo(() => {
    return WrapSelectEditor(
      databases.map((d) => d.name),
      false,
    );
  }, [databases]);

  const onDeleteSelect = useMemo(() => {
    return WrapSelectEditor(
      [
        TableForeignConstraintOnDeleteType.CASCADE,
        TableForeignConstraintOnDeleteType.NO_ACTION,
        TableForeignConstraintOnDeleteType.RESTRICT,
        TableForeignConstraintOnDeleteType.SET_NULL,
      ],

      false,
    );
  }, []);
  const onUpdateSelect = useMemo(() => {
    return WrapSelectEditor(
      [
        TableForeignConstraintOnUpdateType.CASCADE,
        TableForeignConstraintOnUpdateType.NO_ACTION,
        TableForeignConstraintOnUpdateType.RESTRICT,
        TableForeignConstraintOnUpdateType.SET_NULL,
      ],

      false,
    );
  }, []);
  return [
    {
      key: 'name',
      name: formatMessage({
        id: 'odc.CreateTable.Columns.columns.Name',
      }),
      //名称
      resizable: true,
      editable: true,
      editor: TextEditor,
      width: 120,
    },

    {
      key: 'columns',
      name: formatMessage({ id: 'odc.TableConstraint.Foreign.columns.Column' }), //列
      resizable: true,
      minWidth: 150,
      filterable: false,
      editable: true,
      editor: ColumnsMultipleSelect,
      formatter: ({ row }) => {
        return <span>{row.columns?.join?.(',')}</span>;
      },
    },

    {
      key: 'schemaname',
      name: formatMessage({
        id: 'odc.TableConstraint.Foreign.columns.AssociatedSchema',
      }),
      //关联 Schema
      resizable: true,
      editable: true,
      editor: schemaSelect,
      width: 150,
    },

    {
      key: 'tableName',
      name: formatMessage({
        id: 'odc.TableConstraint.Foreign.columns.AssociatedTable',
      }),
      //关联表
      resizable: true,
      editable: true,
      editor: TableSelect,
      width: 150,
    },

    {
      key: 'parentColumns',
      name: formatMessage({
        id: 'odc.TableConstraint.Foreign.columns.AssociatedColumn',
      }), //关联列
      resizable: true,
      editable: true,
      editor: ColumnSelect,
      width: 150,
    },

    {
      key: 'onDelete',
      name: formatMessage({ id: 'odc.TableConstraint.Foreign.columns.Delete' }), //删除
      resizable: true,
      editable: true,
      editor: onDeleteSelect,
      width: 120,
    },

    {
      key: 'onUpdate',
      name: formatMessage({ id: 'odc.TableConstraint.Foreign.columns.Update' }), //更新
      resizable: true,
      editable: true,
      editor: onUpdateSelect,
      width: 120,
    },

    enableColumn,
    deferColumn,
  ].filter(Boolean);
}
