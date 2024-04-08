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

import { testClientRegistration } from '@/common/network/manager';
import { getPrefix } from '@/component/Login';
import { ISSOConfig } from '@/d.ts';
import { UserStore } from '@/store/login';
import channel, { ChannelMap } from '@/util/broadcastChannel';
import { formatMessage, getLocalImg } from '@/util/intl';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Button, Divider, Form, Input, message } from 'antd';
import useForm, { FormInstance } from 'antd/lib/form/hooks/useForm';
import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import { useEffect, useState } from 'react';
import { toDefaultProjectPage } from '@/service/projectHistory';
import logger from '@/util/logger';
import { history } from '@umijs/max';
import { ELDAPMode } from '@/page/ExternalIntegration/SSO/NewSSODrawerButton/SSOForm';

const LDAP: React.FC<{
  userStore: UserStore;
}> = ({ userStore }) => {
  return (
    <div
      style={{
        width: '460px',
      }}
    >
      <LDAPLogin isTest={true} />
    </div>
  );
};
export default inject('userStore')(observer(LDAP));
export const LDAPLogin: React.FC<{
  isTest?: boolean;
  userStore?: UserStore;
  ssoLoginName?: string;
  switchSSOLoginType?: () => void;
}> = inject('userStore')(
  observer(({ isTest = false, userStore, ssoLoginName, switchSSOLoginType = null }) => {
    const prefix = getPrefix('login');
    const [isSubmiting, setIsSubmiting] = useState<boolean>(false);
    const [form] = useForm<{
      username: string;
      password: string;
    }>();
    const [formData, setFormData] = useState<{
      mode: ELDAPMode;
      data: ISSOConfig;
    }>();
    const [errorMessage, setErrorMessage] = useState<string>(null);
    const handleTest = async () => {
      const data = await form.validateFields().catch();
      if (isSubmiting) {
        return;
      }
      setIsSubmiting(true);
      const res = await testClientRegistration(formData?.data, 'test');
      if (!res?.testId) {
        setIsSubmiting(false);
        return;
      }
      const result = await userStore.ldapLogin({
        username: data?.username,
        password: data?.password,
        testId: res.testId,
        registrationId: res?.testRegistrationId,
      });
      if (!result?.successful) {
        setIsSubmiting(false);
        setErrorMessage(result?.errMsg);
      } else {
        channel.send(ChannelMap.LDAP_TEST, {
          isSuccess: true,
          testId: res.testId,
        });
        setIsSubmiting(false);
        setErrorMessage(null);
      }
    };
    const handleLogin = async () => {
      const data = await form.validateFields().catch();
      if (isSubmiting) {
        return;
      }
      setIsSubmiting(true);
      const result = await userStore.ldapLogin({
        username: data?.username,
        password: data?.password,
      });
      console.log(result);
      if (result?.successful) {
        message.success(formatMessage({ id: 'login.login.success' }));
        setErrorMessage(null);
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
      } else {
        setErrorMessage(result?.errMsg);
        console.error(result);
      }
      setIsSubmiting(false);
    };
    useEffect(() => {
      if (isTest) {
        channel.add(ChannelMap.LDAP_TEST);
        channel.add(ChannelMap.LDAP_MAIN);
        channel.listen(ChannelMap.LDAP_TEST, (data) => {
          if (data?.receiveSuccess) {
            logger.log('[ldapTest]: comfirmed ldapMain had received message from ldapTest');
            window.close();
          }
        });
        channel.listen(ChannelMap.LDAP_MAIN, (data) => {
          setFormData(data);
          channel.send(ChannelMap.LDAP_TEST, data);
          logger.log(
            '[ldapTest]: comfirmed ldapTest had received message from ldapMain, close ldapMain',
          );
          channel.close(ChannelMap.LDAP_MAIN);
        });
      }
    }, [isTest]);
    if (isTest) {
      return (
        <div
          className={`${prefix}-container`}
          style={{
            width: '460px',
            height: '640px',
            overflow: 'hidden',
            maxWidth: '460px',
          }}
        >
          <div className={`${prefix}-card`}>
            <div className={`${prefix}-content`}>
              <LDAPLoginContent
                isSubmiting={isSubmiting}
                isTest={isTest}
                prefix={prefix}
                form={form}
                switchSSOLoginType={switchSSOLoginType}
                handleTest={handleTest}
                handleLogin={handleLogin}
              />

              {errorMessage && (
                <Alert
                  type="error"
                  showIcon={true}
                  className={`${prefix}-alert`}
                  message={errorMessage}
                />
              )}
            </div>
          </div>
        </div>
      );
    }
    return (
      <>
        <LDAPLoginContent
          ssoLoginName={ssoLoginName}
          isSubmiting={isSubmiting}
          isTest={isTest}
          prefix={prefix}
          form={form}
          switchSSOLoginType={switchSSOLoginType}
          handleTest={handleTest}
          handleLogin={handleLogin}
        />

        {errorMessage && (
          <Alert
            type="error"
            showIcon={true}
            className={`${prefix}-alert`}
            message={errorMessage}
          />
        )}
      </>
    );
  }),
);

const LDAPLoginContent: React.FC<{
  ssoLoginName?: string;
  isSubmiting: boolean;
  isTest: boolean;
  prefix: string;
  form: FormInstance<{
    username: string;
    password: string;
  }>;
  switchSSOLoginType: () => void;
  handleTest: () => void;
  handleLogin: () => void;
}> = ({
  ssoLoginName,
  isSubmiting,
  isTest,
  prefix,
  form,
  switchSSOLoginType,
  handleTest,
  handleLogin,
}) => {
  const logo = getLocalImg('version_icon.png');
  const [focusInput, setFocusInput] = useState<string>('');
  return (
    <>
      <img src={logo} alt="" className={`${prefix}-logo-small`} />
      <Divider
        style={{
          margin: '12px 0px 28px',
        }}
      />

      <div
        style={{
          fontSize: '24px',
          marginBottom: '50px',
        }}
      >
        {ssoLoginName
          ? formatMessage(
              { id: 'src.page.Login.components.LDAPModal.7201A252' },
              { ssoLoginName: ssoLoginName },
            )
          : formatMessage({ id: 'src.page.Login.components.LDAPModal.95DA8BD0' /*LDAP 登录*/ })}
      </div>
      <div>
        <Form
          form={form}
          layout="vertical"
          hideRequiredMark={true}
          className={`${prefix}-form`}
          data-testid="login.form"
        >
          <Form.Item
            name="username"
            rules={[
              {
                required: true,
                message: formatMessage({ id: 'src.page.Login.components.LDAPModal.A50C8198' }), //'账号不能为空'
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={formatMessage({ id: 'src.page.Login.components.LDAPModal.B5335F6F' })}
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
                message: formatMessage({ id: 'src.page.Login.components.LDAPModal.AA5AB5DA' }), //'LDAP 密码不能为空'
              },
            ]}
          >
            <Input.Password
              visibilityToggle={false}
              autoComplete="current-password"
              prefix={<LockOutlined />}
              placeholder={formatMessage({ id: 'src.page.Login.components.LDAPModal.9C1F7A9B' })}
              onFocus={() => {
                setFocusInput('password');
              }}
              onBlur={() => {
                setFocusInput('');
              }}
              className={focusInput === 'password' ? `${prefix}-focus-input` : ''}
            />
          </Form.Item>
          <Button
            // 按下回车键，即可触发点击事件
            htmlType="submit"
            loading={isSubmiting}
            type="primary"
            block={true}
            className={`${prefix}-submit-btn`}
            onClick={isTest ? handleTest : handleLogin}
          >
            {
              formatMessage({
                id: 'src.page.Login.components.LDAPModal.B82B6C2B' /*登录*/,
              }) /* 登录 */
            }
          </Button>
          {switchSSOLoginType ? (
            <Button style={{ marginTop: '20px' }} block type="link" onClick={switchSSOLoginType}>
              {
                formatMessage({
                  id: 'src.page.Login.components.LDAPModal.F8E8B25F' /*返回上一步*/,
                }) /* 返回上一步 */
              }
            </Button>
          ) : null}
        </Form>
      </div>
    </>
  );
};
