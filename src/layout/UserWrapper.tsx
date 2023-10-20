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

import PageLoading from '@/component/PageLoading';
import { UserStore } from '@/store/login';
import { SettingStore } from '@/store/setting';
import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { Outlet, useLocation } from '@umijs/max';
import { message } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { history } from '@umijs/max';

interface IProps {
  userStore: UserStore;
  settingStore: SettingStore;
}

enum STATUS_TYPE {
  INIT,
  LOADING,
  DONE,
  ERROR,
}

const UserWrapper: React.FC<IProps> = function ({ children, userStore, settingStore }) {
  const [status, setStatus] = useState<STATUS_TYPE>(STATUS_TYPE.INIT);
  const location = useLocation();

  async function checkLoginStatus() {
    setStatus(STATUS_TYPE.LOADING);
    const query: { [key: string]: any } = new URLSearchParams(location.search);
    if (query.has('accountVerifyToken') && !isClient()) {
      /**
       * 存在token的时候，直接跳到登录页面做自动登录处理
       * 客户端下直接忽略这个参数
       */
      setStatus(STATUS_TYPE.DONE);
      history.replace({
        pathname: '/login',
        search: location.search,
      });
      return;
    }
    await userStore.getOrganizations();
    const isSuccess = await userStore.switchCurrentOrganization();
    const isLoginPage = location.pathname.indexOf('login') > -1;
    if (!userStore.organizations?.length || !isSuccess) {
      if (isClient()) {
        /**
         * 客户端，但是获取用户失败，这个时候其实是系统错误
         */
        message.error(
          formatMessage({
            id: 'odc.src.layout.UserWrapper.GetcurrentuserInitializationInformationFailed',
          }), //[getCurrentUser]初始化信息失败
        );
        setStatus(STATUS_TYPE.ERROR);
        return;
      }
      if (
        !settingStore.serverSystemInfo?.passwordLoginEnabled &&
        settingStore.serverSystemInfo?.ssoLoginEnabled
      ) {
        userStore.gotoLoginPageSSO();
        return;
      }
      const searchParamsObj = new URLSearchParams();
      if (location.search.includes('redirect')) {
        searchParamsObj.append(
          'redirectTo',
          encodeURIComponent(
            decodeURIComponent(new URLSearchParams(location.search).get('redirectTo')),
          ),
        );
      }

      history.replace({
        pathname: '/login',
        search: searchParamsObj.toString(),
      });
    } else if (userStore?.user?.enabled === false) {
      /**
       * 冻结用户
       */
      history.replace('/exception/403');
    } else if (isLoginPage) {
      /**
       * 处于login页面并且已经登录，需要跳到对应的页面上
       */
      history.replace('/project');
    }
    setStatus(STATUS_TYPE.DONE);
  }

  useEffect(() => {
    checkLoginStatus();
  }, []);

  switch (status) {
    case STATUS_TYPE.DONE: {
      return (
        <>
          <Outlet />
        </>
      );
    }
    case STATUS_TYPE.LOADING: {
      return <PageLoading showError={false} />;
    }
    case STATUS_TYPE.ERROR: {
      return <PageLoading showError />;
    }
    default: {
      return <></>;
    }
  }
};
export default inject('userStore', 'settingStore')(observer(UserWrapper));
