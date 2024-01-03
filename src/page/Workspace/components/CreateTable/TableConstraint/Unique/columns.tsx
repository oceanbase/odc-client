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

import { ConnectionMode } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Column } from '@oceanbase-odc/ob-react-data-grid';
import { uniq } from 'lodash';
import { useMemo } from 'react';
import { WrapSelectEditor } from '../../../EditableTable/Editors/SelectEditor';
import { TextEditor } from '../../../EditableTable/Editors/TextEditor';
import { TableColumn, TableUniqueConstraint } from '../../interface';
import { useDeferColumn, useEnableColumn } from '../baseColumn';

export function useColumns(
  columns: TableColumn[],
  mode: ConnectionMode,
): Column<TableUniqueConstraint, TableUniqueConstraint>[] {
  const enableColumn = useEnableColumn(mode);
  const deferColumn = useDeferColumn(mode);
  const validColumns = useMemo(() => {
    return uniq(columns?.filter((column) => !!column.name?.trim()).map((column) => column.name));
  }, [columns]);
  const ColumnsMultipleSelect = useMemo(() => {
    return WrapSelectEditor(validColumns);
  }, [columns]);
  return [
    {
      key: 'name',
      name: formatMessage({
        id: 'odc.CreateTable.Columns.columns.Name',
      }), //名称
      resizable: true,
      editable: true,
      editor: TextEditor,
    },

    {
      key: 'columns',
      name: formatMessage({ id: 'odc.TableConstraint.Unique.columns.Column' }), //列
      resizable: true,
      filterable: false,
      editable: true,
      editor: ColumnsMultipleSelect,
      formatter: ({ row }) => {
        return <span>{row.columns?.join?.(',')}</span>;
      },
    },

    enableColumn,
    deferColumn,
  ].filter(Boolean);
}
