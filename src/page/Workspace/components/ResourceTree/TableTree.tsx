import {
  dropTable,
  generateUpdateTableDDL,
  getTableInfo,
  getTableUpdateSQL,
  tableModify,
} from '@/common/network/table';
import ExecuteSQLModal from '@/component/ExecuteSQLModal';
import TableRenameModal from '@/component/TableRenameModal';
import { copyObj } from '@/component/TemplateInsertModal';
import {
  DbObjectType,
  DragInsertType,
  ITableColumn,
  ITableConstraint,
  ITableIndex,
  ITablePartition,
  ITreeNode,
  PageType,
  ResourceTabKey,
  ResourceTreeNodeMenuKeys,
} from '@/d.ts';
import { openNewSQLPage, openTableViewPage } from '@/store/helper/page';
import { UserStore } from '@/store/login';
import { ModalStore } from '@/store/modal';
import { PageStore } from '@/store/page';
import { SessionManagerStore } from '@/store/sessionManager';
import { SQLStore } from '@/store/sql';
import { formatMessage } from '@/util/intl';
import { removeTableQuote } from '@/util/sql';
import { downloadPLDDL } from '@/util/sqlExport';
import { QuestionCircleFilled } from '@ant-design/icons';
import { message, Modal, Spin } from 'antd';
import { AntTreeNode } from 'antd/lib/tree';
import EventBus from 'eventbusjs';
import { inject, observer } from 'mobx-react';
import { MenuInfo } from 'rc-menu/lib/interface';
import React, { Component } from 'react';
import { ITableModel, TableColumn, TableConstraint, TableIndex } from '../CreateTable/interface';
import { PropsTab, TopTab } from '../TablePage';
import AddPartitionWithTableNameModal from '../TablePage/Partitions/AddPartitionModal/AddPartitionWithTableNameModal';
import TreeNodeDirectory, { injectCustomInfoToTreeData } from './component/TreeNodeDirectory';
import TREE_NODES from './config';

enum ExecuteDMLMode {
  RENAME_TABLE = 'RENAME_TABLE',
  DELETE_INDEX = 'DELETE_INDEX',
  CREATE_INDEX = 'CREATE_INDEX',
  CREATE_COLUMN = 'CREATE_COLUMN',
  DELETE_COLUMN = 'DELETE_COLUMN',
  EDIT_COLUMN = 'EDIT_COLUMN',
  CREATE_PARTITION = 'CREATE_PARTITION',
  DELETE_PARTITION = 'DELETE_PARTITION',
  SPLIT_PARTITION = 'SPLIT_PARTITION',
  DELETE_CONSTRAINT = 'DELETE_CONSTRAINT',
}

interface ITableTreeState {
  updateDML: string;
  showExecuteSQLModal: boolean;
  currentTable: Partial<ITableModel>;
  executeDMLMode: ExecuteDMLMode;
  showTableRenameModal: boolean;
  columnToEdit: Partial<ITableColumn>;
  partitionToEdit: Partial<ITablePartition>;
  showSplitPartitionEditModal: boolean;
  updatedTableName: string;
}

@inject('pageStore', 'sqlStore', 'userStore', 'modalStore', 'sessionManagerStore')
@observer
export default class TableTree extends Component<
  {
    userStore?: UserStore;
    pageStore?: PageStore;
    sessionManagerStore?: SessionManagerStore;
    sqlStore?: SQLStore;
    modalStore?: ModalStore;
    loading: boolean;
    searchKey: {
      [key in ResourceTabKey]: string;
    };
    addTreeNodeType: ResourceTabKey;
    handleCloseAddTreeNode: (callback?: () => void) => void;
    handleAddTreeNode: (e: ResourceTabKey) => void;
    handleRefreshTree: (e: ResourceTabKey) => Promise<void>;
  },
  ITableTreeState
> {
  addPartitionRef = React.createRef<any>();
  public readonly state: ITableTreeState = {
    updateDML: '',
    showExecuteSQLModal: false,
    currentTable: null,
    executeDMLMode: ExecuteDMLMode.CREATE_COLUMN,
    showTableRenameModal: false,
    columnToEdit: {},
    partitionToEdit: {},
    showSplitPartitionEditModal: false,
    // 保存重命名后的表名
    updatedTableName: '',
  };

  public handleBrowserSchema = (tableName: string = '', topTab: TopTab) => {
    const { pageStore } = this.props;
    const exsitPage = pageStore.pages.find((page) => {
      return page.params.tableName === tableName;
    });
    let propsTab = PropsTab.INFO;
    if (exsitPage?.params) {
      /**
       * 假如已经打开了对应的tab，那么子tab要维持原样
       * aone/issue/30543531
       */
      const { topTab: oldTopTab, propsTab: oldPropsTab } = exsitPage.params;
      if (oldTopTab === topTab) {
        propsTab = oldPropsTab;
      }
    }
    openTableViewPage(tableName, topTab, propsTab);
  };

  public handleBrowserDDL = (tableName: string, propsTab: PropsTab) => {
    openTableViewPage(tableName, TopTab.PROPS, propsTab);
  };

  public handleBrowserColumns = (tableName: string = '') => {
    openTableViewPage(tableName, TopTab.PROPS, PropsTab.COLUMN);
  };

  public handleBrowserIndexes = (tableName: string | undefined) => {
    openTableViewPage(tableName, TopTab.PROPS, PropsTab.INDEX);
  };

  public handleBrowserConstraints = (tableName: string | undefined) => {
    openTableViewPage(tableName, TopTab.PROPS, PropsTab.CONSTRAINT);
  };

  public handleBrowserPartitions = (tableName: string | undefined) => {
    openTableViewPage(tableName, TopTab.PROPS, PropsTab.PARTITION);
  };

  public handleDeleteTable = async (tableName: string) => {
    const { pageStore, handleRefreshTree } = this.props;
    Modal.confirm({
      title: formatMessage(
        { id: 'workspace.window.createTable.modal.delete' },
        { name: tableName },
      ),
      okText: formatMessage({ id: 'app.button.ok' }),
      cancelText: formatMessage({ id: 'app.button.cancel' }),
      icon: <QuestionCircleFilled />,
      centered: true,
      onOk: async () => {
        const success = await dropTable(tableName);
        if (success) {
          await handleRefreshTree(ResourceTabKey.TABLE);
          message.success(
            formatMessage({
              id: 'workspace.window.createTable.modal.delete.success',
            }),
          );

          const openedPage = pageStore!.pages.find((p) => p.params.tableName === tableName);
          if (openedPage) {
            pageStore!.close(openedPage.key);
          }
        }
      },
    });
  };

  public handleRefreshTable = async (table: Partial<ITableModel>) => {
    const session = this.props.sessionManagerStore.getMasterSession();
    await session.database.loadTable(table.info.tableName);
  };

  public handleDeleteIndex = async (table: Partial<ITableModel>, index: Partial<TableIndex>) => {
    const newTable = Object.assign({}, table, {
      indexes: table.indexes.filter((i) => i.ordinalPosition !== index.ordinalPosition),
    });
    const ddl = await generateUpdateTableDDL(newTable, table);
    this.setState({
      currentTable: table,
      updateDML: ddl,
      showExecuteSQLModal: true,
      executeDMLMode: ExecuteDMLMode.DELETE_INDEX,
    });
  };

  public handleDeleteConstraint = async (
    table: Partial<ITableModel>,
    constraint: Partial<TableConstraint>,
  ) => {
    const newTable = Object.assign({}, table, {
      primaryConstraints: table.primaryConstraints?.filter(
        (i) => i.ordinalPosition !== constraint.ordinalPosition,
      ),
      uniqueConstraints: table.uniqueConstraints?.filter(
        (i) => i.ordinalPosition !== constraint.ordinalPosition,
      ),
      foreignConstraints: table.foreignConstraints?.filter(
        (i) => i.ordinalPosition !== constraint.ordinalPosition,
      ),
      checkConstraints: table.checkConstraints?.filter(
        (i) => i.ordinalPosition !== constraint.ordinalPosition,
      ),
    });
    const ddl = await generateUpdateTableDDL(newTable, table);
    this.setState({
      currentTable: table,
      updateDML: ddl,
      showExecuteSQLModal: true,
      executeDMLMode: ExecuteDMLMode.DELETE_CONSTRAINT,
    });
  };

  public handleDeleteColumn = async (table: Partial<ITableModel>, column: Partial<TableColumn>) => {
    const newTable = Object.assign({}, table, {
      columns: table.columns?.filter((c) => c.ordinalPosition !== column.ordinalPosition),
    });
    const ddl = await generateUpdateTableDDL(newTable, table);
    this.setState({
      currentTable: table,
      updateDML: ddl,
      showExecuteSQLModal: true,
      executeDMLMode: ExecuteDMLMode.DELETE_COLUMN,
    });
  };

  // public handleCreateColumn = async (column: ITableColumn) => {
  //   const { schemaStore } = this.props;
  //   const { currentTable, executeDMLMode, columnToEdit } = this.state;
  //   if (currentTable) {
  //     const sql =
  //       executeDMLMode === ExecuteDMLMode.EDIT_COLUMN
  //         ? await schemaStore!.getColumnUpdateSQL(
  //             currentTable.tableName,
  //             Object.assign(
  //               {
  //                 initialValue: columnToEdit,
  //               },
  //               columnToEdit,
  //               column,
  //             ),
  //           )
  //         : await schemaStore!.getColumnCreateSQL(currentTable.tableName, column);
  //     this.setState({
  //       updateDML: sql,
  //       showColumnEditModal: false,
  //       showExecuteSQLModal: true,
  //     });
  //   }
  // };

  public handleExecuteDML = async () => {
    const { pageStore, handleRefreshTree } = this.props;
    const { updatedTableName, currentTable } = this.state;
    const tableName = currentTable?.info?.tableName;
    try {
      const isSuccess = await tableModify(this.state.updateDML, tableName || '');
      if (isSuccess) {
        // 关闭对话框
        this.setState({
          showExecuteSQLModal: false,
          updateDML: '',
          currentTable: {},
        });

        // TODO: 如果当前有打开表详情页，也需要刷新

        EventBus.dispatch('tableChange', null, {
          params: {
            tableName: tableName,
          },
        });

        if (this.state.executeDMLMode === ExecuteDMLMode.RENAME_TABLE) {
          message.success(formatMessage({ id: 'workspace.tree.table.rename.success' }));
          // TODO: 刷新表详情页
          // aone/v2/project/874455/bug#openWorkitemIdentifier=32755672
          handleRefreshTree(ResourceTabKey.TABLE);
          const targetPageKey = pageStore.pages.find(
            (page) => page.type === PageType.TABLE && page.params?.tableName === tableName,
          )?.key;
          if (targetPageKey) {
            pageStore.updatePage(
              targetPageKey,
              {
                title: removeTableQuote(updatedTableName),
                updateKey: true,
              },

              {
                tableName: removeTableQuote(updatedTableName),
              },
            );
          }
          // schemaStore!.updateTableName(tableName, this.state.updatedTableName);
        } else {
          const session = this.props.sessionManagerStore.getMasterSession();
          message.success('操作成功');
          await session.database.loadTable(tableName);
        }
      }
    } catch (e) {
      //
    }
  };

  public handleOpenSQLWindow = () => {
    openNewSQLPage();
  };

  public handleRenameTable = (table: Partial<ITableModel>) => {
    this.setState({
      currentTable: table,
      showTableRenameModal: true,
    });
  };

  public handleSubmitRenameTable = async (table: Partial<ITableModel>) => {
    const { currentTable } = this.state;
    const session = this.props.sessionManagerStore.getMasterSession();
    if (currentTable) {
      const sql = await getTableUpdateSQL(
        currentTable.info.tableName,
        session.sessionId,
        session.database.dbName,
        {
          table,
        },
      );
      this.setState({
        updateDML: sql,
        showTableRenameModal: false,
        showExecuteSQLModal: true,
        executeDMLMode: ExecuteDMLMode.RENAME_TABLE,
        updatedTableName: table.info.tableName || '',
      });
    }
  };

  public handleLoadTreeNodes = async (treeNode: AntTreeNode) => {
    const { root } = treeNode.props.dataRef;
    const tableName = root.origin?.tableName;
    if (!tableName) {
      return;
    }
    const session = this.props.sessionManagerStore.getMasterSession();
    await session?.database?.loadTable(tableName);
  };

  handleCreateTable = () => {
    this.props.handleAddTreeNode(ResourceTabKey.TABLE);
  };
  /**
   * 新增表模拟数据
   */
  openDataMocker = (tableName: string) => {
    this.props.modalStore.changeDataMockerModal(true, {
      tableName,
    });
  };

  // todo node table 使用options进行收敛
  handleTreeNodeMenuClick = (e: MenuInfo, node: ITreeNode) => {
    // todo 将所有的action进行统一注册，这里使用 actions.excute(key, options:{ table --->原始粒度的数据, props ---> store, this---> this.setState(xxx) }) 方式进行调用，
    // 摆脱 switch，使得 handle处理更简洁！！！
    const { modalStore } = this.props;
    const { origin, root } = node;
    const table: Partial<ITableModel> = root.origin;
    const menuItem:
      | Partial<ITableModel>
      | Partial<ITableColumn>
      | Partial<ITableIndex>
      | Partial<ITablePartition>
      | Partial<ITableConstraint> = origin;
    const tableName = table?.info?.tableName || '';
    switch (e.key) {
      case ResourceTreeNodeMenuKeys.BROWSER_SCHEMA:
        this.handleBrowserDDL(tableName, PropsTab.COLUMN);
        break;
      case ResourceTreeNodeMenuKeys.BROWSER_DATA:
        this.handleBrowserSchema(tableName, TopTab.DATA);
        break;
      case ResourceTreeNodeMenuKeys.CREATE_TABLE:
        this.handleCreateTable();
        break;
      case ResourceTreeNodeMenuKeys.MOCK_DATA:
        this.openDataMocker(tableName);
        break;
      case ResourceTreeNodeMenuKeys.IMPORT_TABLE:
        modalStore.changeImportModal(true, table);
        break;
      case ResourceTreeNodeMenuKeys.EXPORT_TABLE:
        modalStore.changeExportModal(true, {
          type: DbObjectType.table,
          name: table?.info?.tableName,
        });
        break;
      case ResourceTreeNodeMenuKeys.OPEN_SQL_WINDOW:
        this.handleOpenSQLWindow();
        break;
      case ResourceTreeNodeMenuKeys.COPY_NAME:
        copyObj(table?.info?.tableName, DbObjectType.table, DragInsertType.NAME);
        break;
      case ResourceTreeNodeMenuKeys.COPY_SELECT:
        copyObj(table?.info?.tableName, DbObjectType.table, DragInsertType.SELECT);
        break;
      case ResourceTreeNodeMenuKeys.COPY_INSERT:
        copyObj(table?.info?.tableName, DbObjectType.table, DragInsertType.INSERT);
        break;
      case ResourceTreeNodeMenuKeys.COPY_UPDATE:
        copyObj(table?.info?.tableName, DbObjectType.table, DragInsertType.UPDATE);
        break;
      case ResourceTreeNodeMenuKeys.COPY_DELETE:
        copyObj(table?.info?.tableName, DbObjectType.table, DragInsertType.DELETE);
        break;
      case ResourceTreeNodeMenuKeys.BROWSER_DDL:
        this.handleBrowserDDL(tableName, PropsTab.DDL);
        break;
      case ResourceTreeNodeMenuKeys.DELETE_TABLE:
        this.handleDeleteTable(tableName);
        break;
      case ResourceTreeNodeMenuKeys.RENAME_TABLE:
        this.handleRenameTable(table);
        break;
      case ResourceTreeNodeMenuKeys.REFRESH_TABLE:
        this.handleRefreshTable(table);
        break;
      case ResourceTreeNodeMenuKeys.BROWSER_COLUMNS:
        this.handleBrowserColumns(tableName);
        break;
      case ResourceTreeNodeMenuKeys.REFRESH_COLUMNS:
        this.handleRefreshTable(table);
        break;
      case ResourceTreeNodeMenuKeys.DELETE_COLUMN:
        this.handleDeleteColumn(table, menuItem as ITableColumn);
        break;
      case ResourceTreeNodeMenuKeys.BROWSER_INDEXES:
        this.handleBrowserIndexes(table.info.tableName);
        break;
      case ResourceTreeNodeMenuKeys.REFRESH_INDEXES:
        this.handleRefreshTable(table);
        break;
      case ResourceTreeNodeMenuKeys.EDIT_INDEX:
        this.handleBrowserIndexes(table.info.tableName);
        break;
      case ResourceTreeNodeMenuKeys.DELETE_INDEX:
        this.handleDeleteIndex(table, menuItem as TableIndex);
        break;
      // 目前不支持, 是隐藏状态
      case ResourceTreeNodeMenuKeys.RENAME_INDEX:
        break;
      case ResourceTreeNodeMenuKeys.BROWSER_PARTITIONS:
        this.handleBrowserPartitions(table.info.tableName);
        break;
      case ResourceTreeNodeMenuKeys.REFRESH_PARTITIONS:
        this.handleRefreshTable(table);
        break;
      case ResourceTreeNodeMenuKeys.EDIT_PARTITION:
        this.handleBrowserPartitions(table.info.tableName);
        break;
      // 目前不支持, 是隐藏状态
      case ResourceTreeNodeMenuKeys.RENAME_PARTITION:
        break;
      case ResourceTreeNodeMenuKeys.BROWSER_CONSTRAINTS:
        this.handleBrowserConstraints(table.info.tableName);
        break;
      // 目前不支持, 是隐藏状态
      case ResourceTreeNodeMenuKeys.CREATE_CONSTRAINT:
        break;
      case ResourceTreeNodeMenuKeys.REFRESH_CONSTRAINTS:
        this.handleRefreshTable(table);
        break;
      case ResourceTreeNodeMenuKeys.EDIT_CONSTRAINT:
        this.handleBrowserConstraints(table.info.tableName);
        break;
      case ResourceTreeNodeMenuKeys.DELETE_CONSTRAINT:
        this.handleDeleteConstraint(table, menuItem as ITableConstraint);
        break;
      case ResourceTreeNodeMenuKeys.REFRESH_CONSTRAINTES:
        this.handleRefreshTable(table);
        break;
      case ResourceTreeNodeMenuKeys.DOWNLOAD: {
        this.downloadTable(tableName);
        break;
      }
      case ResourceTreeNodeMenuKeys.RENAME_CONSTRAINT:
        break;
      default:
    }
  };
  downloadTable = async (tableName: string) => {
    const session = this.props.sessionManagerStore.getMasterSession();
    const table = await getTableInfo(tableName, session.database.dbName, session.sessionId);
    if (table) {
      downloadPLDDL(tableName, 'TABLE', table.info?.DDL);
    }
  };

  handleTreeNodeDoubleClick = (node: ITreeNode) => {
    const {
      menu: { type },
      root: { origin },
    } = node;
    const table: Partial<ITableModel> = origin;
    const tableName = table?.info?.tableName || '';
    switch (type) {
      case DbObjectType.table:
        this.handleBrowserSchema(tableName, TopTab.PROPS);
        break;
      case 'tableColumnSet':
      case 'tableColumn':
        this.handleBrowserColumns(tableName);
        break;
      case 'tableIndexSet':
      case 'tableIndex':
        this.handleBrowserIndexes(tableName);
        break;
      case 'tablePartitionSet':
      case 'tablePartition':
        this.handleBrowserPartitions(tableName);
        break;
      case 'tableConstraintsSet':
      case 'tableConstraint':
        this.handleBrowserConstraints(tableName);
        break;
      default:
    }
  };

  private getTreeList = () => {
    const { searchKey, sessionManagerStore } = this.props;
    const session = sessionManagerStore.getMasterSession();
    const tables = session.database.tables;
    const dataTypes = session.dataTypes;
    const treeNodes: ITreeNode[] = [];
    const filteredTables =
      tables?.filter(
        (t: Partial<ITableModel>) =>
          t?.info.tableName
            ?.toString()
            .toUpperCase()
            .indexOf(searchKey[ResourceTabKey.TABLE].toUpperCase()) > -1,
      ) || [];

    filteredTables.forEach((table: Partial<ITableModel>, index: number) => {
      treeNodes.push(
        TREE_NODES.TABLE.getConfig(table, {
          key: `table-${table.info.tableName}-${index}`,
          type: DbObjectType.table,
          dataTypes,
        }),
      );
    });
    injectCustomInfoToTreeData(treeNodes);
    return treeNodes;
  };

  public render() {
    const { sessionManagerStore, loading } = this.props;
    const {
      updateDML,
      showExecuteSQLModal,
      currentTable,
      showTableRenameModal,
      executeDMLMode,
      columnToEdit,
    } = this.state;
    const session = sessionManagerStore.getMasterSession();
    const mode = session.connection.dialectType;

    return (
      <>
        <Spin spinning={loading}>
          <TreeNodeDirectory
            showIcon={false}
            treeList={this.getTreeList()}
            loadedKeys={[]}
            handleLoadTreeData={this.handleLoadTreeNodes}
            onDoubleClick={this.handleTreeNodeDoubleClick}
            onMenuClick={this.handleTreeNodeMenuClick}
            getWrapperInstance={() => this}
          />
        </Spin>
        <TableRenameModal
          model={currentTable || {}}
          visible={showTableRenameModal}
          onCancel={() => this.setState({ showTableRenameModal: false })}
          onSave={this.handleSubmitRenameTable}
        />
        <AddPartitionWithTableNameModal ref={this.addPartitionRef} />
        <ExecuteSQLModal
          sql={updateDML}
          visible={showExecuteSQLModal}
          onSave={this.handleExecuteDML}
          onCancel={() => this.setState({ showExecuteSQLModal: false })}
          onChange={(sql) => this.setState({ updateDML: sql })}
        />
      </>
    );
  }
}
