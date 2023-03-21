import DisplayTable from '@/component/DisplayTable';
import ExecuteSQLModal from '@/component/ExecuteSQLModal';
import Toolbar from '@/component/Toolbar';
import { actionTypes, IDatabaseSession, ISqlExecuteResultStatus } from '@/d.ts';
import type { PageStore } from '@/store/page';
import type { SQLStore } from '@/store/sql';
import { formatMessage } from '@/util/intl';
import { sortNumber, sortString } from '@/util/utils';
import { BoxPlotOutlined, LogoutOutlined, SyncOutlined } from '@ant-design/icons';
import { Input, Layout, message, Spin } from 'antd';
import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import { FormattedMessage } from 'umi';
// @ts-ignore
import { getCloseDatabaseSessionSQL, getDatabaseSessionList } from '@/common/network/sessionParams';
import { executeSQL } from '@/common/network/sql';
import { WorkspaceAcess } from '@/component/Acess';
import { SchemaStore } from '@/store/schema';
import notification from '@/util/notification';
import styles from './index.less';

const ToolbarButton = Toolbar.Button;

const { Search } = Input;
const { Content } = Layout;

@inject('sqlStore', 'pageStore', 'schemaStore')
@observer
export default class SessionManagementPage extends Component<
  {
    sqlStore: SQLStore;
    schemaStore?: SchemaStore;
    pageStore: PageStore;
    pageKey: string;
  },
  {
    selectedRows: IDatabaseSession[];
    showExecuteSQLModal: boolean;
    searchKey: string;
    listLoading: boolean;
    updateDML: string;
    /**
     * 是否是查询会话
     */
    isQuery: boolean;
    sessionList: IDatabaseSession[];
  }
> {
  public readonly state = {
    selectedRows: [],
    showExecuteSQLModal: false,
    searchKey: '',
    listLoading: false,
    updateDML: '',
    isQuery: false,
    sessionList: [],
  };

  public componentDidMount() {
    this.getDatabaseSessionList();
  }

  public async getDatabaseSessionList() {
    this.setState({
      listLoading: true,
      selectedRows: [],
    });

    // 获取连接参数列表
    const data = await getDatabaseSessionList();
    this.setState({ listLoading: false, sessionList: data });
  }

  /**
   * 开始关闭会话
   */
  public handleCloseDatabaseSessions = async () => {
    const { selectedRows } = this.state;
    this.setState({ showExecuteSQLModal: true });

    const updateDML = (await getCloseDatabaseSessionSQL(selectedRows, 'SESSION')) || '';
    this.setState({ updateDML });
  };

  /**
   * 关闭会话查询
   */
  public handleCloseDatabaseSessionQuery = async () => {
    const { selectedRows } = this.state;
    this.setState({ showExecuteSQLModal: true });

    const updateDML = (await getCloseDatabaseSessionSQL(selectedRows, 'QUERY')) || '';
    this.setState({ updateDML, isQuery: true });
  };

  public handleExecuteUpdateDML = async () => {
    const { sqlStore } = this.props;
    const { updateDML, isQuery } = this.state;

    // 执行 DML
    const result = await executeSQL(updateDML);

    if (result?.[0]?.status === ISqlExecuteResultStatus.SUCCESS) {
      // 刷新
      await this.getDatabaseSessionList();
      this.setState({
        showExecuteSQLModal: false,
        selectedRows: [],
      });

      message.success(
        isQuery
          ? formatMessage({
              id: 'odc.components.SessionManagementPage.TheQueryIsClosed',
            })
          : // 关闭查询成功
            formatMessage({
              id: 'workspace.window.session.management.sql.execute.success',
            }),
      );
    } else {
      notification.error({
        track: result?.[0]?.track || 'Empty Error Log!',
        requestId: result?.[0]?.requestId,
      });
    }

    this.setState({ isQuery: false });
  };

  public handleRefresh = () => {
    this.getDatabaseSessionList();
  };

  public handleSearch = (searchKey: string) => {
    this.setState({ searchKey });
  };

  public render() {
    const { schemaStore } = this.props;
    const { showExecuteSQLModal, searchKey, selectedRows, listLoading, updateDML, sessionList } =
      this.state;

    const columns = [
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

    return (
      <>
        <Content style={{ position: 'relative' }}>
          <Spin spinning={listLoading}>
            <Toolbar>
              <div className="tools-left">
                <WorkspaceAcess action={actionTypes.update}>
                  <>
                    {schemaStore.enableKillSession && (
                      <ToolbarButton
                        isShowText
                        disabled={!selectedRows.length}
                        text={
                          <FormattedMessage id="workspace.window.session.button.closeSession" />
                        }
                        icon={<LogoutOutlined style={{ fontSize: 14 }} />}
                        onClick={this.handleCloseDatabaseSessions}
                      />
                    )}

                    {schemaStore.enableKillQuery && (
                      <ToolbarButton
                        isShowText
                        disabled={!selectedRows.length}
                        text={
                          formatMessage({
                            id: 'odc.components.SessionManagementPage.CloseQuery',
                          }) //关闭查询
                        }
                        icon={<BoxPlotOutlined />}
                        onClick={this.handleCloseDatabaseSessionQuery}
                      />
                    )}
                  </>
                </WorkspaceAcess>
              </div>
              <div className="tools-right">
                <Search
                  allowClear={true}
                  placeholder={formatMessage({
                    id: 'workspace.window.session.button.search',
                  })}
                  onSearch={this.handleSearch}
                  onChange={(e) => this.handleSearch(e.target.value)}
                  size="small"
                  className={styles.search}
                />

                <ToolbarButton
                  text={<FormattedMessage id="workspace.window.session.button.refresh" />}
                  icon={<SyncOutlined />}
                  onClick={this.handleRefresh}
                />
              </div>
            </Toolbar>
            <div className={styles.table}>
              <DisplayTable
                rowKey="sessionId"
                bordered={true}
                tableLayout="auto"
                columns={columns}
                dataSource={filteredRows}
                rowSelection={{
                  selectedRowKeys: selectedRows.map((r: IDatabaseSession) => r.sessionId),
                  onChange: (selectedRowKeys: string[], rows: IDatabaseSession[]) => {
                    this.setState({ selectedRows: rows });
                  },
                }}
              />
            </div>
          </Spin>
        </Content>
        <ExecuteSQLModal
          sql={updateDML}
          visible={showExecuteSQLModal}
          onSave={this.handleExecuteUpdateDML}
          onCancel={() => this.setState({ showExecuteSQLModal: false, isQuery: false })}
          onChange={(sql) => this.setState({ updateDML: sql })}
        />
      </>
    );
  }
}
