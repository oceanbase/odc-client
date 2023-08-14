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
import { TextEditor } from '../../../EditableTable/Editors/TextEditor';
import { TableCheckConstraint } from '../../interface';
import { useDeferColumn, useEnableColumn } from '../baseColumn';

export function useColumns(
  mode: ConnectionMode,
): Column<TableCheckConstraint, TableCheckConstraint>[] {
  const enableColumn = useEnableColumn(mode);
  const deferColumn = useDeferColumn(mode);
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
      key: 'check',
      name: formatMessage({
        id: 'odc.TableConstraint.Check.columns.CheckConditions',
      }), //检查条件
      resizable: true,
      filterable: false,
      editable: true,
      editor: TextEditor,
    },

    enableColumn,
    deferColumn,
  ].filter(Boolean);
}
