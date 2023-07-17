import { clearModalConfirm } from '@/component/ErrorConfirmModal';
import OBLogin from '@/component/Login';
import { SPACE_REGEX } from '@/constant';
import { ODCErrorsCode } from '@/d.ts';
import type { UserStore } from '@/store/login';
import loginStore from '@/store/login';
import type { SettingStore } from '@/store/setting';
import { formatMessage, getLocalImg } from '@/util/intl';
import logger from '@/util/logger';
import { useLocation } from '@umijs/max';
import { message } from 'antd';
import { inject, observer } from 'mobx-react';
import { useEffect, useState } from 'react';
import { history } from 'umi';

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
        message.success(formatMessage({ id: 'login.login.success' }));
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
          history.push('/project');
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
      setErrMsg(formatMessage({ id: 'odc.page.Login.NetworkException' }));
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
          formatMessage({ id: 'odc.page.Login.Activated' }), // 激活成功
        );
        setShowActivate(false);
        setLoginLoading(false);
        setInitialLoginValues((loginValues) => {
          loginValues.password = '';
          return loginValues;
        });
      } else {
        setErrMsg(formatMessage({ id: 'odc.page.Login.ActivationFailed' })); // 激活失败
        setLoginLoading(false);
      }
    } catch (e) {
      console.trace(e);
      setErrMsg(formatMessage({ id: 'odc.page.Login.NetworkException' })); // 网络异常
      setLoginLoading(false);
    }
  };

  return !settingStore.serverSystemInfo?.passwordLoginEnabled ? /**
   * 第三方自动登录配置开启的时候，不能出现登录页面
   */ null : (
    <OBLogin
      logo={getLocalImg('version_icon.png')}
      showAuthCode={settingStore.serverSystemInfo?.captchaEnabled}
      showOtherLoginButton={settingStore.serverSystemInfo.ssoLoginEnabled}
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
