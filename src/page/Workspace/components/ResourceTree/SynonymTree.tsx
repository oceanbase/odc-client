import CreateSynonymModal from '@/component/CreateSynonymModal';
import { PLType } from '@/constant/plType';
import {
  DbObjectType,
  ISynonym,
  ITreeNode,
  ResourceTabKey,
  ResourceTreeNodeMenuKeys,
  SynonymType,
} from '@/d.ts';
import { ConnectionStore } from '@/store/connection';
import { openCreateSynonymPage, openSynonymViewPage } from '@/store/helper/page';
import modal from '@/store/modal';
import { PageStore } from '@/store/page';
import { SchemaStore } from '@/store/schema';
import { formatMessage } from '@/util/intl';
import { downloadPLDDL } from '@/util/sqlExport';
import { QuestionCircleFilled } from '@ant-design/icons';
import { message, Modal, Spin } from 'antd';
import { inject, observer } from 'mobx-react';
import { MenuInfo } from 'rc-menu/lib/interface';
import { Component } from 'react';
import TreeNodeDirectory, { injectCustomInfoToTreeData } from './component/TreeNodeDirectory';
import TREE_NODES from './config';
import styles from './index.less';

@inject('pageStore', 'schemaStore', 'connectionStore', 'sqlStore')
@observer
export default class SynonymTree extends Component<{
  pageStore?: PageStore;
  schemaStore?: SchemaStore;
  connectionStore?: ConnectionStore;
  loading: boolean;
  searchKey: { [key in ResourceTabKey]: string };
  addTreeNodeType: ResourceTabKey;
  handleCloseAddTreeNode: (callback?: () => void) => void;
  handleAddTreeNode: (e: ResourceTabKey) => void;
  handleRefreshTree: (e: ResourceTabKey) => Promise<void>;
}> {
  componentDidMount() {
    this.props.schemaStore.getSynonymList();
  }

  public handleBrowserSchema = (node: ITreeNode) => {
    const {
      schemaStore: { synonymType },
    } = this.props;
    const { origin } = node;
    const synonym: Partial<ISynonym> = origin;
    openSynonymViewPage(synonym.synonymName, synonymType);
  };

  public handleDeleteSynonym = (synonymName: string) => {
    const { schemaStore, pageStore, handleRefreshTree } = this.props;
    Modal.confirm({
      title: formatMessage(
        {
          id: 'odc.components.ResourceTree.SynonymTree.AreYouSureYouWant',
        },
        { synonymName },
      ), // `确定要删除同义词${synonymName}吗？`
      okText: formatMessage({ id: 'app.button.ok' }),

      cancelText: formatMessage({
        id: 'app.button.cancel',
      }),

      centered: true,
      icon: <QuestionCircleFilled />,
      onOk: async () => {
        const isSuccess = await schemaStore?.deleteSynonym(synonymName);
        if (!isSuccess) {
          return;
        }
        await handleRefreshTree(ResourceTabKey.SYNONYM);
        message.success(
          formatMessage({
            id: 'odc.components.ResourceTree.SynonymTree.SynonymDeletedSuccessfully',
          }),
          // 删除同义词成功
        );
        // TODO：如果当前有视图详情页面，需要关闭

        const openedPage = pageStore?.pages.find((p) => p.params.synonymName === synonymName);

        if (openedPage) {
          pageStore?.close(openedPage.key);
        }
      },
    });
  };

  handleOpenCreateSynonymPage = () => {
    this.props.handleAddTreeNode(ResourceTabKey.SYNONYM);
  };

  handleRefresh = () => {
    this.props.handleRefreshTree(ResourceTabKey.SYNONYM);
  };

  public handleCreateSynonym = async (synonym: ISynonym) => {
    const { schemaStore, handleCloseAddTreeNode } = this.props;
    const sql = await schemaStore.getSynonymCreateSQL(synonym.synonymName, synonym);
    if (sql) {
      handleCloseAddTreeNode(() => {
        openCreateSynonymPage(sql, synonym.synonymType);
      });
    }
  };

  handleSynonymClick = (e: MenuInfo, node: ITreeNode) => {
    const { origin } = node;
    const synonym: Partial<ISynonym> = origin;
    const synonymName = synonym.synonymName || '';

    switch (e.key) {
      case ResourceTreeNodeMenuKeys.BROWSER_SCHEMA:
        this.handleBrowserSchema(node);
        break;

      case ResourceTreeNodeMenuKeys.CREATE_SYNONYM:
        this.handleOpenCreateSynonymPage();
        break;

      case ResourceTreeNodeMenuKeys.DELETE_SYNONYM:
        this.handleDeleteSynonym(synonymName);
        break;

      case ResourceTreeNodeMenuKeys.REFRESH_SYNONYM:
        this.handleRefresh();
        break;
      case ResourceTreeNodeMenuKeys.DOWNLOAD: {
        this.downloadDDL(synonymName);
        break;
      }
      case ResourceTreeNodeMenuKeys.EXPORT_TABLE: {
        modal.changeExportModal(true, {
          type:
            this.props.schemaStore.synonymType === SynonymType.PUBLIC
              ? DbObjectType.public_synonym
              : DbObjectType.synonym,
          name: synonymName,
        });
        break;
      }
      default:
    }
  }; // 序列数据 > 树结构数据
  downloadDDL = async (name: string) => {
    const { schemaStore } = this.props;
    const obj = await schemaStore.getSynonym(name, schemaStore.synonymType);
    if (obj) {
      downloadPLDDL(name, PLType.SYNONYM, obj.ddl);
    }
  };
  private getTreeList = () => {
    const {
      schemaStore: { synonyms },
      searchKey,
    } = this.props;
    const treeNodes: ITreeNode[] = [];
    const filteredSynonyms =
      (synonyms &&
        synonyms.filter(
          (f: Partial<ISynonym>) =>
            f &&
            f.synonymName &&
            f.synonymName
              .toString()
              .toUpperCase()
              .indexOf(searchKey[ResourceTabKey.SYNONYM].toUpperCase()) > -1,
        )) ||
      []; // todo 树形构造；

    filteredSynonyms.forEach((synonym: Partial<ISynonym>, index: number) => {
      treeNodes.push(
        TREE_NODES.SYNONYM.getConfig(synonym, {
          key: `synonyms-${synonym.synonymName}-${index}`,
        }),
      );
    });
    injectCustomInfoToTreeData(treeNodes);
    return treeNodes;
  };

  public render() {
    const {
      connectionStore: { sessionId },
      loading,
      addTreeNodeType,
      handleCloseAddTreeNode,
    } = this.props;
    return (
      <>
        <Spin spinning={loading} wrapperClassName={styles.synonymTree}>
          <TreeNodeDirectory
            showIcon={false}
            treeList={this.getTreeList()}
            loadedKeys={[]}
            onDoubleClick={this.handleBrowserSchema}
            onMenuClick={this.handleSynonymClick}
            getWrapperInstance={() => this}
          />
        </Spin>
        <CreateSynonymModal
          model={{}}
          sessionId={sessionId}
          visible={addTreeNodeType === ResourceTabKey.SYNONYM}
          schemaStore={this.props.schemaStore}
          onCancel={handleCloseAddTreeNode}
          onSave={this.handleCreateSynonym}
        />
      </>
    );
  }
}
