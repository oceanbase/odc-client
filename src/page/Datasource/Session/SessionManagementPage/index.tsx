import { getDatabaseSessionList } from '@/common/network/sessionParams';
import Reload from '@/component/Button/Reload';
import MiniTable from '@/component/Table/MiniTable';
import TableCard from '@/component/Table/TableCard';
import { IDatabaseSession } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { sortNumber, sortString } from '@/util/utils';
import { useRequest } from 'ahooks';
import { Button, Input, Space } from 'antd';
import { ColumnType } from 'antd/es/table';
import { useState } from 'react';
import styles from './index.less';

const { Search } = Input;

interface IProps {
  dataSourceId: string;
}

export default function SessionManager({ dataSourceId }: IProps) {
  const [selectedRows, setSelectedRows] = useState<IDatabaseSession[]>([]);

  const [searchKey, setSearchKey] = useState<string>(null);

  const {
    data: sessionList,
    loading,
    run,
  } = useRequest(getDatabaseSessionList, {
    manual: true,
  });

  const columns: ColumnType<any>[] = [
    {
      title: formatMessage({
        id: 'workspace.window.session.management.column.sessionId',
      }),

      dataIndex: 'sessionId',
      width: 105,
      sorter: (a: IDatabaseSession, b: IDatabaseSession) => sortNumber(a.sessionId, b.sessionId),
      sortDirections: ['descend', 'ascend'],
    },

    {
      title: formatMessage({
        id: 'workspace.window.session.management.column.dbUser',
      }),

      dataIndex: 'dbUser',
      width: 65,
      sorter: (a: IDatabaseSession, b: IDatabaseSession) => sortString(a.dbUser, b.dbUser),
      sortDirections: ['descend', 'ascend'],
      ellipsis: true,
    },

    {
      title: formatMessage({
        id: 'workspace.window.session.management.column.srcIp',
      }),

      dataIndex: 'srcIp',
      width: 165,
      sorter: (a: IDatabaseSession, b: IDatabaseSession) => sortString(a.srcIp, b.srcIp),
      sortDirections: ['descend', 'ascend'],
      ellipsis: true,
    },

    {
      title: formatMessage({
        id: 'workspace.window.session.management.column.database',
      }),

      dataIndex: 'database',
      width: 120,
      sorter: (a: IDatabaseSession, b: IDatabaseSession) => sortString(a.database, b.database),
      sortDirections: ['descend', 'ascend'],
    },

    {
      title: formatMessage({
        id: 'workspace.window.session.management.column.status',
      }),

      dataIndex: 'status',
      width: 65,
      sorter: (a: IDatabaseSession, b: IDatabaseSession) => sortString(a.status, b.status),
      sortDirections: ['descend', 'ascend'],
    },

    {
      title: formatMessage({
        id: 'workspace.window.session.management.column.command',
      }),

      dataIndex: 'command',
      width: 85,
      sorter: (a: IDatabaseSession, b: IDatabaseSession) => sortString(a.command, b.command),
      sortDirections: ['descend', 'ascend'],
    },

    {
      title: formatMessage({
        id: 'workspace.window.session.management.column.executeTime',
      }),

      dataIndex: 'executeTime',
      width: 135,
      sorter: (a: IDatabaseSession, b: IDatabaseSession) =>
        sortNumber(a.executeTime, b.executeTime),
      sortDirections: ['descend', 'ascend'],
    },

    {
      title: formatMessage({
        id: 'workspace.window.session.management.column.sql',
      }),

      dataIndex: 'sql',
      sorter: (a: IDatabaseSession, b: IDatabaseSession) => sortString(a.sql, b.sql),
      sortDirections: ['descend', 'ascend'],
      ellipsis: true,
      render(val) {
        return (
          <div
            title={val}
            style={{
              maxWidth: '165px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {val}
          </div>
        );
      },
    },

    {
      title: formatMessage({
        id: 'workspace.window.session.management.column.obproxyIp',
      }),

      dataIndex: 'obproxyIp',
      width: 160,
      sorter: (a: IDatabaseSession, b: IDatabaseSession) => sortString(a.obproxyIp, b.obproxyIp),
      sortDirections: ['descend', 'ascend'],
    },
  ];

  const filteredRows = sessionList?.filter((session) =>
    [
      `${session.sessionId}`,
      session.dbUser,
      session.database,
      session.command,
      session.srcIp,
      session.status,
      session.obproxyIp,
      session.sql,
    ].some((s) => s && s.toLowerCase().indexOf(searchKey.toLowerCase()) > -1),
  );

  return (
    <TableCard
      title={
        <Space>
          <Button disabled={selectedRows?.length === 0}>关闭会话</Button>
          <Button disabled={selectedRows?.length === 0}>关闭查询</Button>
        </Space>
      }
      extra={
        <Space>
          <Search
            allowClear={true}
            placeholder={formatMessage({
              id: 'workspace.window.session.button.search',
            })}
            onSearch={(value) => {
              setSearchKey(value);
            }}
            onChange={(e) => setSearchKey(e.target.value)}
            size="small"
            className={styles.search}
          />
          <Reload
            onClick={() => {
              run(dataSourceId);
              setSelectedRows([]);
            }}
          />
        </Space>
      }
    >
      <MiniTable
        rowKey={'sessionId'}
        loading={loading}
        columns={columns}
        dataSource={filteredRows}
        loadData={(page) => {
          run(dataSourceId);
        }}
        rowSelection={{
          selectedRowKeys: selectedRows.map((r: IDatabaseSession) => r.sessionId),
          onChange: (selectedRowKeys: string[], rows: IDatabaseSession[]) => {
            setSelectedRows(rows);
          },
        }}
      />
    </TableCard>
  );
}
