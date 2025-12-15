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

export function useColumns() {
  const columns = [
    {
      key: 'name',
      name: formatMessage({
        id: 'src.page.Workspace.components.MaterializedViewPage.Columns.81E9C43F',
        defaultMessage: '列名称',
      }),
      resizable: true,
    },

    {
      key: 'type',
      name: formatMessage({
        id: 'workspace.window.createTable.column.dataType',
        defaultMessage: '数据类型',
      }),
      resizable: true,
      filterable: false,
    },

    {
      key: 'comment',
      name: formatMessage({
        id: 'src.page.Workspace.components.MaterializedViewPage.Columns.60269134',
        defaultMessage: '列注释',
      }),
      resizable: true,
      filterable: false,
    },
  ].filter(Boolean);
  return columns;
}
