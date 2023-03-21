import { dropTable, tableModify } from '@/common/network/table';
import ExecuteSQLModal from '@/component/ExecuteSQLModal';
import SplitPartitionModal from '@/component/SplitPartitionModal';
import TableColumnModal from '@/component/TableColumnModal';
import TableIndexModal from '@/component/TableIndexModal';
import TableRenameModal from '@/component/TableRenameModal';
import { copyObj } from '@/component/TemplateInsertModal';
import {
  ConnectionMode,
  DbObjectType,
  DragInsertType,
  ITable,
  ITableColumn,
  ITableConstraint,
  ITableIndex,
  ITablePartition,
  ITreeNode,
  PageType,
  ResourceTabKey,
  ResourceTreeNodeMenuKeys,
  TableTreeNode,
} from '@/d.ts';
import { ConnectionStore } from '@/store/connection';
import { openNewSQLPage, openTableViewPage } from '@/store/helper/page';
import { UserStore } from '@/store/login';
import { ModalStore } from '@/store/modal';
import { PageStore } from '@/store/page';
import { SchemaStore } from '@/store/schema';
import { SQLStore } from '@/store/sql';
import { formatMessage } from '@/util/intl';
import { removeTableQuote } from '@/util/sql';
import { downloadPLDDL } from '@/util/sqlExport';
import { convertPartitionType, getRangeInitialValue, isRangeDisabled } from '@/util/utils';
import { QuestionCircleFilled } from '@ant-design/icons';
import { message, Modal, Spin } from 'antd';
import { AntTreeNode } from 'antd/lib/tree';
import EventBus from 'eventbusjs';
import { isEmpty } from 'lodash';
import { inject, observer } from 'mobx-react';
import { MenuInfo } from 'rc-menu/lib/interface';
import React, { Component } from 'react';
import CreateTablePartitionRuleForm from '../CreateTablePartitionRuleForm';
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
  currentTable: Partial<ITable>;
  showIndexEditModal: boolean;
  executeDMLMode: ExecuteDMLMode;
  showTableRenameModal: boolean;
  showColumnEditModal: boolean;
  columnToEdit: Partial<ITableColumn>;
  showPartitionEditModal: boolean;
  partitionToEdit: Partial<ITablePartition>;
  showSplitPartitionEditModal: boolean;
  updatedTableName: string;
}

@inject('pageStore', 'schemaStore', 'connectionStore', 'sqlStore', 'userStore', 'modalStore')
@observer
export default class TableTree extends Component<
  {
    userStore?: UserStore;
    pageStore?: PageStore;
    schemaStore?: SchemaStore;
    connectionStore?: ConnectionStore;
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
    currentTable: {
      tableName: '',
      partitioned: false,
      columns: [],
      indexes: [],
    },
    showIndexEditModal: false,
    executeDMLMode: ExecuteDMLMode.CREATE_COLUMN,
    showTableRenameModal: false,
    showColumnEditModal: false,
    columnToEdit: {},
    showPartitionEditModal: false,
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

  public handleRefreshPartitions = async (tableName: string | undefined) => {
    const { schemaStore } = this.props;
    // TODO: 增加 loading
    await schemaStore!.loadTablePartitions(tableName || '');
  };

  public handleDeleteTable = async (tableName: string) => {
    const { schemaStore, pageStore, handleRefreshTree } = this.props;
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

  public handleRefreshTable = async (table: Partial<ITable>) => {
    const { schemaStore } = this.props;
    await schemaStore!.loadTableColumns(table.tableName || '');
    await schemaStore!.loadTableIndexes(table.tableName || '');
    await schemaStore!.loadTableConstraints(table.tableName || '');
    if (table.partitioned) {
      await schemaStore!.loadTablePartitions(table.tableName || '');
    }
  };

  public handleDeleteIndex = async (table: Partial<ITable>, index: Partial<ITableIndex>) => {
    const { schemaStore } = this.props;

    if (table.tableName) {
      const sql = await schemaStore!.getIndexDeleteSQL(table.tableName, index);
      this.setState({
        currentTable: table,
        updateDML: sql,
        showExecuteSQLModal: true,
        executeDMLMode: ExecuteDMLMode.DELETE_INDEX,
      });
    }
  };

  public handleDeleteConstraint = async (
    table: Partial<ITable>,
    constraint: Partial<ITableConstraint>,
  ) => {
    const { schemaStore } = this.props;

    if (table.tableName) {
      const sql = await schemaStore!.getConstraintDeleteSQL(table.tableName, constraint);
      this.setState({
        currentTable: table,
        updateDML: sql,
        showExecuteSQLModal: true,
        executeDMLMode: ExecuteDMLMode.DELETE_CONSTRAINT,
      });
    }
  };

  public handleStartCreateIndex = async (currentTable: Partial<ITable>) => {
    const { schemaStore } = this.props;

    if (currentTable.tableName) {
      // 索引需要选择列，因此首先需要加载列
      await schemaStore!.loadTableColumns(currentTable.tableName);
      this.setState({
        currentTable,
        showIndexEditModal: true,
        executeDMLMode: ExecuteDMLMode.CREATE_INDEX,
      });
    }
  };

  public handleCreateIndex = async (index: ITableIndex) => {
    const { schemaStore } = this.props;
    const { currentTable } = this.state;
    if (currentTable) {
      const sql = await schemaStore!.getIndexCreateSQL(currentTable.tableName, index);
      this.setState({
        updateDML: sql,
        showIndexEditModal: false,
        showExecuteSQLModal: true,
      });
    }
  };

  public handleRefreshIndexes = async (table: Partial<ITable>) => {
    const { schemaStore } = this.props;
    // TODO: 增加 loading
    await schemaStore!.loadTableIndexes(table.tableName || '');
  };

  public handleRefreshConstraints = async (table: Partial<ITable>) => {
    const { schemaStore } = this.props;
    await schemaStore!.loadTableConstraints(table.tableName || '');
  };

  public handleDeleteColumn = async (table: Partial<ITable>, column: Partial<ITableColumn>) => {
    const { schemaStore } = this.props;

    const sql = await schemaStore!.getColumnDeleteSQL(table.tableName || '', column);
    this.setState({
      currentTable: table,
      updateDML: sql,
      showExecuteSQLModal: true,
      executeDMLMode: ExecuteDMLMode.DELETE_COLUMN,
    });
  };

  public handleStartEditColumn = async (
    currentTable: Partial<ITable>,
    column: Partial<ITableColumn>,
  ) => {
    this.setState({
      currentTable,
      columnToEdit: column,
      showColumnEditModal: true,
      executeDMLMode: ExecuteDMLMode.EDIT_COLUMN,
    });
  };

  public handleStartCreateColumn = async (currentTable: Partial<ITable>) => {
    this.setState({
      currentTable,
      showColumnEditModal: true,
      executeDMLMode: ExecuteDMLMode.CREATE_COLUMN,
    });
  };

  public handleCreateColumn = async (column: ITableColumn) => {
    const { schemaStore } = this.props;
    const { currentTable, executeDMLMode, columnToEdit } = this.state;
    if (currentTable) {
      const sql =
        executeDMLMode === ExecuteDMLMode.EDIT_COLUMN
          ? await schemaStore!.getColumnUpdateSQL(
              currentTable.tableName,
              Object.assign(
                {
                  initialValue: columnToEdit,
                },
                columnToEdit,
                column,
              ),
            )
          : await schemaStore!.getColumnCreateSQL(currentTable.tableName, column);
      this.setState({
        updateDML: sql,
        showColumnEditModal: false,
        showExecuteSQLModal: true,
      });
    }
  };

  public handleDeletePartition = async (
    table: Partial<ITable>,
    partition: Partial<ITablePartition>,
  ) => {
    const { schemaStore } = this.props;

    if (table.tableName) {
      const sql = await schemaStore!.getPartitionDeleteSQL(table.tableName, partition);
      this.setState({
        currentTable: table,
        updateDML: sql,
        showExecuteSQLModal: true,
        executeDMLMode: ExecuteDMLMode.DELETE_PARTITION,
      });
    }
  };

  public handleStartSplitPartition = async (
    currentTable: Partial<ITable>,
    partition: Partial<ITablePartition>,
  ) => {
    this.setState({
      currentTable,
      partitionToEdit: partition,
      showSplitPartitionEditModal: true,
      executeDMLMode: ExecuteDMLMode.SPLIT_PARTITION,
    });
  };

  public handleSplitPartition = async (
    partitions: Array<Partial<ITablePartition>>,
    source: Partial<ITablePartition>,
  ) => {
    const { schemaStore } = this.props;
    const { currentTable } = this.state;
    const { tableName } = currentTable;
    // 第一个为源分区规则，后续为分裂规则
    const updateDML = await schemaStore!.getPartitionSplitSQL(
      tableName,
      [source, ...partitions].map((p) => {
        p.tableName = tableName;
        return p;
      }),
    );
    this.setState({
      showExecuteSQLModal: true,
      showSplitPartitionEditModal: false,
      updateDML,
    });
  };

  public handleStartCreatePartition = async (currentTable: Partial<ITable>) => {
    const ddl = await this.addPartitionRef.current.addNewPartitions(currentTable.tableName);
    if (ddl) {
      this.setState({
        currentTable,
        updateDML: ddl,
        showExecuteSQLModal: true,
        executeDMLMode: ExecuteDMLMode.CREATE_PARTITION,
      });
    }
  };

  public handleSavePartitionRules = async (partitions: Array<Partial<ITablePartition>>) => {
    const { schemaStore } = this.props;
    const { currentTable } = this.state;
    const { tableName } = currentTable;
    let updateDML = '';
    if (!currentTable.partitioned) {
      // 非分区表转分区表
      updateDML = await schemaStore!.getPartitionTransformSQL(
        tableName,
        partitions.map((p) => ({
          ...p,
          tableName,
        })),
      );
    } else {
      const sqls = await Promise.all(
        partitions.map(async (p) => {
          return schemaStore!.getPartitionCreateSQL(tableName, {
            ...p,
            tableName,
          });
        }),
      );

      updateDML = sqls.join('\n');
    }

    this.setState({
      updateDML,
      showPartitionEditModal: false,
      showExecuteSQLModal: true,
    });
  };

  /**
   * 刷新列
   */
  public handleRefreshColumns = async (table: Partial<ITable>) => {
    const { schemaStore } = this.props;
    // TODO: 增加 loading
    await schemaStore!.loadTableColumns(table.tableName || '');
  };

  public handleExecuteDML = async () => {
    const { pageStore, schemaStore, handleRefreshTree } = this.props;
    const { updatedTableName } = this.state;
    const tableName = this.state.currentTable && this.state.currentTable.tableName;

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

        if (this.state.executeDMLMode === ExecuteDMLMode.DELETE_INDEX) {
          message.success(formatMessage({ id: 'workspace.tree.table.deleteIndex.success' }));
          await schemaStore!.loadTableIndexes(tableName);
        } else if (this.state.executeDMLMode === ExecuteDMLMode.CREATE_INDEX) {
          message.success(formatMessage({ id: 'workspace.tree.table.createIndex.success' }));
          await schemaStore!.loadTableIndexes(tableName);
        } else if (this.state.executeDMLMode === ExecuteDMLMode.CREATE_COLUMN) {
          message.success(formatMessage({ id: 'workspace.tree.table.createColumn.success' }));
          // 刷新字段列表
          await schemaStore!.loadTableColumns(tableName);
        } else if (this.state.executeDMLMode === ExecuteDMLMode.DELETE_COLUMN) {
          message.success(formatMessage({ id: 'workspace.tree.table.deleteColumn.success' }));
          // 刷新字段列表
          await schemaStore!.loadTableColumns(tableName);
        } else if (this.state.executeDMLMode === ExecuteDMLMode.EDIT_COLUMN) {
          message.success(formatMessage({ id: 'workspace.tree.table.editColumn.success' }));
          // 需要刷新字段列表，因为数据类型可能发生了改变
          await schemaStore!.loadTableColumns(tableName);
        } else if (this.state.executeDMLMode === ExecuteDMLMode.CREATE_PARTITION) {
          message.success(
            formatMessage({
              id: 'workspace.tree.table.createPartition.success',
            }),
          );
          await schemaStore!.loadTablePartitions(tableName);
        } else if (this.state.executeDMLMode === ExecuteDMLMode.DELETE_PARTITION) {
          message.success(
            formatMessage({
              id: 'workspace.tree.table.deletePartition.success',
            }),
          );
          await schemaStore!.loadTablePartitions(tableName);
        } else if (this.state.executeDMLMode === ExecuteDMLMode.SPLIT_PARTITION) {
          message.success(formatMessage({ id: 'workspace.tree.table.splitPartition.success' }));
          await schemaStore!.loadTablePartitions(tableName);
        } else if (this.state.executeDMLMode === ExecuteDMLMode.RENAME_TABLE) {
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
        }
      }
    } catch (e) {
      //
    }
  };

  public handleOpenSQLWindow = () => {
    openNewSQLPage();
  };

  public handleRenameTable = (table: Partial<ITable>) => {
    this.setState({
      currentTable: table,
      showTableRenameModal: true,
    });
  };

  public handleSubmitRenameTable = async (table: Partial<ITable>) => {
    const { schemaStore } = this.props;
    const { currentTable } = this.state;
    if (currentTable) {
      const sql = await schemaStore!.getTableUpdateSQL(currentTable.tableName, {
        table,
      });
      this.setState({
        updateDML: sql,
        showTableRenameModal: false,
        showExecuteSQLModal: true,
        executeDMLMode: ExecuteDMLMode.RENAME_TABLE,
        updatedTableName: table.tableName || '',
      });
    }
  };

  public handleLoadTreeNodes = async (treeNode: AntTreeNode) => {
    const {
      schemaStore,
      schemaStore: { tables },
    } = this.props;
    const { type, root, title } = treeNode.props.dataRef;
    const table = root.origin;
    // 已经有子节点，直接返回
    if (type !== TableTreeNode.TABLE && !isEmpty(treeNode.props.children)) {
      schemaStore!.setLoadedTableKeys(
        schemaStore!.loadedTableKeys.concat(treeNode.props.eventKey as string),
      );
      return;
    }

    if (type === TableTreeNode.COLUMN && table) {
      await schemaStore!.loadTableColumns(table.tableName);
    } else if (type === TableTreeNode.INDEX && table) {
      await schemaStore!.loadTableIndexes(table.tableName);
    } else if (type === TableTreeNode.CONSTRAINT && table) {
      await schemaStore!.loadTableConstraints(table.tableName);
    } else if (type === TableTreeNode.PARTITION && table) {
      await schemaStore!.loadTablePartitions(table.tableName);
    } else if (type === TableTreeNode.TABLE) {
      // 若对应的对象不存在，无需加载
      if (!tables.find((item: ITable) => item.tableName === title)) {
        return;
      }
      await schemaStore!.loadTable(table.tableName);
    }
    schemaStore!.setLoadedTableKeys(
      schemaStore!.loadedTableKeys.concat(treeNode.props.eventKey as string),
    );
    if (table && table.tableName) {
      schemaStore!.loadedTableNames.add(table.tableName);
    }
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
    const { modalStore, schemaStore } = this.props;
    const { origin, root } = node;
    const table: Partial<ITable> = root.origin;
    const menuItem:
      | Partial<ITable>
      | Partial<ITableColumn>
      | Partial<ITableIndex>
      | Partial<ITablePartition>
      | Partial<ITableConstraint> = origin;
    const tableName = table?.tableName || '';
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
          name: table?.tableName,
        });
        break;
      case ResourceTreeNodeMenuKeys.OPEN_SQL_WINDOW:
        this.handleOpenSQLWindow();
        break;
      case ResourceTreeNodeMenuKeys.COPY_NAME:
        copyObj(table?.tableName, DbObjectType.table, DragInsertType.NAME);
        break;
      case ResourceTreeNodeMenuKeys.COPY_SELECT:
        copyObj(table?.tableName, DbObjectType.table, DragInsertType.SELECT);
        break;
      case ResourceTreeNodeMenuKeys.COPY_INSERT:
        copyObj(table?.tableName, DbObjectType.table, DragInsertType.INSERT);
        break;
      case ResourceTreeNodeMenuKeys.COPY_UPDATE:
        copyObj(table?.tableName, DbObjectType.table, DragInsertType.UPDATE);
        break;
      case ResourceTreeNodeMenuKeys.COPY_DELETE:
        copyObj(table?.tableName, DbObjectType.table, DragInsertType.DELETE);
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
      case ResourceTreeNodeMenuKeys.CREATE_COLUMN:
        this.handleStartCreateColumn(table);
        break;
      case ResourceTreeNodeMenuKeys.REFRESH_COLUMNS:
        this.handleRefreshColumns(table);
        break;
      case ResourceTreeNodeMenuKeys.EDIT_COLUMN:
        this.handleStartEditColumn(table, menuItem as ITableColumn);
        break;
      case ResourceTreeNodeMenuKeys.DELETE_COLUMN:
        this.handleDeleteColumn(table, menuItem as ITableColumn);
        break;
      case ResourceTreeNodeMenuKeys.BROWSER_INDEXES:
        this.handleBrowserIndexes(table.tableName);
        break;
      case ResourceTreeNodeMenuKeys.CREATE_INDEX:
        this.handleStartCreateIndex(table);
        break;
      case ResourceTreeNodeMenuKeys.REFRESH_INDEXES:
        this.handleRefreshIndexes(table);
        break;
      case ResourceTreeNodeMenuKeys.EDIT_INDEX:
        this.handleBrowserIndexes(table.tableName);
        break;
      case ResourceTreeNodeMenuKeys.DELETE_INDEX:
        this.handleDeleteIndex(table, menuItem as ITableIndex);
        break;
      // 目前不支持, 是隐藏状态
      case ResourceTreeNodeMenuKeys.RENAME_INDEX:
        break;
      case ResourceTreeNodeMenuKeys.BROWSER_PARTITIONS:
        this.handleBrowserPartitions(table.tableName);
        break;
      case ResourceTreeNodeMenuKeys.CREATE_PARTITION:
        this.handleStartCreatePartition(table);
        break;
      case ResourceTreeNodeMenuKeys.REFRESH_PARTITIONS:
        this.handleRefreshPartitions(table.tableName);
        break;
      case ResourceTreeNodeMenuKeys.EDIT_PARTITION:
        this.handleBrowserPartitions(table.tableName);
        break;
      case ResourceTreeNodeMenuKeys.DELETE_PARTITION:
        this.handleDeletePartition(table, menuItem as ITablePartition);
        break;
      // 目前不支持, 是隐藏状态
      case ResourceTreeNodeMenuKeys.RENAME_PARTITION:
        break;
      case ResourceTreeNodeMenuKeys.SPLIT_PARTITION:
        this.handleStartSplitPartition(table, menuItem as ITablePartition);
        break;
      case ResourceTreeNodeMenuKeys.BROWSER_CONSTRAINTS:
        this.handleBrowserConstraints(table.tableName);
        break;
      // 目前不支持, 是隐藏状态
      case ResourceTreeNodeMenuKeys.CREATE_CONSTRAINT:
        break;
      case ResourceTreeNodeMenuKeys.REFRESH_CONSTRAINTS:
        this.handleRefreshConstraints(table);
        break;
      case ResourceTreeNodeMenuKeys.EDIT_CONSTRAINT:
        this.handleBrowserConstraints(table.tableName);
        break;
      case ResourceTreeNodeMenuKeys.DELETE_CONSTRAINT:
        this.handleDeleteConstraint(table, menuItem as ITableConstraint);
        break;
      case ResourceTreeNodeMenuKeys.REFRESH_CONSTRAINTES:
        this.handleRefreshConstraints(table);
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
    const { schemaStore } = this.props;
    const table = await schemaStore.getTableContent(tableName);
    if (table) {
      downloadPLDDL(tableName, 'TABLE', table.DDL);
    }
  };

  handleTreeNodeDoubleClick = (node: ITreeNode) => {
    const {
      menu: { type },
      root: { origin },
    } = node;
    const table: Partial<ITable> = origin;
    const tableName = table?.tableName || '';
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
    const {
      schemaStore: { tables, dataTypes },
      searchKey,
    } = this.props;
    const treeNodes: ITreeNode[] = [];
    const filteredTables =
      (tables &&
        tables.filter(
          (t: Partial<ITable>) =>
            t &&
            t.tableName &&
            t.tableName
              .toString()
              .toUpperCase()
              .indexOf(searchKey[ResourceTabKey.TABLE].toUpperCase()) > -1,
        )) ||
      [];

    filteredTables.forEach((table: Partial<ITable>, index: number) => {
      treeNodes.push(
        TREE_NODES.TABLE.getConfig(table, {
          key: `table-${table.tableName}-${index}`,
          type: DbObjectType.table,
          dataTypes,
        }),
      );
    });
    injectCustomInfoToTreeData(treeNodes);
    return treeNodes;
  };

  public render() {
    const {
      connectionStore: { connection },
      schemaStore: { tables, dataTypes, loadedTableKeys, switchingDatabase },
      searchKey,
      loading,
    } = this.props;
    const {
      updateDML,
      showExecuteSQLModal,
      showIndexEditModal,
      currentTable,
      showColumnEditModal,
      showTableRenameModal,
      showPartitionEditModal,
      executeDMLMode,
      columnToEdit,
      partitionToEdit,
      showSplitPartitionEditModal,
    } = this.state;
    const isOracle = connection.dbMode === ConnectionMode.OB_ORACLE;

    const rangeDisabled = isRangeDisabled(
      currentTable && currentTable.partitioned,
      connection.dbMode,
    );
    const rangeInitialValue = getRangeInitialValue(
      currentTable && currentTable.partitioned,
      connection.dbMode,
    );

    return (
      <>
        <Spin spinning={loading || switchingDatabase}>
          <TreeNodeDirectory
            showIcon={false}
            treeList={this.getTreeList()}
            loadedKeys={loadedTableKeys}
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
        <TableColumnModal
          model={
            executeDMLMode === ExecuteDMLMode.EDIT_COLUMN
              ? columnToEdit
              : { _created: true, allowNull: true }
          }
          visible={showColumnEditModal}
          onCancel={() => this.setState({ showColumnEditModal: false })}
          onSave={this.handleCreateColumn}
        />
        <TableIndexModal
          dataTypes={dataTypes}
          rangeDisabled={rangeDisabled}
          rangeInitialValue={rangeInitialValue}
          model={{ _created: true }}
          columns={(currentTable && currentTable.columns) || []}
          visible={showIndexEditModal}
          onCancel={() => this.setState({ showIndexEditModal: false })}
          onSave={this.handleCreateIndex}
        />
        <SplitPartitionModal
          model={partitionToEdit}
          visible={showSplitPartitionEditModal}
          onCancel={() => this.setState({ showSplitPartitionEditModal: false })}
          onSave={this.handleSplitPartition}
        />

        <Modal
          destroyOnClose
          title={formatMessage({
            id: 'workspace.window.createTable.partition.modal.title',
          })}
          width={1000}
          visible={showPartitionEditModal}
          footer={null}
          onCancel={() => this.setState({ showPartitionEditModal: false })}
        >
          <CreateTablePartitionRuleForm
            dataTypes={dataTypes}
            partitionType={
              currentTable &&
              currentTable.partitions &&
              currentTable.partitions[0] &&
              convertPartitionType(isOracle, currentTable.partitions[0].partType)
            }
            disableCheckMaxValue={false}
            disablePartition={!currentTable.partitioned}
            table={currentTable as ITable}
            onSave={this.handleSavePartitionRules}
          />
        </Modal>
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
