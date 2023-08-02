import DisplayTable from '@/component/DisplayTable';
import { formatMessage } from '@/util/intl';
import React from 'react';

const columns = [
  {
    dataIndex: 'name',
    title: formatMessage({ id: 'odc.DataClearTask.DetailContent.VariableConfig.VariableName' }), //变量名
    ellipsis: true,
    width: 190,
    render: (name) => name || '-',
  },
  {
    dataIndex: 'format',
    title: formatMessage({ id: 'odc.DataClearTask.DetailContent.VariableConfig.TimeFormat' }), //时间格式
    ellipsis: true,
    width: 150,
    render: (name) => name || '-',
  },
  {
    dataIndex: 'opration',
    title: formatMessage({ id: 'odc.DataClearTask.DetailContent.VariableConfig.TimeOperation' }), //时间运算
    width: 160,
    render: (name) => name || '-',
  },
];

const VariableConfig: React.FC<{
  variables: {
    name: string;
    pattern: string;
  }[];
}> = (props) => {
  const { variables } = props;
  const dataSource = variables?.map(({ name, pattern }) => {
    const [format, opration] = pattern?.split('|');
    return {
      name,
      format,
      opration,
    };
  });

  return (
    <DisplayTable
      rowKey="id"
      columns={columns}
      dataSource={dataSource}
      scroll={null}
      disablePagination
    />
  );
};

export default VariableConfig;
