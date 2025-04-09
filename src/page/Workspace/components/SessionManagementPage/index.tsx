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

import Toolbar from '@/component/Toolbar';
import { IDatabaseSession } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { groupBySessionId, sortNumber, sortString } from '@/util/utils';
import { SyncOutlined } from '@ant-design/icons';
import { Input, Layout, message, Space, Spin, Tooltip, Typography } from 'antd';
import { inject, observer } from 'mobx-react';
import { useContext, useEffect, useState } from 'react';
// @ts-ignore
import { getDataSourceModeConfig } from '@/common/datasource';
import { getDatabaseSessionList, killSessions } from '@/common/network/sessionParams';
import WorkSpacePageLoading from '@/component/Loading/WorkSpacePageLoading';
import MiniTable from '@/component/Table/MiniTable';
import { SessionManagerStore } from '@/store/sessionManager';
import { ColumnsType } from 'antd/es/table';
import classNames from 'classnames';
import SessionContextWrap from '../SessionContextWrap';
import SessionContext from '../SessionContextWrap/context';
import SessionSelect from '../SessionContextWrap/SessionSelect';
import styles from './index.less';

const ToolbarButton = Toolbar.Button;

const { Search } = Input;
const { Content } = Layout;

interface IProps {
  sessionManagerStore?: SessionManagerStore;
  defaultDatasouceId: number;
  showDatasource?: boolean;
  simpleHeader?: boolean;
}

function SessionManagementPage(props: IProps) {
  const [searchKey, setSearchKey] = useState('');
  const [selectedRows, setSelectedRows] = useState<IDatabaseSession[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [sessionList, setSessionList] = useState<IDatabaseSession[]>([]);
  const context = useContext(SessionContext);
  const session = context?.session;
  const config = getDataSourceModeConfig(session?.connection?.type);

  async function fetchDatabaseSessionList() {
    if (!session?.sessionId) {
      return;
    }
    setListLoading(true);
    setSelectedRows([]);

    // 获取连接参数列表
    const data = await getDatabaseSessionList(session?.sessionId);
    setListLoading(false);
    setSessionList(data);
  }

  useEffect(() => {
    fetchDatabaseSessionList();
  }, [session?.sessionId]);

  // 过滤搜索关键词
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

  const statusFilter = [...new Set(filteredRows?.map((item) => item.status) ?? [])]?.map(
    (item) => ({
      text: item,
      value: item,
    }),
  );

  const columns: ColumnsType<IDatabaseSession> = [
    {
      title: formatMessage({
        id: 'workspace.window.session.management.column.sessionId',
        defaultMessage: '会话 ID',
      }),

      dataIndex: 'sessionId',
      width: 105,
      sorter: (a: IDatabaseSession, b: IDatabaseSession) => sortNumber(a.sessionId, b.sessionId),
      sortDirections: ['descend', 'ascend'],
      render: (value) => {
        return <Tooltip title={value}>{value}</Tooltip>;
      },
    },

    {
      title: formatMessage({
        id: 'workspace.window.session.management.column.dbUser',
        defaultMessage: '用户',
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
        defaultMessage: '来源',
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
        defaultMessage: '数据库名',
      }),

      dataIndex: 'database',
      width: 120,
      sorter: (a: IDatabaseSession, b: IDatabaseSession) => sortString(a.database, b.database),
      sortDirections: ['descend', 'ascend'],
      render: (value) => {
        return <Tooltip title={value}>{value}</Tooltip>;
      },
    },

    {
      title: formatMessage({
        id: 'workspace.window.session.management.column.status',
        defaultMessage: '状态',
      }),

      dataIndex: 'status',
      width: 105,
      sorter: (a: IDatabaseSession, b: IDatabaseSession) => sortString(a.status, b.status),
      sortDirections: ['descend', 'ascend'],
      filters: statusFilter,
      onFilter: (value: string, record) => record.status === value,
    },

    {
      title: formatMessage({
        id: 'workspace.window.session.management.column.command',
        defaultMessage: '命令',
      }),

      dataIndex: 'command',
      width: 85,
      sorter: (a: IDatabaseSession, b: IDatabaseSession) => sortString(a.command, b.command),
      sortDirections: ['descend', 'ascend'],
    },

    {
      title: formatMessage({
        id: 'workspace.window.session.management.column.executeTime',
        defaultMessage: '执行时间(s)',
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
        defaultMessage: 'SQL',
      }),

      dataIndex: 'sql',
      sorter: (a: IDatabaseSession, b: IDatabaseSession) => sortString(a.sql, b.sql),
      sortDirections: ['descend', 'ascend'],
      ellipsis: true,
      render(val) {
        return (
          <Tooltip title={val}>
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
          </Tooltip>
        );
      },
    },
  ];

  if (config?.features?.supportOBProxy) {
    columns.push({
      title: formatMessage({
        id: 'workspace.window.session.management.column.obproxyIp',
        defaultMessage: 'OB Proxy',
      }),

      dataIndex: 'obproxyIp',
      width: 160,
      sorter: (a: IDatabaseSession, b: IDatabaseSession) => sortString(a.obproxyIp, b.obproxyIp),
      sortDirections: ['descend', 'ascend'],
    });
  }

  /**
   * 关闭会话查询
   */
  const kill = async (type: 'session' | 'query') => {
    const data = await killSessions(
      selectedRows?.map((i) => i.sessionId?.toString()),
      context.datasourceId,
      type,
    );
    if (data && !data?.find((item) => !item.killed)) {
      await fetchDatabaseSessionList();
      message.success(
        formatMessage({
          id: 'odc.components.SessionManagementPage.ClosedSuccessfully',
          defaultMessage: '关闭成功',
        }), //关闭成功
      );
      setSelectedRows([]);
    } else {
      message.error(
        data
          ?.map((item) => item.errorMessage)
          ?.filter(Boolean)
          ?.join('\n'),
      );
    }
  };

  const handleSearch = (searchKey: string) => {
    setSearchKey(searchKey);
  };
  const handleRefresh = () => {
    fetchDatabaseSessionList();
  };

  return (
    <>
      <Spin wrapperClassName={styles.wrap} spinning={listLoading}>
        <div className={classNames(styles.toolbar, { [styles.simpleHeader]: props.simpleHeader })}>
          <Toolbar style={{ borderBottom: 'none', height: props.simpleHeader ? 32 : 38 }}>
            <div
              style={{ paddingLeft: props.simpleHeader ? '0px' : '12px' }}
              className="tools-left"
            >
              <Space size={16}>
                {session?.supportFeature?.enableKillSession && (
                  <ToolbarButton
                    type="BUTTON"
                    disabled={!selectedRows.length}
                    text={formatMessage({
                      id: 'workspace.window.session.button.closeSession',
                      defaultMessage: '关闭会话',
                    })}
                    confirmConfig={{
                      title: formatMessage({
                        id: 'odc.components.SessionManagementPage.ConfirmToCloseTheSession',
                        defaultMessage: '确认关闭会话',
                      }), //确认关闭会话
                      onConfirm() {
                        kill('session');
                      },
                    }}
                  />
                )}

                {session?.supportFeature?.enableKillQuery && (
                  <ToolbarButton
                    type="BUTTON"
                    disabled={!selectedRows.length}
                    text={
                      formatMessage({
                        id: 'odc.components.SessionManagementPage.CloseQuery',
                        defaultMessage: '关闭查询',
                      }) //关闭查询
                    }
                    confirmConfig={{
                      title: formatMessage({
                        id: 'odc.components.SessionManagementPage.ConfirmToCloseTheQuery',
                        defaultMessage: '确认关闭查询',
                      }), //确认关闭查询
                      onConfirm() {
                        kill('query');
                      },
                    }}
                  />
                )}
              </Space>
            </div>
            <div className="tools-right">
              <Search
                allowClear={true}
                placeholder={formatMessage({
                  id: 'workspace.window.session.button.search',
                  defaultMessage: '搜索',
                })}
                onSearch={handleSearch}
                // onChange={(e) => handleSearch(e.target.value)}
                size="small"
                className={styles.search}
              />

              <ToolbarButton
                text={formatMessage({
                  id: 'workspace.window.session.button.refresh',
                  defaultMessage: '刷新',
                })}
                icon={<SyncOutlined />}
                onClick={handleRefresh}
              />
            </div>
          </Toolbar>
        </div>
        {props.showDatasource ? (
          <div className={styles.datasourceSelect}>
            <SessionSelect />
          </div>
        ) : null}
        <div className={styles.table}>
          <MiniTable
            rowKey={(record) => `${record.sessionId}_${record.svrIp}`}
            bordered={true}
            loading={listLoading}
            columns={columns}
            indentSize={0}
            dataSource={groupBySessionId(filteredRows)}
            loadData={(page) => {}}
            rowSelection={{
              checkStrictly: false,
              selectedRowKeys: selectedRows.map(
                (r: IDatabaseSession) => `${r.sessionId}_${r.svrIp}`,
              ),
              onChange: (selectedRowKeys: string[], rows: IDatabaseSession[]) => {
                setSelectedRows(rows);
              },
            }}
          />
        </div>
      </Spin>
    </>
  );
}
export default inject('sessionManagerStore')(
  observer(function SessionManage(props: IProps) {
    return (
      <SessionContextWrap
        defaultDatabaseId={null}
        datasourceMode
        defaultDatasourceId={props.defaultDatasouceId}
      >
        {({ session }) => {
          return session ? (
            <SessionManagementPage {...props} key={session?.sessionId} />
          ) : (
            <WorkSpacePageLoading />
          );
        }}
      </SessionContextWrap>
    );
  }),
);
