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

import LocalMenus from '@/component/LocalMenus';
import { ReactComponent as LogoImg  } from '@/svgr/ob_logo.svg';
import { formatMessage } from '@/util/intl';
import { useControllableValue } from 'ahooks';
import { Divider, message, Typography } from 'antd';
import type { AlertProps } from 'antd/lib/alert';
import type { FormProps } from 'antd/lib/form';
import React, { useCallback } from 'react';
import type { IActivateFormProps } from './ActivateForm';
import ActivateForm from './ActivateForm';
import './index.less';
import type { ILoginFormProps } from './LoginForm';
import LoginForm from './LoginForm';
import type { IRegisterFormProps } from './RegisterForm';
import RegisterForm from './RegisterForm';

export interface Values {
  username: string;
  password: string;
}

export interface LoginLocale {
  otherLoginText: string;
  usernamePlaceholder: string;
  usernameMessage: string;
  passwordPlaceholder: string;
  passwordMessage: string;
  loginText: string;
  switchLoginLabel: string;
  switchRegisterLabel: string;
  userExistMessage: string;
  samePasswordMessage: string;
  usernameLabel: string;
  usernameHelp: string;
  usernameFormatMessage: string;
  usernameLengthMessage: string;
  passwordLabel: string;
  passwordHelp: string;
  confirmPwdLabel: string;
  confirmPwdMessage: string;
  registerBtn: string;
  activeSubmitBtn: string;
  activeBackBtn: string;
}

export interface LoginProps extends FormProps {
  style?: React.CSSProperties;
  logo: string;
  bgImage: string;
  showLocale?: boolean;
  /* 顶部公告 */
  board?: React.ReactNode;
  alertProps?: AlertProps;
  locale?: LoginLocale;
  loginProps: ILoginFormProps;
  otherLoginProps?: ILoginFormProps;
  registerProps?: IRegisterFormProps;
  activateFormProps?: IActivateFormProps;
  enableRegister?: boolean;
  showRegister?: boolean;
  showActivate?: boolean;
  showAuthCode?: boolean;
  showOtherLoginButton?: boolean;
  authCodeImg?: string;
  onShowRegisterChange?: (isShow: boolean) => void;
  onShowActivateChange?: (isShow: boolean) => void;
  onAuthCodeImgChange?: () => void;
}

export const getPrefix = (cls: string) => `odc-${cls}`;

const Login: React.FC<LoginProps> = (props) => {
  const {
    logo,
    bgImage,
    board,
    alertProps,
    showLocale,
    locale,
    loginProps,
    otherLoginProps,
    registerProps,
    activateFormProps,
    enableRegister,
    showAuthCode,
    showOtherLoginButton,
    authCodeImg,
    onAuthCodeImgChange,
    style = {},
  } = props;
  const [showRegister, setShowRegister] = useControllableValue(props, {
    defaultValue: false,
    valuePropName: 'showRegister',
    trigger: 'onShowRegisterChange',
  });
  const [showActivate, setShowActivate] = useControllableValue(props, {
    defaultValue: false,
    valuePropName: 'showActivate',
    trigger: 'onShowActivateChange',
  });
  const prefix = getPrefix('login');
  const isLoading = loginProps?.loading || registerProps?.loading || otherLoginProps?.loading;

  const switchForm = useCallback(() => {
    if (isLoading) {
      message.warn(
        formatMessage({ id: 'odc.component.Login.Running' }), //正在执行中
      );
    }
    setShowRegister(!showRegister);
  }, [showRegister, isLoading]);

  const goBack = useCallback(() => {
    if (isLoading) {
      message.warn(
        formatMessage({ id: 'odc.component.Login.Running' }), //正在执行中
      );
    }
    setShowActivate(!showActivate);
  }, [showActivate, isLoading]);

  const showWaterMark = !showRegister;

  return (
    <div className={`${prefix}-container`} style={style}>
      <div className={`${prefix}-banner`}>
        <div style={{ backgroundImage: `url(${bgImage})` }} />
      </div>
      <div className={`${prefix}-card`}>
        {showLocale && <LocalMenus showIcon className={`${prefix}-locale`} />}
        {board && <div className={`${prefix}-board`}>{board}</div>}
        <div className={`${prefix}-content`}>
          {showActivate ? (
            <>
              <img src={logo} alt="" className={`${prefix}-activate-logo`} />
              <Divider
                style={{
                  marginTop: 14,
                  marginBottom: 20,
                }}
              />

              <Typography.Title level={3}>
                {
                  formatMessage({
                    id: 'odc.component.Login.SetPasswordToActivateAccount',
                  }) /*设置密码激活账号*/
                }
              </Typography.Title>
              <Typography.Paragraph>
                {
                  formatMessage({
                    id: 'odc.component.Login.ForAccountSecurityYouNeed',
                  }) /*为了账号安全，需要设置密码激活账号*/
                }
              </Typography.Paragraph>
              <ActivateForm
                {...activateFormProps}
                locale={locale}
                errorMessage={alertProps?.message}
                goBack={goBack}
              />
            </>
          ) : (
            <>
              {showRegister ? (
                <>
                  <img src={logo} alt="" className={`${prefix}-reigster-logo`} />
                  <Divider
                    style={{
                      marginTop: 14,
                      marginBottom: 20,
                    }}
                  />

                  <Typography.Title level={3}>
                    {formatMessage({ id: 'odc.component.Login.RegisterAnAccount' }) /*注册账号*/}
                  </Typography.Title>
                  <RegisterForm
                    {...registerProps}
                    locale={locale}
                    errorMessage={alertProps?.message}
                  />
                </>
              ) : (
                <>
                  <img src={logo} alt="" className={`${prefix}-logo`} />
                  <LoginForm
                    {...loginProps}
                    otherLoginProps={otherLoginProps}
                    locale={locale}
                    errorMessage={alertProps?.message}
                    showAuthCode={showAuthCode}
                    showOtherLoginButton={showOtherLoginButton}
                    authCodeImg={authCodeImg}
                    onAuthCodeImgChange={onAuthCodeImgChange}
                  />
                </>
              )}
            </>
          )}

          {!!enableRegister && (
            <div className={`${prefix}-switch-btn`}>
              <a onClick={switchForm} data-testid="login.register.btn">
                {
                  showRegister
                    ? formatMessage({ id: 'odc.component.Login.LogOnToAnExisting' }) //登录已有账号
                    : formatMessage({ id: 'odc.component.Login.RegisterAnAccount' }) //注册账号
                }
              </a>
            </div>
          )}
          {showWaterMark ? (
            <div className={`${prefix}-watermark-wrapper`}>
              <LogoImg className={`${prefix}-watermark`} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Login;
