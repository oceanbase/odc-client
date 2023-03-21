import {
  DbObjectType,
  ISequence,
  ITreeNode,
  ResourceTabKey,
  ResourceTreeNodeMenuKeys,
} from '@/d.ts';
import { ConnectionStore } from '@/store/connection';
import { openSequenceViewPage } from '@/store/helper/page';
import modal, { ModalStore } from '@/store/modal';
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

@inject('pageStore', 'schemaStore', 'connectionStore', 'sqlStore', 'modalStore')
@observer
export default class SequenceTree extends Component<{
  pageStore?: PageStore;
  schemaStore?: SchemaStore;
  connectionStore?: ConnectionStore;
  modalStore?: ModalStore;
  loading: boolean;
  searchKey: {
    [key in ResourceTabKey]: string;
  };
  addTreeNodeType: ResourceTabKey;
  handleCloseAddTreeNode: (callback?: () => void) => void;
  handleAddTreeNode: (e: ResourceTabKey) => void;
  handleRefreshTree: (e: ResourceTabKey) => Promise<void>;
}> {
  componentDidMount() {
    if (!this.props.schemaStore.sequences?.length) {
      this.props.schemaStore.getSequenceList();
    }
  }

  public handleBrowserSchema = (node: ITreeNode) => {
    const { origin } = node;
    const sequence: Partial<ISequence> = origin;
    openSequenceViewPage(sequence.name);
  };

  public handleDeleteSequence = (sequenceName: string) => {
    const { schemaStore, pageStore, handleRefreshTree } = this.props;
    Modal.confirm({
      title: formatMessage(
        { id: 'workspace.window.createSequence.modal.delete' },
        { name: sequenceName },
      ),
      okText: formatMessage({ id: 'app.button.ok' }),
      cancelText: formatMessage({ id: 'app.button.cancel' }),
      centered: true,
      icon: <QuestionCircleFilled />,
      onOk: async () => {
        await schemaStore?.deleteSequence(sequenceName);
        await handleRefreshTree(ResourceTabKey.SEQUENCE);
        message.success(
          formatMessage({
            id: 'workspace.window.createSequence.delete.success',
          }),
        );

        // TODO：如果当前有视图详情页面，需要关闭
        const openedPage = pageStore?.pages.find((p) => p.params.sequenceName === sequenceName);
        if (openedPage) {
          pageStore?.close(openedPage.key);
        }
      },
    });
  };

  public handleUpdateSequence = async (sequenceName: string) => {
    const sequence = await this.props.schemaStore.getSequence(sequenceName);
    if (sequence) {
      this.props.modalStore.changeCreateSequenceModalVisible(true, {
        isEdit: true,
        data: sequence,
      });
    }
  };

  handleOpenCreateSequencePage = () => {
    this.props.handleAddTreeNode(ResourceTabKey.SEQUENCE);
  };

  handleRefresh = () => {
    this.props.handleRefreshTree(ResourceTabKey.SEQUENCE);
  };

  handleSequenceClick = (e: MenuInfo, node: ITreeNode) => {
    const { origin } = node;
    const sequence: Partial<ISequence> = origin;
    const sequenceName = sequence.name || '';
    switch (e.key) {
      case ResourceTreeNodeMenuKeys.BROWSER_SCHEMA:
        this.handleBrowserSchema(node);
        break;
      case ResourceTreeNodeMenuKeys.CREATE_SEQUENCE:
        this.handleOpenCreateSequencePage();
        break;
      case ResourceTreeNodeMenuKeys.DELETE_SEQUENCE:
        this.handleDeleteSequence(sequenceName);
        break;
      case ResourceTreeNodeMenuKeys.UPDATE_SEQUENCE:
        this.handleUpdateSequence(sequenceName);
        break;
      case ResourceTreeNodeMenuKeys.REFRESH_SEQUENCE:
        this.handleRefresh();
        break;
      case ResourceTreeNodeMenuKeys.DOWNLOAD: {
        this.downloadDDL(sequenceName);
        break;
      }
      case ResourceTreeNodeMenuKeys.EXPORT_TABLE: {
        modal.changeExportModal(true, {
          type: DbObjectType.sequence,
          name: sequenceName,
        });
        break;
      }
      default:
    }
  };
  downloadDDL = async (name: string) => {
    const { schemaStore } = this.props;
    const obj = await schemaStore.getSequence(name);
    if (obj) {
      downloadPLDDL(name, 'SEQUENCE', obj.ddl);
    }
  };

  // 可以进一步 抽象
  // 序列数据 > 树结构数据
  private getTreeList = () => {
    const {
      schemaStore: { sequences },
      searchKey,
    } = this.props;
    const treeNodes: ITreeNode[] = [];
    const filteredSequences =
      (sequences &&
        sequences.filter(
          (f: Partial<ISequence>) =>
            f &&
            f.name &&
            f.name
              .toString()
              .toUpperCase()
              .indexOf(searchKey[ResourceTabKey.SEQUENCE].toUpperCase()) > -1,
        )) ||
      [];
    // todo 树形构造；
    filteredSequences.forEach((sequence: any, index: number) => {
      treeNodes.push(
        TREE_NODES.SEQUENCE.getConfig(sequence, {
          key: `sequence-${index}`,
        }),
      );
    });
    injectCustomInfoToTreeData(treeNodes);
    return treeNodes;
  };

  public render() {
    const { loading } = this.props;
    return (
      <>
        <Spin spinning={loading} wrapperClassName={styles.sequenceTree}>
          <TreeNodeDirectory
            showIcon={false}
            treeList={this.getTreeList()}
            loadedKeys={[]}
            onDoubleClick={this.handleBrowserSchema}
            onMenuClick={this.handleSequenceClick}
            getWrapperInstance={() => this}
          />
        </Spin>
      </>
    );
  }
}
