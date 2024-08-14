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

import { clearModalConfirm } from '@/component/ErrorConfirmModal';
import OBLogin from '@/component/Login';
import { SPACE_REGEX } from '@/constant';
import { ODCErrorsCode } from '@/d.ts';
import { toDefaultProjectPage } from '@/service/projectHistory';
import type { UserStore } from '@/store/login';
import loginStore from '@/store/login';
import type { SettingStore } from '@/store/setting';
import { formatMessage, getLocalImg } from '@/util/intl';
import logger from '@/util/logger';
import { history, useLocation } from '@umijs/max';
import { message } from 'antd';
import { inject, observer } from 'mobx-react';
import { useEffect, useState } from 'react';

const Login: React.FC<{
  userStore: UserStore;
  settingStore?: SettingStore;
}> = (props) => {
  const { settingStore, userStore } = props;
  const location = useLocation();
  const [errMsg, setErrMsg] = useState<string>('');
  const [authCode, setAuthCode] = useState<string>('');
  const [showActivate, setShowActivate] = useState<boolean>(false);
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [initialLoginValues, setInitialLoginValues] = useState<{
    username: string;
    password: string;
  }>(null);

  useEffect(() => {
    tryAutoLogin();
    clearModalConfirm(ODCErrorsCode.LoginExpired);
    if (settingStore.serverSystemInfo?.captchaEnabled) {
      loadAuthCode();
    }
  }, []);
  const tryAutoLogin = () => {
    const query: { [key: string]: any } = new URLSearchParams(location.search) || {};
    if (query.has('accountVerifyToken')) {
      handleLogin({
        token: query.get('accountVerifyToken'),
      });
    }
  };

  const loadAuthCode = async () => {
    setErrMsg('');
    setAuthCode(`/api/v2/iam/captcha?version=${Date.now()}`);
  };

  const reloadAuthCode = () => {
    if (settingStore.serverSystemInfo?.captchaEnabled) {
      setAuthCode(`/api/v2/iam/captcha?version=${Date.now()}`);
    }
  };

  const handleLogin = async (params: {
    username?: string;
    password?: string;
    authCode?: string;
    token?: string;
  }) => {
    setErrMsg('');
    setLoginLoading(true);
    try {
      const { success, message: msg, errCode } = await userStore.login(params);
      if (success) {
        message.success(formatMessage({ id: 'login.login.success', defaultMessage: '登录成功' }));
        await userStore.getOrganizations();
        const isSuccess = await userStore.switchCurrentOrganization();
        if (!isSuccess) {
          logger.error('switch organization failed');
          return;
        }
        if (!userStore.user?.enabled) {
          history.replace('/exception/403');
          return;
        }

        // 跳转主页
        const query: { [key: string]: any } = new URLSearchParams(location.search) || {};
        if (query.has('redirectTo')) {
          history.push(decodeURIComponent(query.get('redirectTo')));
        } else {
          toDefaultProjectPage();
        }
      } else if (errCode === 'UserNotActive') {
        const { username, password } = params;
        setShowActivate(true);
        setLoginLoading(false);
        setInitialLoginValues({
          username,
          password,
        });
      } else {
        // 后端登录错误格式很特殊
        setErrMsg(msg);
        setLoginLoading(false);
        reloadAuthCode();
      }
    } catch (e) {
      console.trace(e);
      setErrMsg(
        formatMessage({ id: 'odc.page.Login.NetworkException', defaultMessage: '网络异常' }),
      );
      setLoginLoading(false);
      reloadAuthCode();
    }
  };

  const handleActivate = async (confirmPassword: string) => {
    let status = {
      errMsg: '',
      loginLoading: true,
    };

    if (!confirmPassword?.match(SPACE_REGEX)) {
      status = {
        errMsg: formatMessage({
          id: 'odc.page.Login.ThePasswordCannotContainSpaces',
          defaultMessage: '密码不能包含空格',
        }), //密码不能包含空格
        loginLoading: false,
      };
    }
    setErrMsg('');
    setLoginLoading(true);
    if (errMsg) {
      return;
    }

    try {
      const res = await userStore.activate({
        username: initialLoginValues?.username,
        currentPassword: initialLoginValues?.password,
        newPassword: confirmPassword,
      });

      if (res) {
        message.success(
          formatMessage({ id: 'odc.page.Login.Activated', defaultMessage: '激活成功' }), // 激活成功
        );
        setShowActivate(false);
        setLoginLoading(false);
        setInitialLoginValues((loginValues) => {
          loginValues.password = '';
          return loginValues;
        });
      } else {
        setErrMsg(
          formatMessage({ id: 'odc.page.Login.ActivationFailed', defaultMessage: '激活失败' }),
        ); // 激活失败
        setLoginLoading(false);
      }
    } catch (e) {
      console.trace(e);
      setErrMsg(
        formatMessage({ id: 'odc.page.Login.NetworkException', defaultMessage: '网络异常' }),
      ); // 网络异常
      setLoginLoading(false);
    }
  };
  /**
   * 第三方自动登录配置开启的时候，不能出现登录页面
   */
  return !settingStore.serverSystemInfo?.passwordLoginEnabled ? null : (
    <OBLogin
      logo={getLocalImg('version_icon.png')}
      showAuthCode={settingStore.serverSystemInfo?.captchaEnabled}
      showOtherLoginButton={settingStore.serverSystemInfo.ssoLoginEnabled}
      ssoLoginType={settingStore?.serverSystemInfo?.ssoLoginType}
      ssoLoginName={settingStore?.serverSystemInfo?.ssoLoginName}
      otherLoginProps={{
        onFinish: loginStore.gotoLoginPageSSO,
      }}
      authCodeImg={authCode}
      onAuthCodeImgChange={loadAuthCode}
      bgImage={`${window.publicPath}img/loginbg.png`}
      alertProps={{
        message: errMsg,
      }}
      loginProps={{
        onFinish: async (values) => {
          await handleLogin(values);
        },
        initialValues: initialLoginValues,
        loading: loginLoading,
        onValuesChange: () => setErrMsg(null),
      }}
      activateFormProps={{
        onValuesChange: () => setErrMsg(null),
        onFinish: async (values) => {
          await handleActivate(values.confirmPassword);
        },
      }}
      showLocale
      showActivate={showActivate}
      locale={undefined}
      onShowActivateChange={(isShow) => setShowActivate(isShow)}
    />
  );
};

export default inject('userStore', 'settingStore')(observer(Login));
