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

import {
  getDeleteSQL,
  getPurgeAllSQL,
  getRecycleConfig,
  getUpdateSQL,
  updateRecycleConfig,
} from '@/common/network/recycle';
import { executeSQL } from '@/common/network/sql';
import ExecuteSQLModal from '@/component/ExecuteSQLModal';
import WorkSpacePageLoading from '@/component/Loading/WorkSpacePageLoading';
import MiniTable from '@/component/Table/MiniTable';
import Toolbar from '@/component/Toolbar';
import { IRecycleConfig, IRecycleObject, ISqlExecuteResultStatus } from '@/d.ts';
import SessionStore from '@/store/sessionManager/session';
import { formatMessage } from '@/util/intl';
import notification from '@/util/notification';
import { sortString } from '@/util/utils';
import { ExclamationCircleFilled, SettingOutlined, SyncOutlined } from '@ant-design/icons';
import { FormattedMessage } from '@umijs/max';
import { Button, Drawer, Input, message, Modal, Space, Spin } from 'antd';
import { ColumnsType } from 'antd/es/table';
import classNames from 'classnames';
import React, { Component } from 'react';
import EditableTable from '../EditableTable';
import { TextEditor } from '../EditableTable/Editors/TextEditor';
import SessionContextWrap from '../SessionContextWrap';
import SessionSelect from '../SessionContextWrap/SessionSelect';
import RecyleConfigContext from './context/RecyleConfigContext';
import styles from './index.less';
import RecycleConfig from './RecyleConfig';

const ToolbarButton = Toolbar.Button;

const { Search } = Input;

interface IProps {
  session: SessionStore;
  datasourceId: number;
  showDatasource?: boolean;
  simpleHeader?: boolean;
  theme?: 'dark' | 'white';
}

class RecycleBin extends Component<
  IProps,
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
    this.session = this.props.session;
    this.getRecycleObjectList();
    this.getRecycleConfig();
  }

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
    const { updateDML } = this.state;

    // 执行 DML
    const result = await executeSQL(
      updateDML,
      this.session?.sessionId,
      this.session?.database?.dbName,
    );
    if (!result) {
      return;
    }
    if (result?.invalid) {
      this.setState({
        showExecuteSQLModal: false,
        showDeleteDrawer: false,
        showRestoreDrawer: false,
        updateDML: '',
        selectedObjectNames: new Set<string>(), // 清除掉当前选择的对象
      });
      return;
    }

    if (result?.executeResult?.[0]?.status === ISqlExecuteResultStatus.SUCCESS) {
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
      notification.error(result?.executeResult?.[0]);
    }
  };

  /**
   * 在表格中编辑保存
   */
  public handleEditPropertyInCell = (newRows) => {
    this.session.updateRecycleObjectName(newRows);
    this.triggerTableLayout();
    this.forceUpdate();
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

    const { simpleHeader, theme } = this.props;

    const columns: ColumnsType<IRecycleObject> = [
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
        <Spin wrapperClassName={styles.wrap} spinning={listLoading}>
          <div className={classNames(styles.toolbar, { [styles.simpleHeader]: simpleHeader })}>
            <Toolbar style={{ borderBottom: 'none', height: simpleHeader ? 32 : 38 }}>
              <div style={{ paddingLeft: simpleHeader ? '0px' : '12px' }} className="tools-left">
                <Space size={12}>
                  <ToolbarButton
                    type="BUTTON"
                    disabled={!selectedObjectNames.size}
                    text={
                      formatMessage({
                        id: 'odc.components.RecycleBinPage.Delete',
                      }) //删除
                    }
                    onClick={() => this.setState({ showDeleteDrawer: true })}
                  />

                  <ToolbarButton
                    type="BUTTON"
                    disabled={!selectedObjectNames.size}
                    text={<FormattedMessage id="workspace.window.recyclebin.button.restore" />}
                    onClick={() => this.setState({ showRestoreDrawer: true })}
                  />

                  <ToolbarButton
                    type="BUTTON"
                    text={
                      formatMessage({
                        id: 'odc.components.RecycleBinPage.Clear',
                      }) //清空
                    }
                    onClick={this.handleOpenPurgeAllModal}
                  />
                </Space>
              </div>
              <div className="tools-right">
                <Search
                  allowClear
                  placeholder={formatMessage({
                    id: 'workspace.window.session.button.search',
                  })}
                  onSearch={this.handleSearch}
                  // onChange={(e) => this.handleSearch(e.target.value)}
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
          </div>
          {this.props.showDatasource ? (
            <div className={styles.datasourceSelect}>
              <SessionSelect />
            </div>
          ) : null}
          <div className={styles.table}>
            <MiniTable
              loadData={(page) => {}}
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
            theme={theme}
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

export default function WrapRecycleBin(props: Omit<IProps, 'session'>) {
  return (
    <SessionContextWrap
      defaultDatabaseId={null}
      datasourceMode
      defaultDatasourceId={props.datasourceId}
    >
      {({ session }) => {
        return !session ? (
          <WorkSpacePageLoading />
        ) : (
          <RecycleBin key={session?.sessionId} session={session} {...props} />
        );
      }}
    </SessionContextWrap>
  );
}
