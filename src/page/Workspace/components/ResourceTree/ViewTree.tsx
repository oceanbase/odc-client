import { copyObj } from '@/component/TemplateInsertModal';
import {
  DbObjectType,
  DragInsertType,
  ITreeNode,
  IView,
  ResourceTabKey,
  ResourceTreeNodeMenuKeys,
  TableTreeNode,
} from '@/d.ts';
import { ConnectionStore } from '@/store/connection';
import { openCreateViewPage, openViewViewPage } from '@/store/helper/page';
import modal from '@/store/modal';
import { PageStore } from '@/store/page';
import { SchemaStore } from '@/store/schema';
import { formatMessage } from '@/util/intl';
import { downloadPLDDL } from '@/util/sqlExport';
import { QuestionCircleFilled } from '@ant-design/icons';
import { message, Modal, Spin } from 'antd';
import { AntTreeNode } from 'antd/lib/tree';
import { isEmpty } from 'lodash';
import { inject, observer } from 'mobx-react';
import { MenuInfo } from 'rc-menu/lib/interface';
import React, { Component } from 'react';
import { PropsTab, TopTab } from '../ViewPage';
import TreeNodeDirectory, { injectCustomInfoToTreeData } from './component/TreeNodeDirectory';
import TREE_NODES from './config';

@inject('pageStore', 'schemaStore', 'connectionStore')
@observer
export default class ViewTree extends Component<{
  pageStore?: PageStore;
  schemaStore?: SchemaStore;
  connectionStore?: ConnectionStore;
  loading: boolean;
  searchKey: {
    [key in ResourceTabKey]: string;
  };
  addTreeNodeType: ResourceTabKey;
  handleCloseAddTreeNode: (callback?: () => void) => void;
  handleAddTreeNode: (e: ResourceTabKey) => void;
  handleRefreshTree: (e: ResourceTabKey) => Promise<void>;
}> {
  private boxRef = React.createRef<HTMLDivElement>();

  componentDidMount() {
    if (!this.props.schemaStore.views?.length) {
      this.props.schemaStore.getViewList();
    }
  }

  public handleBrowserSchema = (viewName: string, topTab: TopTab) => {
    openViewViewPage(viewName, topTab);
  };

  public handleBrowserDDL = (viewName: string, propsTab: PropsTab) => {
    openViewViewPage(viewName, TopTab.PROPS, propsTab);
  };

  public handleBrowserColumns = (viewName: string) => {
    openViewViewPage(viewName, TopTab.PROPS, PropsTab.COLUMN);
  };

  public handleLoadTreeNodes = async (treeNode: AntTreeNode) => {
    const { schemaStore } = this.props;
    const { type, root } = treeNode.props.dataRef;
    const view = root.origin;

    // 已经有子节点，直接返回
    if (type !== TableTreeNode.TABLE && !isEmpty(treeNode.props.children)) {
      schemaStore!.setLoadedViewKeys(
        schemaStore!.loadedViewKeys.concat(treeNode.props.eventKey as string),
      );

      return;
    }

    if (type === TableTreeNode.COLUMN && view) {
      await schemaStore!.loadViewColumns(view.viewName);
    }
    schemaStore!.setLoadedViewKeys(
      schemaStore!.loadedViewKeys.concat(treeNode.props.eventKey as string),
    );
  };

  public handleRefreshColumns = async (viewName: string) => {
    const { schemaStore } = this.props;
    await schemaStore!.loadViewColumns(viewName);
  };

  public handleDeleteView = (viewName: string) => {
    const { schemaStore, pageStore, handleRefreshTree } = this.props;
    Modal.confirm({
      title: formatMessage({ id: 'workspace.window.createView.model.delete' }, { name: viewName }),
      okText: formatMessage({ id: 'app.button.ok' }),
      cancelText: formatMessage({ id: 'app.button.cancel' }),
      icon: <QuestionCircleFilled />,
      centered: true,
      onOk: async () => {
        const isSuccess = await schemaStore!.deleteView(viewName);
        if (!isSuccess) {
          return;
        }
        await handleRefreshTree(ResourceTabKey.VIEW);
        message.success(
          formatMessage({
            id: 'odc.components.ResourceTree.ViewTree.TheViewHasBeenDeleted',
          }),
        );

        // TODO：如果当前有视图详情页面，需要关闭
        const openedPage = pageStore!.pages.find((p) => p.params.viewName === viewName);
        if (openedPage) {
          pageStore!.close(openedPage.key);
        }
      },
    });
  };

  handleShowCreateViewModal = () => {
    this.props.handleAddTreeNode(ResourceTabKey.VIEW);
  };

  private getTreeList = () => {
    const {
      schemaStore: { views, dataTypes },
      searchKey,
    } = this.props;
    const treeNodes: ITreeNode[] = [];

    const filteredTables =
      (views &&
        views.filter(
          (v) =>
            v &&
            v.viewName &&
            v.viewName
              .toString()
              .toUpperCase()
              .indexOf(searchKey[ResourceTabKey.VIEW].toUpperCase()) > -1,
        )) ||
      [];

    filteredTables.forEach((view: any, index: number) => {
      treeNodes.push(
        TREE_NODES.VIEW.getConfig(view, {
          key: `view-${index}`,
          type: DbObjectType.view,
          dataTypes,
        }),
      );
    });
    injectCustomInfoToTreeData(treeNodes);
    return treeNodes;
  };

  handleTreeNodeMenuClick = (e: MenuInfo, node: ITreeNode) => {
    const {
      root: { origin },
    } = node;
    const view: Partial<IView> = origin;
    switch (e.key) {
      case ResourceTreeNodeMenuKeys.BROWSER_SCHEMA:
        this.handleBrowserSchema(view.viewName, TopTab.PROPS);
        break;
      case ResourceTreeNodeMenuKeys.BROWSER_DATA:
        this.handleBrowserSchema(view.viewName, TopTab.DATA);
        break;
      case ResourceTreeNodeMenuKeys.CREATE_VIEW:
        openCreateViewPage();
        // this.handleShowCreateViewModal();
        break;
      case ResourceTreeNodeMenuKeys.BROWSER_DDL:
        this.handleBrowserDDL(view.viewName, PropsTab.DDL);
        break;
      case ResourceTreeNodeMenuKeys.COPY_NAME:
        copyObj(view?.viewName, DbObjectType.view, DragInsertType.NAME);
        break;
      case ResourceTreeNodeMenuKeys.COPY_SELECT:
        copyObj(view?.viewName, DbObjectType.view, DragInsertType.SELECT);
        break;
      case ResourceTreeNodeMenuKeys.COPY_INSERT:
        copyObj(view?.viewName, DbObjectType.view, DragInsertType.INSERT);
        break;
      case ResourceTreeNodeMenuKeys.COPY_UPDATE:
        copyObj(view?.viewName, DbObjectType.view, DragInsertType.UPDATE);
        break;
      case ResourceTreeNodeMenuKeys.COPY_DELETE:
        copyObj(view?.viewName, DbObjectType.view, DragInsertType.DELETE);
        break;
      case ResourceTreeNodeMenuKeys.DELETE_TABLE:
        this.handleDeleteView(view.viewName);
        break;
      case ResourceTreeNodeMenuKeys.BROWSER_COLUMNS:
        this.handleBrowserColumns(view.viewName);
        break;
      // 目前不支持该功能
      case ResourceTreeNodeMenuKeys.CREATE_COLUMN:
        break;
      case ResourceTreeNodeMenuKeys.REFRESH_COLUMNS:
        this.handleRefreshColumns(view.viewName);
        break;
      case ResourceTreeNodeMenuKeys.DOWNLOAD: {
        this.downloadTable(view.viewName);
        break;
      }
      case ResourceTreeNodeMenuKeys.EXPORT_TABLE: {
        modal.changeExportModal(true, {
          type: DbObjectType.view,
          name: view.viewName,
        });
        break;
      }
      // 目前不支持该功能
      case ResourceTreeNodeMenuKeys.EDIT_COLUMN:
        break;
      case ResourceTreeNodeMenuKeys.DELETE_COLUMN:
        break;
      default:
    }
  };
  downloadTable = async (viewName: string) => {
    const { schemaStore } = this.props;
    const view = await schemaStore.getView(viewName);
    if (view) {
      downloadPLDDL(viewName, 'VIEW', view.ddl);
    }
  };

  handleTreeNodeDoubleClick = (node: ITreeNode) => {
    const {
      menu: { type },
      root: { origin },
    } = node;
    const view: Partial<IView> = origin;
    switch (type) {
      case DbObjectType.view:
        this.handleBrowserSchema(view.viewName, TopTab.PROPS);
        break;
      case 'tableColumnSet':
        this.handleBrowserColumns(view.viewName);
        break;
      case 'tableColumn':
        this.handleBrowserColumns(view.viewName);
        break;
      default:
    }
  };

  public render() {
    const {
      schemaStore: { loadedViewKeys },
      loading,
      addTreeNodeType,
      handleCloseAddTreeNode,
    } = this.props;

    return (
      <>
        <Spin spinning={loading}>
          <TreeNodeDirectory
            showIcon={false}
            treeList={this.getTreeList()}
            loadedKeys={loadedViewKeys}
            handleLoadTreeData={this.handleLoadTreeNodes}
            onDoubleClick={this.handleTreeNodeDoubleClick}
            onMenuClick={this.handleTreeNodeMenuClick}
            getWrapperInstance={() => this}
          />
        </Spin>
      </>
    );
  }
}
