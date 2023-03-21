import DisplayTable from '@/component/DisplayTable';
import { Debug } from '@/store/debug';
import { formatMessage } from '@/util/intl';
import { Empty } from 'antd';
import React from 'react';

interface IProps {
  debug: Debug;
}

const DebugVariables: React.FC<IProps> = (props) => {
  const { debug } = props;
  const executeRecordColumns = [
    {
      dataIndex: 'name',
      title: formatMessage({
        id: 'odc.components.PLDebugResultSet.VariableName',
      }),
    },

    {
      dataIndex: 'value',
      title: formatMessage({
        id: 'odc.components.PLDebugResultSet.Value',
      }),
    },
  ];
  const variables = debug?.contextVariables;
  if (!variables?.length) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }
  return (
    <DisplayTable
      rowKey="frameNum"
      bordered={true}
      columns={executeRecordColumns}
      dataSource={variables}
      disablePagination={true}
    />
  );
};

export default DebugVariables;
