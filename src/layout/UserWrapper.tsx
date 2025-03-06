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

import login, { UserStore } from '@/store/login';
import { SettingStore } from '@/store/setting';
import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { history, Outlet, useLocation } from '@umijs/max';
import { message } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useContext, useEffect, useState } from 'react';
import { PageLoadingContext } from './PageLoadingWrapper';
import { toDefaultProjectPage } from '@/service/projectHistory';
import OrganizationSelectModal from '@/component/OrganizationSelectModal';
import odc from '@/plugins/odc';
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
  const [defaultOrganizationHanlde, setDefaultOrganizationHanlde] =
    useState<(id: number) => void>(null);
  const location = useLocation();
  const pageContext = useContext(PageLoadingContext);

  function checkAutoLogin() {
    const query: {
      [key: string]: any;
    } = new URLSearchParams(location.search);
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
      return false;
    }
    return true;
  }
  async function organizationErrorResolve() {
    if (isClient()) {
      /**
       * 客户端，但是获取用户失败，这个时候其实是系统错误
       */
      message.error(
        formatMessage({
          id: 'odc.src.layout.UserWrapper.GetcurrentuserInitializationInformationFailed',
          defaultMessage: '[getCurrentUser]初始化信息失败',
        }), //[getCurrentUser]初始化信息失败
      );

      setStatus(STATUS_TYPE.ERROR);
      return;
    }
    await login.gotoLoginPage();
  }
  async function userFrozenErrorResolve() {
    history.replace('/exception/403');
  }
  async function checkAndInit() {
    setStatus(STATUS_TYPE.LOADING);
    const isPassed = checkAutoLogin();
    if (!isPassed) {
      return;
    }
    await userStore.getOrganizations();
    let getDefaultOrganization;
    if (!odc.appConfig.login.setFirstOraganizationToDefault) {
      getDefaultOrganization = async function () {
        return new Promise((resolve) => {
          setDefaultOrganizationHanlde(() => {
            return (id: number) => {
              resolve(id);
              setDefaultOrganizationHanlde(null);
            };
          });
        });
      };
    }
    const isSuccess = await userStore.switchCurrentOrganization(null, getDefaultOrganization);
    const isLoginPage = location.pathname.indexOf('login') > -1;
    if (!userStore.organizations?.length || !isSuccess) {
      organizationErrorResolve();
      return;
    } else if (userStore?.user?.enabled === false) {
      /**
       * 冻结用户
       */
      userFrozenErrorResolve();
      return;
    } else if (isLoginPage || location.pathname === '/project' || location.pathname === '/') {
      /**
       * 处于login页面并且已经登录，需要跳到对应的页面上
       */
      await toDefaultProjectPage();
    }
    setStatus(STATUS_TYPE.DONE);
  }
  useEffect(() => {
    checkAndInit();
  }, []);
  useEffect(() => {
    switch (status) {
      case STATUS_TYPE.DONE: {
        pageContext?.removeTask();
        break;
      }
      case STATUS_TYPE.LOADING: {
        pageContext?.setTask({
          tip: formatMessage({
            id: 'odc.src.layout.GetUserInformation',
            defaultMessage: '正在获取用户信息',
          }), //'正在获取用户信息'
          showError: false,
        });
        break;
      }
      case STATUS_TYPE.ERROR: {
        pageContext?.setTask({
          tip: null,
          showError: true,
        });
        break;
      }
      default: {
        pageContext?.setTask({
          tip: formatMessage({
            id: 'odc.src.layout.UserStatusIsBeingChecked',
            defaultMessage: '正在检查用户状态',
          }), //'正在检查用户状态'
          showError: false,
        });
        break;
      }
    }
  }, [status]);
  switch (status) {
    case STATUS_TYPE.DONE: {
      return (
        <>
          <Outlet />
        </>
      );
    }
    default: {
      return (
        <>
          <OrganizationSelectModal
            open={!!defaultOrganizationHanlde}
            onOk={async (id: number) => {
              defaultOrganizationHanlde?.(id);
            }}
          />
        </>
      );
    }
  }
};
export default inject('userStore', 'settingStore')(observer(UserWrapper));
