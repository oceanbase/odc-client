/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { getMetaStoreInstance } from '@/common/metaStore';
import { executeTaskManager } from '@/common/network/sql/executeSQL';
import ExecuteSQLModal from '@/component/ExecuteSQLModal';
import WindowManager from '@/component/WindowManager';
import WorkspaceSideTip from '@/component/WorkspaceSideTip';
import type { IPage } from '@/d.ts';
import odc from '@/plugins/odc';
import { movePagePostion, openNewSQLPage, openCreateTablePage } from '@/store/helper/page';
import type { UserStore } from '@/store/login';
import type { ModalStore } from '@/store/modal';
import type { PageStore } from '@/store/page';
import type { SessionManagerStore } from '@/store/sessionManager';
import sessionManager from '@/store/sessionManager';
import type { SettingStore } from '@/store/setting';
import type { SQLStore } from '@/store/sql';
import type { TaskStore } from '@/store/task';
import { formatMessage } from '@/util/intl';
import tracert from '@/util/tracert';
import { history, useLocation, useParams, useSearchParams } from '@umijs/max';
import { message, Modal } from 'antd';
import { toInteger } from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { useContext, useEffect, useState } from 'react';
import ActivityBar from './ActivityBar/ index';
import ResourceTreeContext, { ResourceTreeTab } from './context/ResourceTreeContext';
import WorkspaceStore from './context/WorkspaceStore';
import GlobalModals from './GlobalModals';
import WorkBenchLayout from './Layout';
import SideBar from './SideBar';
import { isLogicalDatabase } from '@/util/database';

let _closeMsg = '';
export function changeCloseMsg(t: any) {
  _closeMsg = t;
}

interface WorkspaceProps {
  pageStore: PageStore;
  settingStore: SettingStore;
  userStore: UserStore;
  sqlStore: SQLStore;
  modalStore?: ModalStore;
  taskStore?: TaskStore;
  sessionManagerStore?: SessionManagerStore;
}

const Workspace: React.FC<WorkspaceProps> = (props: WorkspaceProps) => {
  const { pageStore, settingStore, sqlStore, modalStore, taskStore, sessionManagerStore } = props;
  const { pages = [], activePageKey } = pageStore;
  const { serverSystemInfo } = settingStore;
  const location = useLocation();
  const [params] = useSearchParams(location.hash);
  const resourceTreeContext = useContext(ResourceTreeContext);

  const [isReady, setIsReady] = useState<boolean>(false);
  const { tabKey } = useParams<{ tabKey: string }>();

  function resolveParams() {
    const projectId = toInteger(params.get('projectId'));
    const databaseId = toInteger(params.get('databaseId'));
    const datasourceId = toInteger(params.get('datasourceId'));
    const isLogicalDatabase = params.get('isLogicalDatabase') === 'true';
    const isCreateTable = params.get('isCreateTable') === 'true';
    if (projectId) {
      resourceTreeContext?.setSelectTabKey(ResourceTreeTab.project);
      resourceTreeContext?.setSelectProjectId(projectId);
      databaseId && resourceTreeContext?.setCurrentDatabaseId(databaseId);
      if (!isLogicalDatabase) {
        databaseId && openNewSQLPage(databaseId, 'project');
      }
      if (isCreateTable) {
        openCreateTablePage(databaseId);
      }
    } else if (datasourceId) {
      resourceTreeContext?.setSelectTabKey(ResourceTreeTab.datasource);
      resourceTreeContext?.setSelectDatasourceId(datasourceId);
      databaseId && openNewSQLPage(databaseId, 'datasource');
    } else {
      return;
    }
    console.log('openPage', projectId, datasourceId, databaseId);
    history.replace('/sqlworkspace');
  }
  useEffect(() => {
    if (!isReady) {
      return;
    }
    resolveParams();
  }, [params, isReady]);

  const handleActivatePage = (activeKey: string) => {
    pageStore.setActivePageKeyAndPushUrl(activeKey);
  };

  const handleOpenPage = async () => {
    const db = resourceTreeContext.currentDatabaseId;
    const isLogicalDb = isLogicalDatabase(
      resourceTreeContext?.databaseList?.find((_db) => _db?.id === db),
    );
    openNewSQLPage(isLogicalDb ? null : db);
  };

  const openPageAfterTargetPage = async (targetPage: IPage) => {
    await handleOpenPage();
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
        title: formatMessage({
          id: 'odc.page.Workspace.ConfirmCloseWindow',
          defaultMessage: '是否确认关闭窗口？',
        }), // 确认关闭窗口？
        content: formatMessage({
          id: 'odc.page.Workspace.WhenTheOperationIsRunning',
          defaultMessage: '操作执行中，关闭窗口将终止窗口操作，是否确认关闭？',
        }),

        // 操作执行中，关闭窗口将终止窗口操作，确认关闭吗？
        onOk: async () => {
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
      message.warning(
        formatMessage(
          {
            id: 'odc.page.Workspace.DockedpagetitleIsBeingDebuggedAnd',
            defaultMessage: '{dockedPageTitle}正在调试，无法关闭',
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
          defaultMessage: '任务未保存',
        }),

        content: formatMessage({
          id: 'odc.page.Workspace.UnsavedContentWillDisappearAfter',
          defaultMessage: '关闭之后未保存内容将会消失',
        }),

        okText: formatMessage({
          id: 'odc.page.Workspace.Closed',
          defaultMessage: '关闭',
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

  const onCopySQLPage = (page: IPage) => {
    openNewSQLPage(page?.params?.cid, page?.params?.databaseFrom);
  };
  useEffect(() => {
    // clear expired tab data
    const key = 'tabKey-time' + tabKey;
    async function clearExpriedTabKey() {
      const store = await getMetaStoreInstance();
      const expriedKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) {
          break;
        }
        if (key.indexOf('tabKey-time') === 0) {
          const time = parseInt(localStorage.getItem(key) || '0');
          if (new Date().getTime() - time > 1000 * 60 * 60 * 24 * 3) {
            expriedKeys.push(key);
            localStorage.removeItem(key);
          }
        }
      }
      const items = await store.getAllItem();
      items.forEach(async ([itemKey, value]) => {
        const expriedKey = expriedKeys.find((key) => {
          return itemKey.includes(key.replace('tabKey-time', ''));
        });
        if (!expriedKey) {
          return;
        }
        store.removeItem(itemKey);
      });
    }
    clearExpriedTabKey();
    window.localStorage.removeItem(key);
    return () => {
      // add tab close time
      if (tabKey) {
        window.localStorage.setItem(key, new Date().getTime().toString());
      }
    };
  }, []);
  useEffect(() => {
    tracert.expo('a3112.b41896.c330993');
    async function asyncEffect() {
      // settingStore.hideHeader(); // 隐藏阿里云导航头
      odc.appConfig.workspace.preMount();
      await pageStore.initStore();
      // if (localLoginHistoy.isNewVersion()) {
      //   localLoginHistoy.updateVersion();
      //   settingStore.enableVersionTip && openNewVersionTip();
      // }
      setIsReady(true);
      /**
       * TODO
       * 初始化项目列表，数据源列表
       */
    }
    asyncEffect();
    return () => {
      odc.appConfig.workspace.unMount?.();
      sqlStore.reset();
      modalStore.clear();
      taskStore.clear();
      executeTaskManager.stopAllTask();
      sessionManagerStore.destoryStore(true);
    };
  }, []);

  useEffect(() => {
    if (settingStore.configurations['odc.database.default.enableGlobalObjectSearch'] === 'false')
      return;
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && ['J', 'j'].includes(event.key)) {
        modalStore.changeDatabaseSearchModalVisible(!modalStore.databaseSearchModalVisible);
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [settingStore.configurations['odc.database.default.enableGlobalObjectSearch']]);
  return (
    <>
      <WorkBenchLayout
        activityBar={<ActivityBar />}
        sideBar={<SideBar />}
        editorGroup={
          isReady ? (
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
              onCopySQLPage={onCopySQLPage}
            />
          ) : null
        }
      />

      {isReady && (
        <>
          {!!serverSystemInfo?.tutorialEnabled && <WorkspaceSideTip />}
          <GlobalModals />
        </>
      )}

      <WrapWorkSpaceExecuteSQLModal modalStore={modalStore} />
    </>
  );
};

const WorkspaceMobxWrap = inject(
  'pageStore',
  'settingStore',
  'userStore',
  'sqlStore',
  'modalStore',
  'taskStore',
  'sessionManagerStore',
)(observer(Workspace));

export default inject('userStore')(
  observer(function WorkSpaceWrap(props: WorkspaceProps) {
    const { tabKey } = useParams<{ tabKey: string }>();
    useEffect(() => {
      if (tabKey) {
        return;
      }
      window.name = 'sqlworkspace' + '%' + props.userStore?.organizationId;
      return () => {
        window.name = null;
      };
    }, [props.userStore?.organizationId, tabKey]);
    return (
      <WorkspaceStore key={props.userStore?.organizationId}>
        <WorkspaceMobxWrap {...props} />
      </WorkspaceStore>
    );
  }),
);

const WorkSpaceExecuteSQLModal: React.FC<{
  modalStore: ModalStore;
}> = ({ modalStore }) => {
  const { workSpaceExecuteSQLModalProps = {} } = modalStore;
  const {
    tip,
    sql = '',
    visible = false,
    sessionId = null,
    onCancel,
    onSave,
    status = null,
    lintResultSet = null,
  } = workSpaceExecuteSQLModalProps;
  return (
    <ExecuteSQLModal
      tip={tip}
      sessionStore={sessionManager?.sessionMap?.get(sessionId)}
      readonly={true}
      lintResultSet={lintResultSet}
      status={status}
      sql={sql}
      onSave={onSave}
      visible={visible}
      onCancel={onCancel}
    />
  );
};

const WrapWorkSpaceExecuteSQLModal = inject('modalStore')(observer(WorkSpaceExecuteSQLModal));
