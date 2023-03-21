import { executeTaskManager } from '@/common/network/sql/executeSQL';
import AddConnectionDrawer from '@/component/AddConnectionDrawer';
import ApplyPermission from '@/component/ApplyPermission';
import CreateFunctionModal from '@/component/CreateFunctionModal';
import CreateProcedureModal from '@/component/CreateProcedureModal';
import DataMockerDrawer from '@/component/DataMockerDrawer';
import openNewVersionTip from '@/component/VersionModal/NewVersion';
import WindowManager from '@/component/WindowManager';
import WorkspaceSideTip from '@/component/WorkspaceSideTip';
import appConfig from '@/constant/appConfig';
import type { IPage } from '@/d.ts';
import { ConnectionMode, IConnectionType, ResourceTabKey } from '@/d.ts';
import PartitionDrawer from '@/page/Workspace/components/PartitionDrawer';
import ResourceTree from '@/page/Workspace/components/ResourceTree';
import localLoginHistoy from '@/service/localLoginHistoy';
import type { CommonStore } from '@/store/common';
import type { ConnectionStore } from '@/store/connection';
import { movePagePostion, openNewSQLPage } from '@/store/helper/page';
import type { UserStore } from '@/store/login';
import type { ModalStore } from '@/store/modal';
import type { PageStore } from '@/store/page';
import type { SchemaStore } from '@/store/schema';
import type { SettingStore } from '@/store/setting';
import type { SQLStore } from '@/store/sql';
import type { TaskStore } from '@/store/task';
import task from '@/store/task';
import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { extractResourceId } from '@/util/utils';
import { ExclamationCircleTwoTone } from '@ant-design/icons';
import { useParams } from '@umijs/max';
import { Layout, message, Modal } from 'antd';
import { debounce } from 'lodash';
import { inject, observer } from 'mobx-react';
import type { MenuInfo } from 'rc-menu/lib/interface';
import React, { useEffect, useState } from 'react';
import SplitPane from 'react-split-pane';
import { history } from 'umi';
import CreateAsyncTaskModal from './components/CreateAsyncTaskModal';
import CreateSequenceModal from './components/CreateSequenceModal';
import CreateShadowSyncModal from './components/CreateShadowSyncModal';
import CreateSQLPlanTaskModal from './components/CreateSQLPlanTaskModal';
import ExportDrawer from './components/ExportDrawer';
import Header from './components/Header';
import ImportDrawer from './components/ImportDrawer';
import ScriptManageModal from './components/ScriptManageModal';
import ResourceSider from './components/Sider';
import styles from './index.less';

let _closeMsg = '';
export function changeCloseMsg(t: any) {
  _closeMsg = t;
}
const { Sider, Content } = Layout;

interface WorkspaceProps {
  pageStore: PageStore;
  settingStore: SettingStore;
  connectionStore: ConnectionStore;
  schemaStore: SchemaStore;
  userStore: UserStore;
  sqlStore: SQLStore;
  modalStore?: ModalStore;
  commonStore: CommonStore;
  taskStore?: TaskStore;
}

let beforeUnloadHandler: ((e: BeforeUnloadEvent) => void) | undefined;
const Workspace: React.FC<WorkspaceProps> = (props: WorkspaceProps) => {
  const {
    pageStore,
    settingStore,
    connectionStore,
    schemaStore,
    userStore,
    sqlStore,
    modalStore,
    commonStore,
    taskStore,
  } = props;
  let timer = -1;

  const { pages = [], activePageKey } = pageStore;
  const { siderWidth, collapsed, serverSystemInfo } = settingStore;
  const params = useParams();

  const [activeResource, setActiveResource] = useState<ResourceTabKey>(ResourceTabKey.TABLE);
  const [isReady, setIsReady] = useState<boolean>(false);

  const handleActivatePage = (activeKey: string) => {
    pageStore.setActivePageKeyAndPushUrl(activeKey);
  };

  const handleOpenPage = () => {
    openNewSQLPage();
  };

  const openPageAfterTargetPage = (targetPage: IPage) => {
    openNewSQLPage();
    const { pages } = pageStore;

    if (pages.length < 3) {
      /**
       * 少于3个，没必要再排序
       */
      return;
    }

    const newPage = pages[pages.length - 1];
    const targetPageIndex = pages.findIndex((page) => {
      return page.key == targetPage.key;
    });

    if (newPage) {
      movePagePostion(newPage.key, pages[targetPageIndex + 1].key);
    }
  };

  const handleClosePage = (targetPageKey: string) => {
    const { runningPageKey } = sqlStore;

    if (runningPageKey.has(targetPageKey)) {
      Modal.confirm({
        title: formatMessage({ id: 'odc.page.Workspace.ConfirmCloseWindow' }), // 确认关闭窗口？
        content: formatMessage({
          id: 'odc.page.Workspace.WhenTheOperationIsRunning',
        }),

        // 操作执行中，关闭窗口将终止窗口操作，确认关闭吗？
        onOk: async () => {
          await sqlStore.stopExec(targetPageKey);
          pageStore.close(targetPageKey);
        },
      });
    } else {
      pageStore.close(targetPageKey);
    }
  };

  const checkPagesSaved = (pages: IPage[], callback) => {
    let isSaved = true;
    let dockedPage = null;
    pages.forEach((page) => {
      if (!page.isSaved) {
        isSaved = false;
      }
      if (page?.params?.isDocked) {
        dockedPage = page;
      }
    });
    if (dockedPage) {
      message.warn(
        formatMessage(
          {
            id: 'odc.page.Workspace.DockedpagetitleIsBeingDebuggedAnd',
          },

          { dockedPageTitle: dockedPage.title },
        ),

        // `${dockedPage.title}正在调试，无法关闭`
      );
    } else if (isSaved) {
      callback();
    } else {
      Modal.confirm({
        title: formatMessage({
          id: 'odc.page.Workspace.TheTaskIsNotSaved',
        }),

        content: formatMessage({
          id: 'odc.page.Workspace.UnsavedContentWillDisappearAfter',
        }),

        okText: formatMessage({
          id: 'odc.page.Workspace.Closed',
        }),

        okType: 'danger',
        onOk: callback,
      });
    }
  };

  const handleCloseOtherPage = (targetPageKey: string) => {
    const willClosePages = pageStore.pages.filter((page) => {
      return page.key !== targetPageKey;
    });
    checkPagesSaved(willClosePages, () => {
      pageStore.setActivePageKeyAndPushUrl(targetPageKey);
      pageStore.updatePages(async (oldPages) => {
        return oldPages.filter((page) => {
          return page.key == targetPageKey;
        });
      });
    });
  };

  const handleCloseAllPage = () => {
    checkPagesSaved(pageStore.pages, () => {
      pageStore.clear();
    });
  };

  const handleSavePage = (targetPageKey: string) => {
    pageStore.save(targetPageKey);
  };

  const handleStartSavingPage = (targetPageKey: string) => {
    pageStore.startSaving(targetPageKey);
  };

  const handelUnsavedChangePage = (targetPageKey: string) => {
    pageStore.setPageUnsaved(targetPageKey);
  };

  const handleClickMenu = (param: MenuInfo) => {
    // @ts-ignore
    setActiveResource(param.key as any);
  };

  const handleChangeSiderWidth = (width: number) => {
    settingStore.setSiderWidth(width); // 手动触发 resize 事件

    emitResizeEvent();
  };

  const emitResizeEvent = debounce(() => {
    window.dispatchEvent(new Event('resize'));
  }, 500);
  /**
   * 不是客户端的话，需要监听关闭事件，然后断开数据库连接
   */

  const addPageUnloadListener = () => {
    if (!isClient()) {
      beforeUnloadHandler = (e: BeforeUnloadEvent) => {
        if (window._forceRefresh) {
          return;
        }
        e.preventDefault();

        if (typeof _closeMsg === 'string') {
          e.returnValue = _closeMsg;
        } // send with keepalive

        connectionStore.disconnect(false);
        return _closeMsg;
      }; // 在页面关闭前通知后端尝试断开数据库长连接

      window.addEventListener('beforeunload', beforeUnloadHandler);
    }
  };

  const clearPageLoadListener = () => {
    if (beforeUnloadHandler) {
      window.removeEventListener('beforeunload', beforeUnloadHandler);
    }
  };

  const addHeartBeat = () => {
    // 发送心跳 10s 一次
    let num = 1;
    timer = window.setInterval(() => {
      try {
        connectionStore.heartbeat();
      } catch (e) {
        console.trace(e);
      }
      num++;
    }, 10000);
  };

  const clearHeartBeat = () => {
    window.clearInterval(timer);
  };
  useEffect(() => {
    async function asyncEffect() {
      // settingStore.hideHeader(); // 隐藏阿里云导航头
      appConfig.workspace.preMount();
      addPageUnloadListener();
      addHeartBeat(); // 丢失连接，需要重连。例如直接刷新工作台页面

      if (!connectionStore.connection || !connectionStore.connection.sid) {
        if (!params?.sessionId || !params?.tabKey) {
          history.push('/connections');
          return;
        }
        commonStore.setTabKey(params.tabKey);
      } // 首先从 sid:100-1:d:dbname 中解析出

      const resourceId = extractResourceId(params.sessionId);
      await connectionStore.initConnect(resourceId);

      if (
        !connectionStore.autoCommit &&
        connectionStore.connection.dbMode === ConnectionMode.OB_ORACLE
      ) {
        /**
         * oracle 手动提交需要给加一个提示
         */
        if (!localStorage.getItem('showAutoCommitWarn') && !settingStore.enableMultiSession) {
          Modal.confirm({
            icon: <ExclamationCircleTwoTone twoToneColor="#faad14" />,
            title: formatMessage({ id: 'odc.page.Workspace.Note' }), // 注意信息
            centered: true,
            content: formatMessage({
              id: 'odc.page.Workspace.InTheSharedSessionMode',
            }), //当前使用的是共享 session 模式，主动触发提交/回滚操作，或通过产品功能创建、修改、删除数据库对象，执行 DDL 语句被动触发提交操作，会在所有窗口生效。
            cancelText: formatMessage({
              id: 'odc.page.Workspace.NoReminder',
            }),

            // 不再提醒
            okText: formatMessage({
              id: 'odc.page.Workspace.ISee',
            }),

            // 我知道了
            onCancel() {
              localStorage.setItem('showAutoCommitWarn', '1');
            },
          });
        }
      }
      if (connectionStore.connection) {
        if (localLoginHistoy.isNewVersion()) {
          localLoginHistoy.updateVersion();
          settingStore.enableVersionTip && openNewVersionTip();
        }
      }
      task.setTaskCreateEnabled(true);
      setIsReady(true);
    }
    asyncEffect();
    return () => {
      appConfig.workspace.unMount?.();

      clearHeartBeat();
      pageStore.clear();
      schemaStore.clear();
      sqlStore.reset();
      modalStore.clear();
      taskStore.clear();
      connectionStore.clear();
      clearPageLoadListener();
      executeTaskManager.stopAllTask();
      task.setTaskCreateEnabled();
    };
  }, []);
  return (
    <>
      <Header />
      <Layout className={styles.content}>
        <ResourceSider activeResource={activeResource} onMenuClick={handleClickMenu} />
        <div
          style={{
            left: collapsed ? '40px' : '96px',
          }}
          className={styles.splitContainer}
        >
          <SplitPane
            split="vertical"
            minSize={120}
            maxSize={480}
            defaultSize={siderWidth}
            pane2Style={{
              minWidth: '1px',
            }}
            resizerStyle={{
              background: 'transparent',
            }}
            onChange={handleChangeSiderWidth}
          >
            <Sider width={siderWidth} className={styles.sider}>
              <ResourceTree activeResource={activeResource} />
            </Sider>
            <Content>
              <WindowManager
                pages={pages}
                activeKey={activePageKey}
                onActivatePage={handleActivatePage}
                onOpenPage={handleOpenPage}
                onOpenPageAfterTarget={openPageAfterTargetPage}
                onClosePage={handleClosePage}
                onCloseOtherPage={handleCloseOtherPage}
                onCloseAllPage={handleCloseAllPage}
                onSavePage={handleSavePage}
                onStartSavingPage={handleStartSavingPage}
                onUnsavedChangePage={handelUnsavedChangePage}
              />
            </Content>
          </SplitPane>
        </div>
        {isReady && (
          <>
            {!!serverSystemInfo?.tutorialEnabled && <WorkspaceSideTip />}
            <ExportDrawer key={`${modalStore.exportModalVisible}export`} />
            <ImportDrawer key={`${modalStore.importModalVisible}import`} />
            <AddConnectionDrawer
              connectionType={IConnectionType.ORGANIZATION}
              onlySys
              key={`${modalStore.addConnectionVisible}connection`}
            />

            <DataMockerDrawer />
            <ApplyPermission />
            <CreateAsyncTaskModal key={`${modalStore.createAsyncTaskVisible}async`} />
            <CreateSequenceModal key={`${modalStore.createSequenceModalVisible}sequence`} />
            <CreateFunctionModal />
            <CreateProcedureModal />
            <ScriptManageModal />
            <PartitionDrawer />
            <CreateShadowSyncModal key={`${modalStore.addShadowSyncVisible}shadowSync`} />
            <CreateSQLPlanTaskModal />
          </>
        )}
      </Layout>
    </>
  );
};

export default inject(
  'pageStore',
  'settingStore',
  'connectionStore',
  'schemaStore',
  'userStore',
  'sqlStore',
  'commonStore',
  'modalStore',
  'taskStore',
)(observer(Workspace));
