import {
  getDeleteSQL,
  getPurgeAllSQL,
  getRecycleConfig,
  getUpdateSQL,
  updateRecycleConfig,
} from '@/common/network/recycle';
import { executeSQL } from '@/common/network/sql';
import { actionTypes, WorkspaceAcess } from '@/component/Acess';
import DisplayTable from '@/component/DisplayTable';
import ExecuteSQLModal from '@/component/ExecuteSQLModal';
import Toolbar from '@/component/Toolbar';
import { IRecycleConfig, IRecycleObject, ISqlExecuteResultStatus } from '@/d.ts';
import { PageStore } from '@/store/page';
import { SessionManagerStore } from '@/store/sessionManager';
import SessionStore from '@/store/sessionManager/session';
import { SQLStore } from '@/store/sql';
import notification from '@/util/notification';
import { sortString } from '@/util/utils';
import Icon, {
  ClearOutlined,
  DeleteOutlined,
  ExclamationCircleFilled,
  RedoOutlined,
  SettingOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Button, Drawer, Input, Layout, message, Modal, Spin } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { formatMessage, FormattedMessage } from 'umi';
import EditableTable from '../EditableTable';
import { TextEditor } from '../EditableTable/Editors/TextEditor';
import RecyleConfigContext from './context/RecyleConfigContext';
import styles from './index.less';
import RecycleConfig from './RecyleConfig';

const ToolbarButton = Toolbar.Button;

const { Search } = Input;
const { Content } = Layout;

@inject('sqlStore', 'sessionManagerStore', 'pageStore')
@observer
export default class RecycleBinPage extends Component<
  {
    sqlStore: SQLStore;
    sessionManagerStore: SessionManagerStore;
    pageStore: PageStore;
    pageKey: string;
    params: {
      cid: number;
      dbName: string;
    };
  },
  {
    showEditModal: boolean;
    showExecuteSQLModal: boolean;
    searchKey: string;
    listLoading: boolean;
    updateDML: string;
    selectedObjectNames: Set<string>;
    selectAll: boolean;
    showDeleteDrawer: boolean;
    showRestoreDrawer: boolean;
    recycleConfig: IRecycleConfig;
  }
> {
  public readonly state = {
    showEditModal: false,
    showExecuteSQLModal: false,
    searchKey: '',
    listLoading: false,
    updateDML: '',
    selectedObjectNames: new Set<string>(),
    selectAll: false,
    showDeleteDrawer: false,
    showRestoreDrawer: false,
    recycleConfig: null,
  };

  private session: SessionStore;

  public tableList: React.RefObject<HTMLDivElement> = React.createRef();

  public async componentDidMount() {
    if (await this.initSession()) {
      this.getRecycleObjectList();
      this.getRecycleConfig();
    }
  }

  public initSession = async () => {
    const { params, sessionManagerStore } = this.props;
    const session = await sessionManagerStore.createSession(null, params.cid);
    this.session = session;
    return !!session;
  };
  public getRecycleConfig = async () => {
    const setting = await getRecycleConfig(this.session?.sessionId);
    this.setState({
      recycleConfig: setting,
    });
  };
  public async getRecycleObjectList() {
    this.setState({ listLoading: true });
    await this.session.getRecycleObjectList();
    this.setState({ listLoading: false });
  }

  /**
   * 打开清空回收站确认框
   */
  public handleOpenPurgeAllModal = () => {
    Modal.confirm({
      icon: <ExclamationCircleFilled />,
      title: formatMessage({
        id: 'workspace.window.recyclebin.modal.purgeAll.title',
      }),

      content: formatMessage({
        id: 'workspace.window.recyclebin.modal.purgeAll.content',
      }),

      okText: formatMessage({
        id: 'workspace.window.recyclebin.button.purgeAll',
      }),

      cancelText: formatMessage({ id: 'app.button.cancel' }),
      okButtonProps: {
        danger: true,
        ghost: true,
      },

      onOk: this.handleSubmitPurgeAll,
    });
  };

  /**
   * 清空全部
   */
  public handleSubmitPurgeAll = async () => {
    this.setState({ showExecuteSQLModal: true });

    const updateDML = await getPurgeAllSQL(this.session.sessionId, this.session?.database?.dbName);
    // TODO: 获取修改对应的 SQL
    this.setState({ updateDML });
  };

  public handleDelete = async () => {
    const { selectedObjectNames } = this.state;

    const selectedObjects = this.session.recycleObjects.filter((r) =>
      selectedObjectNames.has(r.uniqueId),
    );

    this.setState({ showExecuteSQLModal: true });

    const updateDML = await getDeleteSQL(
      selectedObjects,
      this.session.sessionId,
      this.session?.database?.dbName,
    );
    this.setState({ updateDML });
  };

  public handleRestore = async () => {
    const { selectedObjectNames } = this.state;

    const selectedObjects = this.session.recycleObjects.filter((r) =>
      selectedObjectNames.has(r.uniqueId),
    );

    this.setState({ showExecuteSQLModal: true });

    const updateDML = await getUpdateSQL(
      selectedObjects,
      this.session.sessionId,
      this.session?.database?.dbName,
    );
    this.setState({ updateDML });
  };

  /**
   * 执行 SQL
   */
  public handleExecuteUpdateDML = async () => {
    const { sqlStore } = this.props;
    const { updateDML } = this.state;

    // 执行 DML
    const result = await executeSQL(
      updateDML,
      this.session?.sessionId,
      this.session?.database?.dbName,
    );

    if (result?.[0]?.status === ISqlExecuteResultStatus.SUCCESS) {
      // 刷新
      await this.session.getRecycleObjectList();
      // if (updateDML.toUpperCase().indexOf('FLASHBACK DATABASE') > -1) {
      //   /**
      //    * 重新刷新一下数据库
      //    */
      //   await this.session.getDatabaseList();
      // }

      // 关闭已打开的 drawer、modal
      this.setState({
        showExecuteSQLModal: false,
        showDeleteDrawer: false,
        showRestoreDrawer: false,
        updateDML: '',
        selectedObjectNames: new Set<string>(), // 清除掉当前选择的对象
      });

      message.success(formatMessage({ id: 'workspace.window.recyclebin.success' }));
    } else {
      notification.error(result?.[0]);
    }
  };

  /**
   * 在表格中编辑保存
   */
  public handleEditPropertyInCell = (newRows) => {
    this.session.updateRecycleObjectName(newRows);
    this.triggerTableLayout();
  };

  /**
   * 用户取消恢复回收站，需要恢复重命名
   */
  public handleCancelRestore = () => {
    this.session.resetNewNames();
    this.setState({ showRestoreDrawer: false });
  };

  public handleRefresh = () => {
    this.getRecycleObjectList();
    this.setState({
      selectedObjectNames: new Set<string>(),
    });
  };

  public handleSearch = (searchKey: string) => {
    this.setState({ searchKey });
  };

  public handleRowSelected = (ids: string[]) => {
    const { selectedObjectNames } = this.state;
    selectedObjectNames.clear();
    ids.forEach((id) => {
      selectedObjectNames.add(id);
    });
    this.setState({
      selectedObjectNames,
    });
  };

  public handleCancelAllSelected = (filteredRows: IRecycleObject[]) => {
    const { selectedObjectNames } = this.state;
    filteredRows?.forEach((row) => {
      if (selectedObjectNames.has(row.uniqueId)) {
        selectedObjectNames.delete(row.uniqueId);
      }
    });
    this.setState({
      selectedObjectNames,
    });
  };

  private changeSetting = async (config: Partial<IRecycleConfig>) => {
    const isSuccess = await updateRecycleConfig(config, this.session?.sessionId);
    if (isSuccess) {
      this.getRecycleConfig();
    }
    return isSuccess;
  };

  public render() {
    const {
      showDeleteDrawer,
      showRestoreDrawer,
      showExecuteSQLModal,
      searchKey,
      listLoading,
      updateDML,
      selectedObjectNames,
      recycleConfig,
    } = this.state;

    const columns = [
      {
        dataIndex: 'id',
        title: formatMessage({
          id: 'workspace.window.recyclebin.column.originName',
        }),

        sorter: (a: IRecycleObject, b: IRecycleObject) => sortString(a.id, b.id),
        sortDirections: ['descend', 'ascend'],
      },

      {
        dataIndex: 'objName',
        title: formatMessage({
          id: 'workspace.window.recyclebin.column.objName',
        }),
      },

      {
        dataIndex: 'objType',
        title: formatMessage({
          id: 'workspace.window.recyclebin.column.objType',
        }),
      },

      {
        dataIndex: 'createTime',
        title: formatMessage({
          id: 'workspace.window.recyclebin.column.createTime',
        }),
      },
    ];

    const columnsInDeleteDrawer = [
      {
        key: 'id',
        name: formatMessage({
          id: 'workspace.window.recyclebin.column.originName',
        }),

        editable: false,
        sortable: false,
      },
    ];

    const columnsInRestoreDrawer = [
      {
        key: 'id',
        name: formatMessage({
          id: 'workspace.window.recyclebin.column.originName',
        }),

        editable: false,
        sortable: false,
      },

      {
        key: 'objType',
        name: formatMessage({
          id: 'workspace.window.recyclebin.column.objType',
        }),

        editable: false,
        sortable: false,
      },

      {
        key: 'newName',
        name: formatMessage({
          id: 'workspace.window.recyclebin.column.newName',
        }),

        editor: TextEditor,
        editable: true,
        sortable: false,
      },
    ];

    // 当前选中的对象列表
    const selectedObjects = this.session?.recycleObjects.filter((r) =>
      selectedObjectNames.has(r.uniqueId),
    );

    // 查找原名称和对象名称，忽略大小写
    const filteredRows = this.session?.recycleObjects.filter(
      (p) =>
        (p.id && p.id.toLowerCase().indexOf(searchKey.toLowerCase()) > -1) ||
        (p.objName && p.objName.toLowerCase().indexOf(searchKey.toLowerCase()) > -1),
    );

    return (
      <>
        <Content style={{ position: 'relative' }}>
          <Spin spinning={listLoading}>
            <Toolbar>
              <div className="tools-left">
                <WorkspaceAcess action={actionTypes.delete}>
                  <>
                    <ToolbarButton
                      isShowText
                      disabled={!selectedObjectNames.size}
                      text={
                        formatMessage({
                          id: 'odc.components.RecycleBinPage.Delete',
                        }) //删除
                      }
                      icon={<DeleteOutlined />}
                      onClick={() => this.setState({ showDeleteDrawer: true })}
                    />

                    <ToolbarButton
                      isShowText
                      disabled={!selectedObjectNames.size}
                      text={<FormattedMessage id="workspace.window.recyclebin.button.restore" />}
                      icon={<RedoOutlined />}
                      onClick={() => this.setState({ showRestoreDrawer: true })}
                    />

                    <WorkspaceAcess action={actionTypes.delete}>
                      <ToolbarButton
                        isShowText
                        text={
                          formatMessage({
                            id: 'odc.components.RecycleBinPage.Clear',
                          }) //清空
                        }
                        icon={<Icon component={ClearOutlined} />}
                        onClick={this.handleOpenPurgeAllModal}
                      />
                    </WorkspaceAcess>
                  </>
                </WorkspaceAcess>
              </div>
              <div className="tools-right">
                <Search
                  allowClear
                  placeholder={formatMessage({
                    id: 'workspace.window.session.button.search',
                  })}
                  onSearch={this.handleSearch}
                  onChange={(e) => this.handleSearch(e.target.value)}
                  size="small"
                  style={{
                    height: 24,
                  }}
                  className={styles.search}
                />

                <RecyleConfigContext.Provider
                  value={{
                    setting: recycleConfig,
                    changeSetting: this.changeSetting,
                  }}
                >
                  <RecycleConfig>
                    <ToolbarButton
                      text={
                        formatMessage({
                          id: 'odc.components.RecycleBinPage.Settings',
                        })
                        //设置
                      }
                      icon={<SettingOutlined />}
                    />
                  </RecycleConfig>
                </RecyleConfigContext.Provider>
                <ToolbarButton
                  text={<FormattedMessage id="workspace.window.session.button.refresh" />}
                  icon={<SyncOutlined />}
                  onClick={this.handleRefresh}
                />
              </div>
            </Toolbar>
            <div className={styles.table}>
              <DisplayTable
                rowKey="uniqueId"
                bordered
                columns={columns}
                dataSource={filteredRows}
                rowSelection={{
                  selectedRowKeys: Array.from(selectedObjectNames),
                  onChange: (selectedRowKeys: string[], rows: IRecycleObject[]) => {
                    this.handleRowSelected(selectedRowKeys);
                  },
                  selections: [
                    {
                      key: 'all-data',
                      text: formatMessage({
                        id: 'odc.components.RecycleBinPage.SelectAllObjects',
                      }),
                      //选择所有对象
                      onSelect: () => {
                        this.handleRowSelected(filteredRows.map((row) => row.uniqueId));
                      },
                    },

                    {
                      key: 'cancel-all-data',
                      text: formatMessage({
                        id: 'odc.components.RecycleBinPage.CancelAllObjects',
                      }),
                      //取消所有对象
                      onSelect: () => {
                        this.handleCancelAllSelected(filteredRows);
                      },
                    },
                  ],
                }}
              />
            </div>
          </Spin>
        </Content>
        <ExecuteSQLModal
          sessionStore={this.session}
          sql={updateDML}
          visible={showExecuteSQLModal}
          onSave={this.handleExecuteUpdateDML}
          onCancel={() => this.setState({ showExecuteSQLModal: false, updateDML: '' })}
          onChange={(sql) => this.setState({ updateDML: sql })}
        />

        <Drawer
          title={formatMessage({
            id: 'workspace.window.recyclebin.drawer.delete.title',
          })}
          placement="right"
          closable
          onClose={() => this.setState({ showDeleteDrawer: false })}
          visible={showDeleteDrawer}
          width={500}
        >
          <EditableTable
            minHeight="calc(100vh - 34px - 130px)"
            columns={columnsInDeleteDrawer}
            rowKey="uniqueId"
            rows={selectedObjects as any}
            readonly={true}
          />

          <div className={styles.drawerFooter}>
            <Button
              onClick={() => this.setState({ showDeleteDrawer: false })}
              style={{ marginRight: 8 }}
            >
              <FormattedMessage id="app.button.cancel" />
            </Button>
            <Button onClick={this.handleDelete} danger ghost>
              <FormattedMessage id="workspace.window.recyclebin.button.clean" />
            </Button>
          </div>
        </Drawer>
        <Drawer
          title={formatMessage({
            id: 'workspace.window.recyclebin.drawer.restore.title',
          })}
          placement="right"
          closable
          onClose={this.handleCancelRestore}
          visible={showRestoreDrawer}
          width={886}
        >
          <EditableTable
            minHeight="calc(100vh - 34px - 130px)"
            columns={columnsInRestoreDrawer}
            rowKey="uniqueId"
            rows={selectedObjects as any}
            onRowsChange={this.handleEditPropertyInCell}
          />

          <div className={styles.drawerFooter}>
            <Button onClick={this.handleCancelRestore} style={{ marginRight: 8 }}>
              <FormattedMessage id="app.button.cancel" />
            </Button>
            <Button onClick={this.handleRestore} type="primary">
              <FormattedMessage id="workspace.window.recyclebin.button.restore" />
            </Button>
          </div>
        </Drawer>
      </>
    );
  }

  private triggerTableLayout() {
    setTimeout(() => {
      // 手动触发 resize 事件
      window.dispatchEvent(new Event('resize'));
    });
  }
}
