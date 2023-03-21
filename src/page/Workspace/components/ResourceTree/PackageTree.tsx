import CreatePackageModal from '@/component/CreatePackageModal';
import SelectPackagePLModal from '@/component/SelectPackagePLModal';
import { enablePackageDebug } from '@/constant';
import plType from '@/constant/plType';
import { IPackage, ResourceTabKey } from '@/d.ts';
import { ConnectionStore } from '@/store/connection';
import { openCreatePackagePage, openFunctionOrProcedureFromPackage } from '@/store/helper/page';
import { PageStore } from '@/store/page';
import { SchemaStore } from '@/store/schema';
import { Spin } from 'antd';
import { AntTreeNode } from 'antd/lib/tree';
import EventBus from 'eventbusjs';
import { inject, observer } from 'mobx-react';
import { MenuInfo } from 'rc-menu/lib/interface';
import { Component } from 'react';
import TREE_NODE_ACTIONS from './actions';
import TreeNodeDirectory, { injectCustomInfoToTreeData } from './component/TreeNodeDirectory';
import TREE_NODES from './config';

@inject('pageStore', 'schemaStore', 'connectionStore', 'sqlStore')
@observer
export default class ProcedureTree extends Component<
  {
    pageStore?: PageStore;
    schemaStore?: SchemaStore;
    connectionStore?: ConnectionStore;
    loading: boolean;
    filterValue: string[];
    searchKey: {
      [key in ResourceTabKey]: string;
    };
    addTreeNodeType: ResourceTabKey;
    handleCloseAddTreeNode: (callback?: () => void) => void;
    handleAddTreeNode: (e: ResourceTabKey) => void;
    handleRefreshTree: (e: ResourceTabKey) => void;
  },
  {
    showModalSelectPL: boolean;
    action: string;
    plList: any[];
  }
> {
  public disableDebug = !enablePackageDebug;

  public readonly state = {
    showModalSelectPL: false,
    action: '',
    plList: [],
  };

  componentDidMount() {
    if (
      !this.props.schemaStore.packages?.filter?.((p) => {
        return !p.singleLoad;
      })?.length
    ) {
      this.props.schemaStore.getPackageList();
    }
  }

  public handleCreatePackage = async (pkg: IPackage) => {
    const { packageName } = pkg;
    const { schemaStore } = this.props;
    const sql = await schemaStore?.getPackageCreateSQL(packageName);
    // await schemaStore?.createPackage(packageName);
    // await this.handleRefreshPackageList();
    this.props.handleCloseAddTreeNode(() => {
      openCreatePackagePage(sql);
    });
  };

  private getSearchedPackages = () => {
    const { packages = [] } = this.props.schemaStore || {};
    const { searchKey, filterValue } = this.props;
    return packages
      ?.filter?.((pkg: any) => {
        const { packageName } = pkg;
        return (
          packageName.toUpperCase().indexOf(searchKey[ResourceTabKey.PACKAGE].toUpperCase()) > -1
        );
      })
      ?.filter(({ status }) => (filterValue.length ? filterValue.includes(status) : true));
  };

  // 程序包数据 > 树结构数据
  private packages2TreeList = () => {
    const packages = this.getSearchedPackages();
    const treeNodes: any = [];
    packages.forEach((pkg: any) => {
      treeNodes.push(TREE_NODES.PACKAGE_ROOT.getConfig(pkg, null, pkg));
    });
    injectCustomInfoToTreeData(treeNodes);
    return treeNodes;
  };

  private handleLoadTreeData = async (treeNode: AntTreeNode) => {
    const { dataRef: nodeData, eventKey } = treeNode.props;
    const {
      schemaStore,
      schemaStore: { packages },
    } = this.props;
    // 非根节点不用加载数据
    if (nodeData.type !== 'PACKAGE_ROOT') {
      schemaStore.setLoadedPackageKeys([...schemaStore.loadedPackageKeys, eventKey]);
      return;
    }
    // 有数据也无需加载
    const packageHeaderData = nodeData.children.find((item: any) => item.type === 'PACKAGE_HEAD');
    // 通过包头是否有数据，作为包是否有数据的判断
    const isPackageHasData = packageHeaderData?.children?.length;
    if (isPackageHasData) {
      return;
    }
    // 若对应的对象不存在，无需加载
    if (
      nodeData.type === 'PACKAGE_ROOT' &&
      !packages.find((item: IPackage) => item.packageName === nodeData.title)
    ) {
      return;
    }

    try {
      await schemaStore?.loadPackage(nodeData.key);
    } catch (e) {
      console.error(e);
    } finally {
      schemaStore.setLoadedPackageKeys([...schemaStore.loadedPackageKeys, nodeData.key]);
    }
  };

  private handleTreeNodeMenuClick = async (e: MenuInfo) => {
    e.domEvent.preventDefault();
    e.domEvent.stopPropagation();
    const actionKey = e.key;
    const treeNode = (e.item as any).props.dataRef;
    await TREE_NODE_ACTIONS[actionKey].action(this, treeNode);
  };

  public handleDebugPackagePL = async (data) => {
    const { schemaStore } = this.props;
    const { action } = this.state;
    const { packages = [] } = schemaStore;
    const { plName, packageName, obDbObjectType, key } = data;
    const targetPackage = packages.find((pkg) => pkg.packageName === packageName);
    const { functions = [], procedures = [] } = targetPackage.packageBody;
    let plSchema;
    if (obDbObjectType === plType.FUNCTION) {
      plSchema = functions.find((func) => func.key === key);
    }
    if (obDbObjectType === plType.PROCEDURE) {
      plSchema = procedures.find((pro) => pro.key === key);
    }

    plSchema.ddl = targetPackage.packageBody.basicInfo.ddl;
    plSchema.packageName = packageName;

    this.setState(
      {
        showModalSelectPL: false,
      },
      async () => {
        const scriptId = await openFunctionOrProcedureFromPackage(
          packageName,
          plName,
          obDbObjectType,
          plSchema,
        );
        setTimeout(() => {
          EventBus.dispatch('pageAction', null, {
            key: scriptId,
            params: { action: action || 'EXEC' },
          });
        });
      },
    );
  };

  public render() {
    const { showModalSelectPL, plList } = this.state;
    const { loading, addTreeNodeType, handleCloseAddTreeNode } = this.props;
    const { loadedPackageKeys } = this.props.schemaStore || {};
    return (
      <>
        <Spin spinning={loading}>
          <TreeNodeDirectory
            treeList={this.packages2TreeList()}
            loadedKeys={loadedPackageKeys}
            handleLoadTreeData={this.handleLoadTreeData}
            onDoubleClick={(node) => {
              TREE_NODE_ACTIONS.OVERVIEW.action(this, node);
            }}
            onMenuClick={this.handleTreeNodeMenuClick}
            getWrapperInstance={() => this}
          />
        </Spin>
        <CreatePackageModal
          model={{}}
          visible={addTreeNodeType === ResourceTabKey.PACKAGE}
          onCancel={handleCloseAddTreeNode}
          onSave={this.handleCreatePackage as any}
        />
        <SelectPackagePLModal
          visible={showModalSelectPL}
          plList={plList}
          onCancel={() => this.setState({ showModalSelectPL: false })}
          onSave={this.handleDebugPackagePL}
        />
      </>
    );
  }
}
