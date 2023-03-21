import { ITreeNode, ITrigger, PageType, ResourceTabKey, TriggerState } from '@/d.ts';
import { ConnectionStore } from '@/store/connection';
import { openCreateTriggerPage } from '@/store/helper/page';
import { PageStore } from '@/store/page';
import { SchemaStore } from '@/store/schema';
import { SQLStore } from '@/store/sql';
import { formatMessage } from '@/util/intl';
import { QuestionCircleFilled } from '@ant-design/icons';
import { message, Modal, Spin } from 'antd';
import { AntTreeNode } from 'antd/lib/tree';
import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import TREE_NODE_ACTIONS from './actions';
import TreeNodeDirectory, { injectCustomInfoToTreeData } from './component/TreeNodeDirectory'; // todo 触发器 启用与禁用 交互
import TREE_NODES from './config';
import styles from './index.less';

@inject('pageStore', 'schemaStore', 'connectionStore', 'sqlStore')
@observer
export default class TriggerTree extends Component<{
  pageStore?: PageStore;
  schemaStore?: SchemaStore;
  connectionStore?: ConnectionStore;
  sqlStore?: SQLStore;
  loading: boolean;
  filterValue: string[];
  searchKey: { [key in ResourceTabKey]: string };
  addTreeNodeType: ResourceTabKey;
  handleCloseAddTreeNode: () => void;
  handleAddTreeNode: (e: ResourceTabKey) => void;
  handleRefreshTree: (e: ResourceTabKey) => void;
}> {
  componentDidMount() {
    this.props.schemaStore.getTriggerList();
  }

  private handleStatusTrigger = (triggerName: string, enableState: TriggerState) => {
    this.props.schemaStore.setTriggerStatus(triggerName, enableState);
    this.props.pageStore.updatePageColor(triggerName, enableState === TriggerState.disabled);
  };

  public handleCreateTrigger = async () => {
    await openCreateTriggerPage();
    this.props.handleCloseAddTreeNode();
  };

  public handleDeleteTrigger = (node: any) => {
    const { schemaStore, pageStore, sqlStore } = this.props;
    const { title } = node;
    const PLRunningStatus = sqlStore.getRunningPL(node.title);

    if (PLRunningStatus) {
      message.info(
        formatMessage(
          {
            id: 'odc.ResourceTree.config.treeNodesActions.PlrunningstatusDoesNotSupportDeletion',
          },

          {
            PLRunningStatus,
          },
        ),
      );

      return;
    }

    Modal.confirm({
      title: formatMessage(
        {
          id: 'odc.components.ResourceTree.TriggerTree.AreYouSureYouWant',
        },
        { title },
      ), // `确定要删除触发器${title}吗？`
      okText: formatMessage({ id: 'app.button.ok' }),

      cancelText: formatMessage({
        id: 'app.button.cancel',
      }),

      centered: true,
      icon: <QuestionCircleFilled />,
      onOk: async () => {
        await schemaStore?.deleteTrigger(title); // todo 暂时保留，需要父级容器提供set loading 的能力！！！
        // this.setState({ loading: true });

        await schemaStore?.getTriggerList(); // this.setState({ loading: false });

        message.success(
          formatMessage({
            id: 'odc.components.ResourceTree.TriggerTree.DeletedSuccessfully',
          }),
          // 删除成功
        ); // TODO：如果当前有视图详情页面，需要关闭

        const openedPages = pageStore?.pages.filter(
          (p) => p.title === title && (p.type === PageType.TRIGGER || p.type === PageType.PL),
        );

        if (openedPages?.length) {
          openedPages.forEach((page) => pageStore.close(page.key));
        }
      },
    });
  };

  public handleRefreshTrigger = () => {
    this.props.schemaStore.getTriggerList();
  }; // 程序包数据 > 树结构数据

  private packages2TreeList = () => {
    const {
      schemaStore: { triggers },
      filterValue,
    } = this.props;
    const { searchKey } = this.props;
    const treeNodes: ITreeNode[] = [];
    const filterTrigger =
      (triggers &&
        triggers
          .filter(
            (f: Partial<ITrigger>) =>
              f &&
              f.triggerName &&
              f.triggerName
                .toString()
                .toUpperCase()
                .indexOf(searchKey[ResourceTabKey.TRIGGER].toUpperCase()) > -1,
          )
          .filter(({ status }) => (filterValue.length ? filterValue.includes(status) : true))) ||
      [];
    filterTrigger.forEach((trigger: any) => {
      treeNodes.push(TREE_NODES.TRIGGER.getConfig(trigger));
    });
    injectCustomInfoToTreeData(treeNodes);
    return treeNodes;
  };

  private handleLoadTreeData = async (treeNode: AntTreeNode) => {
    const { dataRef: nodeData } = treeNode.props;
    const { schemaStore } = this.props; // 有数据无需加载

    if (nodeData.ddl) {
      return;
    }

    await schemaStore?.getTrigger(nodeData.title);
  };

  private handleTreeNodeMenuClick = async (e) => {
    e.domEvent.preventDefault();
    e.domEvent.stopPropagation();
    const actionKey = e.key;
    const treeNode = e.item.props.dataRef;
    await TREE_NODE_ACTIONS[actionKey].action(this, treeNode);
  };

  public render() {
    const { loading, schemaStore } = this.props;
    return (
      <>
        <Spin spinning={loading} wrapperClassName={styles.triggerTree}>
          <TreeNodeDirectory
            treeList={this.packages2TreeList()}
            loadedKeys={[]}
            schemaStore={schemaStore}
            handleLoadTreeData={this.handleLoadTreeData}
            onDoubleClick={(node) => {
              TREE_NODE_ACTIONS.OVERVIEW_TRIGGER.action(this, node);
            }}
            onMenuClick={this.handleTreeNodeMenuClick}
            getWrapperInstance={() => this}
          />
        </Spin>
      </>
    );
  }
}
