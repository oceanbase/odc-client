import { CsvColumnMapping } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { isNil } from 'lodash';
import React from 'react';
import DisplayTable from '../DisplayTable';

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
