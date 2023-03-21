import { IFunction, ITreeNode, ResourceTabKey } from '@/d.ts';
import { ConnectionStore } from '@/store/connection';
import { PageStore } from '@/store/page';
import { SchemaStore } from '@/store/schema';
import { Spin } from 'antd';
import { AntTreeNode } from 'antd/lib/tree';
import { inject, observer } from 'mobx-react';
import { MenuInfo } from 'rc-menu/lib/interface';
import { Component } from 'react';
import TREE_NODE_ACTIONS from './actions';
import TreeNodeDirectory, { injectCustomInfoToTreeData } from './component/TreeNodeDirectory';
import TREE_NODES from './config';

@inject('pageStore', 'schemaStore', 'connectionStore', 'sqlStore')
@observer
export default class FunctionTree extends Component<{
  pageStore?: PageStore;
  schemaStore?: SchemaStore;
  connectionStore?: ConnectionStore;
  loading: boolean;
  filterValue: string[];
  searchKey: {
    [key in ResourceTabKey]: string;
  };
  handleRefreshTree: (e: ResourceTabKey) => void;
}> {
  componentDidMount() {
    if (!this.props.schemaStore.functions?.length) {
      this.props.schemaStore.getFunctionList();
    }
  }

  // 程序包数据 > 树结构数据
  private packages2TreeList = () => {
    const {
      schemaStore: { functions },
      filterValue,
    } = this.props;
    const { searchKey } = this.props;
    const treeNodes: ITreeNode[] = [];

    const filterfunctons =
      (functions &&
        functions
          .filter(
            (f: Partial<IFunction>) =>
              f &&
              f.funName &&
              f.funName
                .toString()
                .toUpperCase()
                .indexOf(searchKey[ResourceTabKey.FUNCTION].toUpperCase()) > -1,
          )
          .filter(({ status }) => (filterValue.length ? filterValue.includes(status) : true))) ||
      [];

    filterfunctons.forEach((func: any) => {
      treeNodes.push(TREE_NODES.PACKAGE_FUNCTION.getConfig(func, null, func));
    });
    injectCustomInfoToTreeData(treeNodes);
    return treeNodes;
  };

  private handleLoadTreeData = async (treeNode: AntTreeNode) => {
    const { dataRef: nodeData } = treeNode.props;
    const {
      schemaStore,
      schemaStore: { functions },
    } = this.props;
    if (nodeData.type !== 'FUNCTION') {
      return;
    }

    // 非根节点不用加载数据
    if (nodeData.type !== 'FUNCTION') {
      return;
    }

    // 有数据也无需加载
    if (nodeData.ddl) {
      return;
    }
    // 若对应的对象不存在，无需加载
    if (
      nodeData.type === 'FUNCTION' &&
      !functions.find((item: IFunction) => item.funName === nodeData.title)
    ) {
      return;
    }

    await schemaStore?.loadFunction(nodeData.title);
    schemaStore.setLoadedFunctionKeys([...schemaStore.loadedFunctionKeys, nodeData.key]);
    return;
  };

  private handleTreeNodeMenuClick = async (e: MenuInfo) => {
    e.domEvent.preventDefault();
    e.domEvent.stopPropagation();
    const actionKey = e.key;
    const treeNode = (e.item as any).props.dataRef;
    await TREE_NODE_ACTIONS[actionKey].action(this, treeNode);
  };

  public render() {
    const { loading } = this.props;
    const { loadedFunctionKeys } = this.props.schemaStore || {};
    return (
      <>
        <Spin spinning={loading}>
          <TreeNodeDirectory
            treeList={this.packages2TreeList()}
            loadedKeys={loadedFunctionKeys}
            handleLoadTreeData={this.handleLoadTreeData}
            onDoubleClick={(node) => {
              TREE_NODE_ACTIONS.OVERVIEW.action(this, node);
            }}
            onMenuClick={this.handleTreeNodeMenuClick}
            getWrapperInstance={() => this}
          />
        </Spin>
      </>
    );
  }
}
