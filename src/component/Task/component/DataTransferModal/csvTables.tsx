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

import { CsvColumnMapping } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { isNil } from 'lodash';
import React from 'react';
import DisplayTable from '../../../DisplayTable';

interface ICsvTableProps {
  data: CsvColumnMapping[];
}

function getCsvColumns() {
  return [
    {
      title: formatMessage({
        id: 'odc.component.TaskDetailDrawer.csvTables.OriginalField',
      }),
      dataIndex: 'srcColumnName',
      width: 210,
    },

    {
      title: formatMessage({
        id: 'odc.component.TaskDetailDrawer.csvTables.FirstLineValue',
      }),
      dataIndex: 'firstLineValue',
      width: 160,
      ellipsis: true,
      render(t) {
        if (t === '') {
          return formatMessage({ id: 'odc.ImportDrawer.csvMapping.Null' }); // (空)
        } else if (isNil(t)) {
          return '(null)';
        }
        return t;
      },
    },

    {
      title: formatMessage({
        id: 'odc.component.TaskDetailDrawer.csvTables.TargetField',
      }),
      dataIndex: 'destColumnName',
      width: 160,
    },

    {
      title: formatMessage({
        id: 'odc.component.TaskDetailDrawer.csvTables.TargetFieldType',
      }),
      dataIndex: 'destColumnType',
      width: 160,
    },
  ];
}

const CsvTable: React.FC<ICsvTableProps> = function (props) {
  const csvColumns = getCsvColumns();
  console.log('[CsvTable.csvColumns]', csvColumns);
  console.log('[CsvTable.dataSource]', props.data);
  return (
    <div>
      <div className="o-tableHeader">
        {formatMessage({
          id: 'odc.component.TaskDetailDrawer.csvTables.FieldMapping',
        })}
      </div>
      <DisplayTable
        rowKey="destColumnName"
        bordered
        columns={csvColumns}
        dataSource={props.data}
        disablePagination
      />
    </div>
  );
};
export default CsvTable;
