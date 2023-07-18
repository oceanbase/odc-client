import DisplayTable from '@/component/DisplayTable';
import React from 'react';

const columns = [
  {
    dataIndex: 'tableName',
    title: '表名',
    ellipsis: true,
    width: 190,
  },
  {
    dataIndex: 'conditionExpression',
    title: '过滤条件',
    ellipsis: true,
    width: 150,
  },
];

const ArchiveRange: React.FC<{
  tables: {
    conditionExpression: string;
    tableName: string;
  }[];
}> = (props) => {
  const { tables } = props;
  return (
    <DisplayTable
      rowKey="id"
      columns={columns}
      dataSource={tables}
      scroll={null}
      disablePagination
    />
  );
};

export default ArchiveRange;
