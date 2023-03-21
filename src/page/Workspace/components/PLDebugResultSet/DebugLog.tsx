import DisplayTable from '@/component/DisplayTable';
import { ILogType } from '@/d.ts';
import { Debug } from '@/store/debug';
import { formatMessage } from '@/util/intl';
import { CloseCircleOutlined, ExclamationCircleFilled, InfoCircleFilled } from '@ant-design/icons';
import { Empty } from 'antd';
import moment from 'moment';
import React from 'react';

interface IProps {
  debug: Debug;
}

const DebugLog: React.FC<IProps> = (props) => {
  const { debug } = props;
  const executeRecordColumns = [
    {
      dataIndex: 'logType',
      width: 60,
      title: formatMessage({
        id: 'odc.components.PLDebugResultSet.State',
      }),
      render(type) {
        const iconMap = {
          [ILogType.INFO]: <InfoCircleFilled style={{ color: '#1890ff' }} />,
          [ILogType.WARN]: <ExclamationCircleFilled style={{ color: '#faad14' }} />,
          [ILogType.ERROR]: <CloseCircleOutlined style={{ color: '#f5222d' }} />,
        };
        return iconMap[type] || iconMap.INFO;
      },
    },
    {
      dataIndex: 'time',
      title: formatMessage({
        id: 'odc.components.PLDebugResultSet.Time',
      }),
      render(value) {
        return moment(value - 0).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      dataIndex: 'log',
      title: formatMessage({
        id: 'odc.components.PLDebugResultSet.Results',
      }),
      render(t, _) {
        return <span style={{ wordBreak: 'break-all' }}>{t}</span>;
      },
    },
  ];
  const logs = debug?.history.records;
  if (!logs?.length) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  return (
    <DisplayTable
      rowKey="key"
      bordered={true}
      columns={executeRecordColumns}
      dataSource={logs}
      disablePagination={true}
    />
  );
};

export default DebugLog;
