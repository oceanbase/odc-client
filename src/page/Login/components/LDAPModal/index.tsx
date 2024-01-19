import { testClientRegistration } from '@/common/network/manager';
import { getPrefix } from '@/component/Login';
import { ISSOConfig } from '@/d.ts';
import { UserStore } from '@/store/login';
import channel, { ChannelMap } from '@/util/broadcastChannel';
import { formatMessage, getLocalImg } from '@/util/intl';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Divider, Form, Input, message } from 'antd';
import useForm from 'antd/lib/form/hooks/useForm';
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
  switchSSOLoginType?: () => void;
}> = inject('userStore')(
  observer(({ isTest = false, userStore, switchSSOLoginType = null }) => {
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
        return message.error('测试登录失败！');
      } else {
        channel.send(ChannelMap.LDAP_TEST, {
          isSuccess: true,
          testId: res.testId,
        });
        setIsSubmiting(false);
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
      if (result?.successful) {
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
          toDefaultProjectPage();
        }
      } else {
        message.error('LDAP 登录失败，请检查输入项是否正确！');
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
            </div>
          </div>
        </div>
      );
    }
    return (
      <LDAPLoginContent
        isSubmiting={isSubmiting}
        isTest={isTest}
        prefix={prefix}
        form={form}
        switchSSOLoginType={switchSSOLoginType}
        handleTest={handleTest}
        handleLogin={handleLogin}
      />
    );
  }),
);

const LDAPLoginContent = ({
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
        LDAP 登录
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
                message: '账号不能为空',
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={'请输入 LDAP 账号'}
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
                message: 'LDAP 密码不能为空',
              },
            ]}
          >
            <Input.Password
              visibilityToggle={false}
              autoComplete="current-password"
              prefix={<LockOutlined />}
              placeholder={'请输入 LDAP 密码'}
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
            登录
          </Button>
          {switchSSOLoginType ? (
            <Button style={{ marginTop: '20px' }} block type="link" onClick={switchSSOLoginType}>
              返回上一步
            </Button>
          ) : null}
        </Form>
      </div>
    </>
  );
};