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

import { executeTaskManager } from '@/common/network/sql/executeSQL';
import WindowManager from '@/component/WindowManager';
import WorkspaceSideTip from '@/component/WorkspaceSideTip';
import type { IPage } from '@/d.ts';
import odc from '@/plugins/odc';
import { movePagePostion, openNewSQLPage } from '@/store/helper/page';
import type { UserStore } from '@/store/login';
import type { ModalStore } from '@/store/modal';
import type { PageStore } from '@/store/page';
import type { SessionManagerStore } from '@/store/sessionManager';
import type { SettingStore } from '@/store/setting';
import type { SQLStore } from '@/store/sql';
import type { TaskStore } from '@/store/task';
import { formatMessage } from '@/util/intl';
import { history, useLocation, useSearchParams } from '@umijs/max';
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
import tracert from '@/util/tracert';

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

  function resolveParams() {
    const projectId = toInteger(params.get('projectId'));
    const databaseId = toInteger(params.get('databaseId'));
    const datasourceId = toInteger(params.get('datasourceId'));
    if (projectId) {
      resourceTreeContext?.setSelectTabKey(ResourceTreeTab.project);
      resourceTreeContext?.setSelectProjectId(projectId);
      databaseId && openNewSQLPage(databaseId, 'project');
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
    openNewSQLPage(null);
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
        title: formatMessage({ id: 'odc.page.Workspace.ConfirmCloseWindow' }), // 确认关闭窗口？
        content: formatMessage({
          id: 'odc.page.Workspace.WhenTheOperationIsRunning',
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
    useEffect(() => {
      window.name = 'sqlworkspace' + '%' + props.userStore?.organizationId;
      return () => {
        window.name = null;
      };
    }, [props.userStore?.organizationId]);
    return (
      <WorkspaceStore key={props.userStore?.organizationId}>
        <WorkspaceMobxWrap {...props} />
      </WorkspaceStore>
    );
  }),
);
