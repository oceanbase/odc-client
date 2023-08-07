import setting from '@/store/setting';
import { formatMessage } from '@/util/intl';
import {
  LockOutlined,
  SafetyCertificateOutlined,
  SyncOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Alert, Button, Divider, Form, Input, Space } from 'antd';
import type { FormProps } from 'antd/lib/form';
import classNames from 'classnames';
import React, { useState } from 'react';
import type { LoginLocale } from '.';
import { getPrefix } from './index';
import './index.less';

export interface Values {
  username: string;
  password: string;
}

export interface ILoginFormProps extends FormProps {
  loading?: boolean;
  locale?: LoginLocale;
  errorMessage?: React.ReactNode | string;
  showAuthCode?: boolean;
  showOtherLoginButton?: boolean;
  authCodeImg?: string;
  otherLoginProps?: any;
  onAuthCodeImgChange?: () => void;
}

const Login: React.FC<ILoginFormProps> = ({
  loading,
  locale,
  errorMessage,
  showAuthCode,
  showOtherLoginButton,
  authCodeImg,
  otherLoginProps,
  onAuthCodeImgChange,
  ...restProps
}) => {
  const [focusInput, setFocusInput] = useState('');
  const prefix = getPrefix('login');

  return (
    <Form
      layout="vertical"
      hideRequiredMark={true}
      className={`${prefix}-form`}
      {...restProps}
      data-testid="login.form"
    >
      <Form.Item
        name="username"
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'odc.component.Login.LoginForm.TheUsernameCannotBeEmpty',
            }), //用户名不能为空
          },
        ]}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder={formatMessage({
            id: 'odc.component.Login.LoginForm.EnterAUsername',
          })} /*请输入用户名*/
          onFocus={() => {
            setFocusInput('username');
          }}
          onBlur={() => {
            setFocusInput('');
          }}
          className={classNames({
            [`${prefix}-focus-input`]: focusInput === 'username',
          })}
        />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'odc.component.Login.LoginForm.ThePasswordCannotBeEmpty',
            }), //密码不能为空
          },
        ]}
      >
        <Input.Password
          visibilityToggle={false}
          autoComplete="current-password"
          prefix={<LockOutlined />}
          placeholder={formatMessage({
            id: 'odc.component.Login.LoginForm.EnterAPassword',
          })} /*请输入密码*/
          onFocus={() => {
            setFocusInput('password');
          }}
          onBlur={() => {
            setFocusInput('');
          }}
          className={focusInput === 'password' ? `${prefix}-focus-input` : ''}
        />
      </Form.Item>
      {showAuthCode && (
        <Space className={`${prefix}-auth-code`}>
          <Form.Item
            name="authCode"
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.component.Login.LoginForm.TheVerificationCodeCannotBe',
                }), //验证码不能为空
              },
            ]}
          >
            <Input
              prefix={<SafetyCertificateOutlined />}
              placeholder={formatMessage({
                id: 'odc.component.Login.LoginForm.PleaseEnterAVerificationCode',
              })} /*请输入验证码*/
              onFocus={() => {
                setFocusInput('authCode');
              }}
              onBlur={() => {
                setFocusInput('');
              }}
              className={classNames({
                [`${prefix}-focus-input`]: focusInput === 'authCode',
              })}
            />
          </Form.Item>
          <div className={classNames(`${prefix}-code-btn`)}>
            <img src={authCodeImg} alt="" width="96" height="48" />
            <div className={`${prefix}-code-mask`} onClick={onAuthCodeImgChange}>
              <SyncOutlined />
            </div>
          </div>
        </Space>
      )}

      <Button
        // 按下回车键，即可触发点击事件
        htmlType="submit"
        loading={loading}
        type="primary"
        block={true}
        className={`${prefix}-submit-btn`}
      >
        {formatMessage({ id: 'odc.component.Login.LoginForm.Login' }) /*登录*/}
      </Button>
      {showOtherLoginButton && (
        <>
          <Divider style={{ color: 'var(--text-color-hint)' }} plain>
            {
              formatMessage({
                id: 'odc.component.Login.LoginForm.OtherLogonMethods',
              }) /*其他登录方式*/
            }
          </Divider>
          <Button
            htmlType="button"
            loading={otherLoginProps.loading}
            type="primary"
            style={{ marginTop: 0 }}
            block={true}
            onClick={otherLoginProps.onFinish}
            className={`${prefix}-submit-btn`}
          >
            {
              setting.serverSystemInfo?.ssoLoginName ||
                formatMessage({
                  id: 'odc.component.Login.LoginForm.ThirdPartyLogin',
                }) /*第三方登录*/
            }
          </Button>
        </>
      )}

      {errorMessage && (
        <Alert type="error" showIcon={true} className={`${prefix}-alert`} message={errorMessage} />
      )}
    </Form>
  );
};

export default Login;
