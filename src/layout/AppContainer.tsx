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

/**
 * 初始化用户无关的应用配置
 */
import { checkQueueStatus } from '@/common/network/other';
import AskeventTrackingPermissionModal from '@/component/AskEventTrackingModal';
import ErrorBoundary from '@/component/ErrorBoundary';
import PageLoading from '@/component/PageLoading';
import authStore, { AuthStore, AuthStoreContext } from '@/store/auth';
import { ClusterStore } from '@/store/cluster';
import { UserStore } from '@/store/login';
import { PageStore } from '@/store/page';
import { SettingStore } from '@/store/setting';
import { SQLStore } from '@/store/sql';
import { haveLockPwd, initClientService, isLock } from '@/util/client';
import { isClient } from '@/util/env';
import { Helmet, history, Outlet, useAppData, useLocation, useRouteData } from '@umijs/max';
import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { ContainerQuery } from 'react-container-query';
import Context from './MenuContext';
import StoreProvider from './StoreProvider';

// // TODO：支持英文版
// setLocale('zh-CN');

const query = {
  'screen-xs': {
    maxWidth: 575,
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767,
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991,
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1200,
    maxWidth: 1599,
  },
  'screen-xxl': {
    minWidth: 1600,
  },
};

interface IBasicLayoutProps {
  settingStore: SettingStore;
  pageStore: PageStore;
  sqlStore: SQLStore;
  userStore: UserStore;
  authStore: AuthStore;
  clusterStore: ClusterStore;
  dispatch: any;
  route: any;
  location: any;
  children?: any;
}

let timer = null;
const AppContainer: React.FC<IBasicLayoutProps> = (props: IBasicLayoutProps) => {
  const [isServerReady, setIsServerReady] = useState<boolean>(false);
  const [waitNumber, setWaitNumber] = useState<number>(-1);
  const { route } = useRouteData();
  const { routes = [] } = useAppData();

  const { settingStore, userStore } = props;
  const location = useLocation();
  const { pathname } = location;
  const isReady = settingStore.settingLoadStatus === 'done' && isServerReady;

  const checkSerevrStatus = () => {
    const { settingStore } = props;
    if (!settingStore.serverSystemInfo?.sessionLimitEnabled) {
      setIsServerReady(true);
      return true;
    }
    const checkStatus = async (callback) => {
      const data = await checkQueueStatus();
      if (data) {
        setWaitNumber(data.waitNum);
      }
      if (data?.status) {
        callback(true);
      } else {
        timer = setTimeout(() => {
          checkStatus(callback);
        }, 3000);
      }
    };
    return new Promise(async (resolve) => {
      const callback = (v) => {
        setIsServerReady(true);
        setWaitNumber(0);
        resolve(v);
      };
      checkStatus(callback);
    });
  };
  const getContext = () => {
    return {
      location,
    };
  };
  const getPageTitle = (pathname: any) => {
    return 'OceanBase Developer Center';
  };
  useEffect(() => {
    async function asyncEffect() {
      const { userStore, settingStore } = props;
      const authority = undefined;

      if (isClient()) {
        await initClientService();
        if ((await haveLockPwd()) && (await isLock())) {
          setTimeout(() => {
            /**
             * 这里要等待一下，umi有一个bug，过早push进去之后history不会更新历史栈
             */
            history.push('/lock');
          });
          return;
        }
      }
      await settingStore.initSetting();
      await checkSerevrStatus();
      const array = Object.keys(routes).map((k) => routes[k]);
    }
    asyncEffect();
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);

  return (
    <React.Fragment>
      {
        // 只在客户端开启用户信息采集窗口
        isClient() && <AskeventTrackingPermissionModal />
      }
      <Helmet>
        <title>{getPageTitle(pathname)}</title>
      </Helmet>
      <ContainerQuery query={query}>
        {(params) => (
          <Context.Provider value={getContext()}>
            {isReady ? (
              <div style={{ height: '100%' }} className={classNames(params)}>
                <Outlet />
              </div>
            ) : (
              <PageLoading
                queue={waitNumber > -1 ? { waitNumber } : null}
                showError={settingStore.settingLoadStatus === 'failed'}
              />
            )}
          </Context.Provider>
        )}
      </ContainerQuery>
    </React.Fragment>
  );
};
const App = inject(
  'settingStore',
  'authStore',
  'userStore',
  'clusterStore',
)(observer(AppContainer));

export default (props: any) => (
  // <Media query="(max-width: 599px)">
  <ErrorBoundary>
    <StoreProvider>
      <AuthStoreContext.Provider value={authStore}>
        <App {...props} />
      </AuthStoreContext.Provider>
    </StoreProvider>
  </ErrorBoundary>
);
// </Media>;
