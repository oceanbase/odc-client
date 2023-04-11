import { PageType, ResourceTabKey, SynonymType } from '@/d.ts';
import {
  openCreateTablePage,
  openCreateTriggerPage,
  openCreateViewPage,
} from '@/store/helper/page';
import { ModalStore } from '@/store/modal';
import { PageStore } from '@/store/page';
import { SessionManagerStore } from '@/store/sessionManager';
import { formatMessage } from '@/util/intl';
import { Tabs } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { PureComponent } from 'react';
import TreeSearchBar from './component/TreeSearchBar';
import FunctionTree from './FunctionTree';
import styles from './index.less';
import PackageTree from './PackageTree';
import ProcedureTree from './ProcedureTree';
import SequenceTree from './SequenceTree';
import SynonymTree from './SynonymTree';
import TableTree from './TableTree';
import TriggerTree from './TriggerTree';
import TypeTree from './TypeTree';
import ViewTree from './ViewTree';

export const PL_ResourceMap = {
  [ResourceTabKey.FUNCTION]: {
    label: formatMessage({ id: 'odc.components.ResourceTree.Function' }), //函数
    pageKey: PageType.BATCH_COMPILE_FUNCTION,
  },

  [ResourceTabKey.PROCEDURE]: {
    label: formatMessage({ id: 'odc.components.ResourceTree.StoredProcedure' }), //存储过程
    pageKey: PageType.BATCH_COMPILE_PROCEDURE,
  },

  [ResourceTabKey.PACKAGE]: {
    label: formatMessage({ id: 'odc.components.ResourceTree.Bag' }), //包
    pageKey: PageType.BATCH_COMPILE_PACKAGE,
  },

  [ResourceTabKey.TRIGGER]: {
    label: formatMessage({ id: 'odc.components.ResourceTree.Trigger' }), //触发器
    pageKey: PageType.BATCH_COMPILE_TRIGGER,
  },

  [ResourceTabKey.TYPE]: {
    label: formatMessage({ id: 'odc.components.ResourceTree.Type' }), //类型
    pageKey: PageType.BATCH_COMPILE_TYPE,
  },
};

@inject('pageStore', 'modalStore', 'sessionManagerStore')
@observer
class ResourceTree extends PureComponent<
  {
    activeResource: ResourceTabKey;
    pageStore?: PageStore;
    modalStore?: ModalStore;
    sessionManagerStore?: SessionManagerStore;
  },
  {
    loading: boolean;
    searchKey: { [key in ResourceTabKey]: string };
    filterValue: { [key in ResourceTabKey]: string[] };
    addTreeNodeType: ResourceTabKey;
  }
> {
  state = {
    loading: false,
    searchKey: {
      TABLE: '',
      VIEW: '',
      FUNCTION: '',
      PROCEDURE: '',
      SEQUENCE: '',
      PACKAGE: '',
      TRIGGER: '',
      SYNONYM: '',
      TYPE: '',
    },

    filterValue: {
      TABLE: [],
      VIEW: [],
      FUNCTION: [],
      PROCEDURE: [],
      SEQUENCE: [],
      PACKAGE: [],
      TRIGGER: [],
      SYNONYM: [],
      TYPE: [],
    },

    addTreeNodeType: null,
  };

  handleRefreshTable = async () => {
    const session = await this.props.sessionManagerStore.getMasterSession();
    await session.database.getTableList();
  };

  handleRefreshFunction = async () => {
    const session = await this.props.sessionManagerStore.getMasterSession();
    await session.database.getFunctionList();
  };

  handleRefreshPackage = async () => {
    const session = await this.props.sessionManagerStore.getMasterSession();
    await session.database.getPackageList();
  };

  handleRefreshProcedure = async () => {
    const session = await this.props.sessionManagerStore.getMasterSession();
    await session.database.getProcedureList();
  };

  handleRefreshSequence = async () => {
    const session = await this.props.sessionManagerStore.getMasterSession();
    await session.database.getSequenceList();
  };

  handleRefreshView = async () => {
    const session = await this.props.sessionManagerStore.getMasterSession();
    await session.database.getViewList();
  };

  handleRefreshTrigger = async () => {
    const session = await this.props.sessionManagerStore.getMasterSession();
    await session.database.getTriggerList();
  };

  handleRefreshSynonym = async () => {
    const session = await this.props.sessionManagerStore.getMasterSession();
    await session.database.getSynonymList();
  };

  handleChangeSynonymType = async (key: SynonymType) => {
    // const { schemaStore } = this.props;
    // await schemaStore.changeSynonymType(key);
    // this.handleRefreshSynonym(schemaStore);
  };

  handleFilterChange = (value: string[]) => {
    const { activeResource } = this.props;
    const { filterValue } = this.state;
    this.setState({
      filterValue: { ...filterValue, [activeResource]: value },
    });
  };

  handleRefreshType = async () => {
    const session = await this.props.sessionManagerStore.getMasterSession();
    await session.database.getTypeList();
  };

  private readonly TAB_PANELS: {
    key: ResourceTabKey;
    title: string;
    TreeRoot: React.ComponentType<any>;
    handleRefresh: () => Promise<void>;
    searchTitle: string;
    searchPlaceholder: string;
  }[] = [
    {
      key: ResourceTabKey.TABLE,
      title: formatMessage({ id: 'odc.components.ResourceTree.Table' }), // 表
      TreeRoot: TableTree,
      handleRefresh: this.handleRefreshTable,
      searchTitle: formatMessage({
        id: 'workspace.tree.table',
      }),

      searchPlaceholder: formatMessage({
        id: 'workspace.tree.table.search.placeholder',
      }),
    },

    {
      key: ResourceTabKey.VIEW,
      title: formatMessage({ id: 'odc.components.ResourceTree.View' }), // 视图
      TreeRoot: ViewTree,
      handleRefresh: this.handleRefreshView,
      searchTitle: formatMessage({
        id: 'workspace.tree.view',
      }),

      searchPlaceholder: formatMessage({
        id: 'workspace.tree.view.search.placeholder',
      }),
    },

    {
      key: ResourceTabKey.FUNCTION,
      title: formatMessage({ id: 'odc.components.ResourceTree.Function' }), // 函数
      TreeRoot: FunctionTree,
      handleRefresh: this.handleRefreshFunction,
      searchTitle: formatMessage({
        id: 'workspace.tree.function',
      }),

      searchPlaceholder: formatMessage({
        id: 'workspace.window.createFunction.funName.placeholder',
      }),
    },

    {
      key: ResourceTabKey.PROCEDURE,
      title: formatMessage({
        id: 'odc.components.ResourceTree.StoredProcedure',
      }),
      // 存储过程
      TreeRoot: ProcedureTree,
      handleRefresh: this.handleRefreshProcedure,
      searchTitle: formatMessage({
        id: 'workspace.tree.procedure',
      }),

      searchPlaceholder: formatMessage({
        id: 'workspace.window.createProcedure.proName.placeholder',
      }),
    },

    {
      key: ResourceTabKey.SEQUENCE,
      title: formatMessage({ id: 'odc.components.ResourceTree.Sequence' }), // 序列
      TreeRoot: SequenceTree,
      handleRefresh: this.handleRefreshSequence,
      searchTitle: formatMessage({
        id: 'workspace.tree.sequence',
      }),

      searchPlaceholder: formatMessage({
        id: 'workspace.window.createSequence.name.placeholder',
      }),
    },

    {
      key: ResourceTabKey.PACKAGE,
      title: formatMessage({ id: 'odc.components.ResourceTree.Package' }), // 程序包
      TreeRoot: PackageTree,
      handleRefresh: this.handleRefreshPackage,
      searchTitle: formatMessage({
        id: 'workspace.tree.package',
      }),

      searchPlaceholder: formatMessage({
        id: 'workspace.window.createPackage.packageName.placeholder',
      }),
    },

    {
      key: ResourceTabKey.SYNONYM,
      title: formatMessage({ id: 'odc.components.ResourceTree.Synonyms' }), // 同义词
      TreeRoot: SynonymTree,
      handleRefresh: this.handleRefreshSynonym,
      searchTitle: formatMessage({
        id: 'odc.components.ResourceTree.Synonyms',
      }),
      // 同义词
      searchPlaceholder: formatMessage({
        id: 'odc.components.ResourceTree.EnterASynonymName',
      }),
      // 请输入同义词名称
    },
    {
      key: ResourceTabKey.TRIGGER,
      title: formatMessage({ id: 'odc.components.ResourceTree.Trigger' }), // 触发器
      TreeRoot: TriggerTree,
      handleRefresh: this.handleRefreshTrigger,
      searchTitle: formatMessage({ id: 'odc.components.ResourceTree.Trigger' }), // 触发器
      searchPlaceholder: formatMessage({
        id: 'odc.components.ResourceTree.EnterATriggerName',
      }),
      // 请输入触发器名称
    },
    {
      key: ResourceTabKey.TYPE,
      title: formatMessage({ id: 'odc.components.ResourceTree.Type' }), // 类型
      TreeRoot: TypeTree,
      handleRefresh: this.handleRefreshType,
      searchTitle: formatMessage({ id: 'odc.components.ResourceTree.Type' }), // 类型
      searchPlaceholder: formatMessage({
        id: 'odc.components.ResourceTree.EnterATypeName',
      }),
      // 请输入类型名称
    },
  ];

  public handleRefreshTree = async (activeKey: ResourceTabKey) => {
    const activePanelData = this.TAB_PANELS.find((item) => item.key === activeKey);
    if (!activePanelData) return;
    this.setState({
      loading: true,
    });

    await activePanelData.handleRefresh();
    this.setState({
      loading: false,
    });
  }; // todo 命名规范 -- create更合理！！！
  // 新建场景开启，详见ResourceTabKey

  private handleAddTreeNode = (activeKey: ResourceTabKey) => {
    switch (activeKey) {
      case ResourceTabKey.TABLE: {
        openCreateTablePage();
        break;
      }
      case ResourceTabKey.SEQUENCE: {
        this.props.modalStore.changeCreateSequenceModalVisible(true);
        break;
      }
      case ResourceTabKey.VIEW: {
        openCreateViewPage();
        break;
      }
      case ResourceTabKey.TRIGGER: {
        openCreateTriggerPage();
        break;
      }
      case ResourceTabKey.FUNCTION: {
        this.props.modalStore.changeCreateFunctionModalVisible(true);
        break;
      }
      case ResourceTabKey.PROCEDURE: {
        this.props.modalStore.changeCreateProcedureModalVisible(true);
        break;
      }
      default: {
        this.setState({
          addTreeNodeType: activeKey,
        });
      }
    }
  }; // 新建场景结束

  private handleCloseAddTreeNode = (callback?: () => void) => {
    this.setState(
      {
        addTreeNodeType: null,
      },

      () => {
        if (typeof callback === 'function') callback();
      },
    );
  };

  public render() {
    const { activeResource, sessionManagerStore } = this.props;
    const { loading, searchKey, filterValue, addTreeNodeType } = this.state;
    const activePanelData =
      this.TAB_PANELS.find((item) => item.key === activeResource) || ({} as any);
    const { searchTitle = '', searchPlaceholder = '' } = activePanelData;
    const session = sessionManagerStore.getMasterSession();
    return (
      <div className={styles.resourceTree}>
        <TreeSearchBar
          title={searchTitle}
          placeholder={searchPlaceholder}
          value={searchKey[activeResource]}
          filterValue={filterValue[activeResource]}
          activeResource={activeResource}
          onRefreshTree={() => {
            return this.handleRefreshTree(activeResource);
          }}
          onAddTreeNode={() => {
            this.handleAddTreeNode(activeResource);
          }}
          onSearchTreeNode={(key: string) => {
            const activeKeys = { ...searchKey, [activeResource]: key };
            this.setState({
              searchKey: activeKeys,
            });
          }}
          onChangeSynonymType={this.handleChangeSynonymType}
          onFilterChange={this.handleFilterChange}
        />

        <Tabs
          type="card"
          defaultActiveKey={activeResource}
          activeKey={activeResource}
          animated={false}
          tabBarStyle={{
            display: 'none',
          }}
        >
          {this.TAB_PANELS.map((tabPanel) => {
            const { key, title, TreeRoot } = tabPanel;
            return (
              <Tabs.TabPane tab={title} key={key}>
                <TreeRoot
                  key={session.sessionId}
                  loading={loading}
                  searchKey={searchKey}
                  filterValue={filterValue[activeResource]}
                  addTreeNodeType={addTreeNodeType}
                  handleCloseAddTreeNode={this.handleCloseAddTreeNode}
                  handleAddTreeNode={this.handleAddTreeNode}
                  handleRefreshTree={this.handleRefreshTree}
                />
              </Tabs.TabPane>
            );
          })}
        </Tabs>
      </div>
    );
  }
}

export default ResourceTree;
