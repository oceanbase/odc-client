import { deleteType, getTypeCreateSQL } from '@/common/network/type';
import CreateTypeModal from '@/component/CreateTypeModal';
import { IType, ITypeForm, PageType, ResourceTabKey } from '@/d.ts';
import { ConnectionStore } from '@/store/connection';
import { openCreateTypePage } from '@/store/helper/page';
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
import TreeNodeDirectory, { injectCustomInfoToTreeData } from './component/TreeNodeDirectory';
import TREE_NODES from './config';

@inject('pageStore', 'schemaStore', 'connectionStore', 'sqlStore')
@observer
export default class TypeTree extends Component<{
  pageStore?: PageStore;
  schemaStore?: SchemaStore;
  connectionStore?: ConnectionStore;
  sqlStore?: SQLStore;
  loading: boolean;
  filterValue: string[];
  searchKey: { [key in ResourceTabKey]: string };
  addTreeNodeType: ResourceTabKey;
  handleCloseAddTreeNode: (callback?: () => void) => void;
  handleAddTreeNode: (e: ResourceTabKey) => void;
  handleRefreshTree: (e: ResourceTabKey) => void;
}> {
  componentDidMount() {
    this.props.schemaStore.getTypeList();
  }

  private packages2TreeList = () => {
    const {
      schemaStore: { types },
      filterValue,
    } = this.props;
    const { searchKey } = this.props;
    const filterProcedures =
      (types &&
        types
          .filter(
            (p) =>
              p &&
              p.typeName &&
              p.typeName
                .toString()
                .toUpperCase()
                .indexOf(searchKey[ResourceTabKey.TYPE].toUpperCase()) > -1,
          )
          .filter(({ status }) => (filterValue.length ? filterValue.includes(status) : true))) ||
      [];
    const treeNodes: any = [];
    filterProcedures.forEach((pro: any) => {
      treeNodes.push(TREE_NODES.TYPE.getConfig(pro, null, pro));
    });
    injectCustomInfoToTreeData(treeNodes);
    return treeNodes;
  };

  private handleLoadTreeData = async (treeNode: AntTreeNode) => {
    const {
      schemaStore,
      schemaStore: { types },
    } = this.props;
    const { dataRef: nodeData } = treeNode.props; // 非根节点不用加载数据

    if (nodeData.type !== 'TYPE') {
      return;
    } // 有数据也无需加载

    if (nodeData.ddl) {
      return;
    }
    // 若对应的对象不存在，无需加载
    if (
      nodeData.type === 'TYPE' &&
      !types.find((item: IType) => item.typeName === nodeData.title)
    ) {
      return;
    }

    await schemaStore.loadType(nodeData.title);
    schemaStore.setLoadedTypeKeys([...schemaStore.loadedTypeKeys, nodeData.key]);
  };

  private handleTreeNodeMenuClick = async (e) => {
    e.domEvent.preventDefault();
    e.domEvent.stopPropagation();
    const actionKey = e.key;
    const treeNode = e.item.props.dataRef;
    await TREE_NODE_ACTIONS[actionKey].action(this, treeNode);
  };

  private handleCreateType = () => {
    this.props.handleAddTreeNode(ResourceTabKey.TYPE);
  };

  private handleTypeSave = async (type: ITypeForm) => {
    const { handleCloseAddTreeNode } = this.props;
    const sql = await getTypeCreateSQL(type.typeName, type);
    handleCloseAddTreeNode(() => {
      openCreateTypePage(sql);
    });
  };

  public handleDeleteType = (node: any) => {
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
          id: 'odc.components.ResourceTree.TypeTree.AreYouSureYouWant',
        },
        { title },
      ), // `确定要删除类型${title}吗？`
      okText: formatMessage({ id: 'app.button.ok' }),

      cancelText: formatMessage({
        id: 'app.button.cancel',
      }),

      centered: true,
      icon: <QuestionCircleFilled />,
      onOk: async () => {
        await deleteType(title); // todo 暂时保留，需要父级容器提供set loading 的能力！！！
        // this.setState({ loading: true });

        await schemaStore?.refreshTypeList(); // this.setState({ loading: false });

        message.success(
          formatMessage({
            id: 'odc.components.ResourceTree.TypeTree.DeletedSuccessfully',
          }),
          // 删除成功
        ); // TODO：如果当前有视图详情页面，需要关闭

        const openedPages = pageStore?.pages.filter(
          (p) => p.title === title && (p.type === PageType.TYPE || p.type === PageType.PL),
        );

        if (openedPages.length) {
          for (let p of openedPages) {
            await pageStore.close(p.key);
          }
        }
      },
    });
  };

  public render() {
    const { loading } = this.props;
    const { addTreeNodeType, handleCloseAddTreeNode } = this.props;
    return (
      <>
        <Spin spinning={loading}>
          <TreeNodeDirectory
            treeList={this.packages2TreeList()}
            handleLoadTreeData={this.handleLoadTreeData}
            onDoubleClick={(node) => {
              TREE_NODE_ACTIONS.OVERVIEW_TYPE.action(this, node);
            }}
            onMenuClick={this.handleTreeNodeMenuClick}
            getWrapperInstance={() => this}
          />
        </Spin>
        <CreateTypeModal
          model={{}}
          visible={addTreeNodeType === ResourceTabKey.TYPE}
          onCancel={handleCloseAddTreeNode}
          onSave={this.handleTypeSave}
        />
      </>
    );
  }
}
