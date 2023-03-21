import { IProcedure, ResourceTabKey } from '@/d.ts';
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
export default class ProcedureTree extends Component<{
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
    if (!this.props.schemaStore.procedures?.length) {
      this.props.schemaStore.getProcedureList();
    }
  }

  // 程序包数据 > 树结构数据
  private packages2TreeList = () => {
    const {
      schemaStore: { procedures },
      filterValue,
    } = this.props;
    const { searchKey } = this.props;

    const filterProcedures =
      (procedures &&
        procedures
          .filter(
            (p) =>
              p &&
              p.proName &&
              p.proName
                .toString()
                .toUpperCase()
                .indexOf(searchKey[ResourceTabKey.PROCEDURE].toUpperCase()) > -1,
          )
          .filter(({ status }) => (filterValue.length ? filterValue.includes(status) : true))) ||
      [];

    const treeNodes: any = [];
    filterProcedures.forEach((pro: any) => {
      treeNodes.push(TREE_NODES.PACKAGE_PROCEDURE.getConfig(pro, null, pro));
    });

    injectCustomInfoToTreeData(treeNodes);
    return treeNodes;
  };

  private handleLoadTreeData = async (treeNode: AntTreeNode) => {
    const {
      schemaStore,
      schemaStore: { procedures },
    } = this.props;
    const { dataRef: nodeData } = treeNode.props;

    // 非根节点不用加载数据
    if (nodeData.type !== 'PROCEDURE') {
      return;
    }

    // 有数据也无需加载
    if (nodeData.ddl) {
      return;
    }
    // 若对应的对象不存在，无需加载
    if (
      nodeData.type === 'PROCEDURE' &&
      !procedures.find((item: IProcedure) => item.proName === nodeData.title)
    ) {
      return;
    }

    await schemaStore?.loadProcedure(nodeData.title);
    schemaStore.setLoadedProcedureKeys([...schemaStore.loadedProcedureKeys, nodeData.key]);
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
    const { schemaStore } = this.props;

    return (
      <>
        <Spin spinning={loading}>
          <TreeNodeDirectory
            treeList={this.packages2TreeList()}
            loadedKeys={schemaStore.loadedProcedureKeys}
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
