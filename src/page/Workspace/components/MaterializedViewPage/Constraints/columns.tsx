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

import {
  TableColumn,
  TablePrimaryConstraint,
} from '@/page/Workspace/components/CreateTable/interface';
import { ConnectionMode } from '@/d.ts';
import { formatMessage } from '@/util/intl';

export function useColumns(columns: TableColumn[], mode: ConnectionMode) {
  return [
    {
      key: 'name',
      name: formatMessage({
        id: 'src.page.Workspace.components.MaterializedViewPage.Constraints.C0B77838',
        defaultMessage: '主键约束名称',
      }), //名称
      resizable: true,
    },

    {
      key: 'columns',
      name: formatMessage({
        id: 'odc.TableConstraint.Primary.columns.Column',
        defaultMessage: '列',
      }), //列
      resizable: true,
      filterable: false,
      formatter: ({ row }) => {
        return <span>{row.columns?.join?.(',')}</span>;
      },
    },
  ];
}
