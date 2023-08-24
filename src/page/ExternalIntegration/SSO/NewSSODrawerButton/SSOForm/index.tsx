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

import { getTestUserInfo, testClientRegistration } from '@/common/network/manager';
import {
  IAuthorizationGrantType,
  IClientAuthenticationMethod,
  ISSOConfig,
  ISSOType,
  IUserInfoAuthenticationMethod,
} from '@/d.ts';
import { UserStore } from '@/store/login';
import { formatMessage } from '@/util/intl';
import Icon, { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Form,
  FormInstance,
  Input,
  message,
  Radio,
  Select,
  Space,
  Switch,
  Typography,
} from 'antd';
import md5 from 'blueimp-md5';
import { inject, observer } from 'mobx-react';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

import HelpDoc from '@/component/helpDoc';
import { encrypt } from '@/util/utils';

const requiredRule = {
  required: true,
};

interface IProps {
  userStore?: UserStore;
  isEdit?: boolean;
  editData?: ISSOConfig;
  onTestInfoChanged: (testInfo: string) => void;
}

export interface IFormRef {
  form: FormInstance<ISSOConfig>;
  registrationId: string;
  testInfo: string;
}

export default inject('userStore')(
  observer(
    forwardRef(function NewSSODrawerButton(
      { userStore, isEdit, editData, onTestInfoChanged }: IProps,
      ref: React.RefObject<{ form: FormInstance<ISSOConfig> }>,
    ) {
      const loginWindow = useRef<Window>();
      const testListener = useRef<(e) => void>();
      const [showExtraConfig, setShowExtraConfig] = useState(!!isEdit);
      const [registrationId, setRegistrationId] = useState('');
      const [testInfo, _setTestInfo] = useState<string>();

      function setTestInfo(v: string) {
        _setTestInfo(v);
        onTestInfoChanged(v);
      }

      const [form] = Form.useForm<ISSOConfig>();

      useImperativeHandle(
        ref,
        () => {
          return {
            form,
            registrationId,
            testInfo,
          };
        },
        [form, registrationId, testInfo],
      );

      async function fetchTestInfo(testId: string) {
        const data = await getTestUserInfo(testId);
        let text;
        try {
          text = JSON.stringify(JSON.parse(data), null, 4);
        } catch (e) {
          console.error('parse error', e);
          text = data;
        }
        setTestInfo(text);
      }
      function removeTestListener() {
        if (testListener.current) {
          window.removeEventListener('odcssotest', testListener.current);
          testListener.current = null;
        }
      }

      useEffect(() => {
        removeTestListener();
      }, []);
      function addTestListener(testId: string) {
        removeTestListener();
        testListener.current = (e) => {
          message.success(
            formatMessage({ id: 'odc.NewSSODrawerButton.SSOForm.TheTestConnectionIsSuccessful' }), //测试连接成功！
          );
          fetchTestInfo(testId);
          loginWindow.current?.close();
          loginWindow.current = null;
        };
        window.addEventListener('odcssotest', testListener.current);
      }

      async function test() {
        setTestInfo('');
        const value = await form.validateFields([
          'name',
          'type',
          ['ssoParameter', 'clientId'],
          ['ssoParameter', 'secret'],
          ['ssoParameter', 'authUrl'],
          ['ssoParameter', 'userInfoUrl'],
          ['ssoParameter', 'tokenUrl'],
          ['ssoParameter', 'redirectUrl'],
          ['ssoParameter', 'scope'],
          ['ssoParameter', 'jwkSetUri'],
          ['ssoParameter', 'userNameAttribute'],
          ['ssoParameter', 'clientAuthenticationMethod'],
          ['ssoParameter', 'authorizationGrantType'],
          ['ssoParameter', 'userInfoAuthenticationMethod'],
          ['ssoParameter', 'issueUrl'],
          ['mappingRule', 'userProfileViewType'],
          ['mappingRule', 'nestedAttributeField'],
        ]);
        if (!value) {
          return;
        }
        const clone = { ...value };

        clone.ssoParameter.redirectUrl = `${
          clone.ssoParameter.redirectUrl
        }?odc_back_url=${encodeURIComponent(
          location.origin + '/' + '#/gateway/eyJhY3Rpb24iOiJ0ZXN0TG9naW4iLCJkYXRhIjp7fX0=',
        )}`;
        if (!isEdit) {
          clone.ssoParameter.secret = encrypt(clone.ssoParameter.secret);
          clone.ssoParameter.registrationId = registrationId;
        } else {
          clone.ssoParameter.registrationId = editData?.ssoParameter?.registrationId;
        }
        const res = await testClientRegistration(clone, 'info');
        if (res?.testLoginUrl) {
          loginWindow.current = window.open(
            res?.testLoginUrl,
            'testlogin',
            `
                    toolbar=no,
                    location=no,
                    status=no,
                    menubar=no,
                    scrollbars=yes,
                    resizable=yes,
                    width=1024,
                    height=600
                `,
          );
          addTestListener(res?.testId);
        }
      }

      function updateRegistrationId(name) {
        var md5Hex = md5(`${name || ''}`);
        const id = `${userStore?.organizationId}-${md5Hex}`;
        setRegistrationId(id);
        form.setFieldsValue({
          ssoParameter: {
            redirectUrl: `${window.ODCApiHost || location.origin}/login/oauth2/code/${id}`,
          },
        });
      }
      const redirectUrl = `${window.ODCApiHost || location.origin}/login/oauth2/code/${
        userStore?.organizationId
      }-test`;
      return (
        <Form
          layout="vertical"
          requiredMark="optional"
          form={form}
          initialValues={{
            type: ISSOType.OAUTH2,
            ssoParameter: {
              userInfoAuthenticationMethod: IUserInfoAuthenticationMethod.header,
              authorizationGrantType: IAuthorizationGrantType.authorization_code,
              clientAuthenticationMethod: IClientAuthenticationMethod.client_secret_basic,
              scope: ['profile'],
              userProfileViewType: 'FLAT',
            },
            mappingRule: {
              userProfileViewType: 'FLAT',
              extraInfo: [
                {
                  attributeName: null,
                  expression: null,
                },
              ],
            },
          }}
          onValuesChange={(cValues: Partial<ISSOConfig>) => {
            if (cValues.hasOwnProperty('name')) {
              updateRegistrationId(cValues.name);
            }
          }}
        >
          <Form.Item
            rules={[
              requiredRule,
              {
                max: 64,
                message: '配置名称不超过 64 个字符',
              },
            ]}
            name={'name'}
            label={formatMessage({
              id: 'odc.NewSSODrawerButton.SSOForm.ConfigurationName',
            })} /*配置名称*/
            extra={formatMessage({
              id: 'odc.NewSSODrawerButton.SSOForm.TheConfigurationNameWillBe',
            })} /*配置名称将会应用于自定义登录名*/
          >
            <Input
              disabled={isEdit}
              style={{ width: '100%' }}
              placeholder={formatMessage({
                id: 'odc.NewSSODrawerButton.SSOForm.PleaseEnter',
              })} /*请输入*/
            />
          </Form.Item>
          <Form.Item
            rules={[requiredRule]}
            name={'type'}
            label={formatMessage({ id: 'odc.NewSSODrawerButton.SSOForm.Type' })} /*类型*/
          >
            <Radio.Group
              disabled={isEdit}
              optionType="button"
              options={[
                {
                  label: 'OAUTH2',
                  value: ISSOType.OAUTH2,
                },
                {
                  label: 'OIDC',
                  value: ISSOType.OIDC,
                },
              ]}
            />
          </Form.Item>
          <Typography.Title level={5}>
            {
              formatMessage({
                id: 'odc.NewSSODrawerButton.SSOForm.OauthInformation',
              }) /*OAUTH 信息*/
            }
          </Typography.Title>
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const type = getFieldValue(['type']);
              if (type === ISSOType.OAUTH2) {
                return (
                  <>
                    <Form.Item
                      rules={[requiredRule]}
                      name={['ssoParameter', 'clientId']}
                      label="Client ID"
                      messageVariables={{ label: 'Client ID' }}
                    >
                      <Input
                        style={{ width: '100%' }}
                        placeholder={formatMessage({
                          id: 'odc.NewSSODrawerButton.SSOForm.PleaseEnter',
                        })} /*请输入*/
                      />
                    </Form.Item>
                    <Form.Item
                      style={{ display: !isEdit ? 'block' : 'none' }}
                      rules={[requiredRule]}
                      name={['ssoParameter', 'secret']}
                      label="Client Secret"
                      messageVariables={{ label: 'Client Secret' }}
                    >
                      <Input
                        style={{ width: '100%' }}
                        placeholder={formatMessage({
                          id: 'odc.NewSSODrawerButton.SSOForm.PleaseEnter',
                        })} /*请输入*/
                      />
                    </Form.Item>
                    <Form.Item
                      rules={[requiredRule]}
                      name={['ssoParameter', 'authUrl']}
                      label={
                        <HelpDoc
                          leftText
                          title={formatMessage({
                            id: 'odc.NewSSODrawerButton.SSOForm.ObtainTheGrantCodeAddress',
                          })} /*授权服务器提供的获取 grant-code 地址*/
                        >
                          Auth URL
                        </HelpDoc>
                      }
                      messageVariables={{ label: 'Auth URL' }}
                    >
                      <Input
                        style={{ width: '100%' }}
                        placeholder={formatMessage({
                          id: 'odc.NewSSODrawerButton.SSOForm.PleaseEnter',
                        })} /*请输入*/
                      />
                    </Form.Item>
                    <Form.Item
                      rules={[requiredRule]}
                      name={['ssoParameter', 'userInfoUrl']}
                      label={
                        <HelpDoc
                          leftText
                          title={formatMessage({
                            id: 'odc.NewSSODrawerButton.SSOForm.ObtainTheUserInfoAddress',
                          })} /*授权服务器提供的获取 user-info 地址*/
                        >
                          User Info URL
                        </HelpDoc>
                      }
                      messageVariables={{ label: 'User Info URL' }}
                    >
                      <Input
                        style={{ width: '100%' }}
                        placeholder={formatMessage({
                          id: 'odc.NewSSODrawerButton.SSOForm.PleaseEnter',
                        })} /*请输入*/
                      />
                    </Form.Item>
                    <Form.Item
                      rules={[requiredRule]}
                      name={['ssoParameter', 'tokenUrl']}
                      label={
                        <HelpDoc
                          leftText
                          title={formatMessage({
                            id: 'odc.NewSSODrawerButton.SSOForm.ObtainTheAccessTokenAddress',
                          })} /*授权服务器提供的获取 access-token 地址*/
                        >
                          Token URL
                        </HelpDoc>
                      }
                      messageVariables={{ label: 'Token URL' }}
                    >
                      <Input
                        style={{ width: '100%' }}
                        placeholder={formatMessage({
                          id: 'odc.NewSSODrawerButton.SSOForm.PleaseEnter',
                        })} /*请输入*/
                      />
                    </Form.Item>
                    <Form.Item
                      rules={[requiredRule]}
                      name={['ssoParameter', 'redirectUrl']}
                      label={
                        <HelpDoc
                          leftText
                          title={formatMessage({
                            id: 'odc.NewSSODrawerButton.SSOForm.AuthorizeTheServerToCall',
                          })} /*授权服务器回调 ODC 服务的地址，如果 SSO 有回调白名单，需要进行加白*/
                        >
                          Redirect URL
                        </HelpDoc>
                      }
                      messageVariables={{ label: 'Redirect URL' }}
                    >
                      <Input.TextArea
                        autoSize={{ minRows: 2, maxRows: 3 }}
                        disabled
                        style={{ width: '100%' }}
                        placeholder={formatMessage({
                          id: 'odc.NewSSODrawerButton.SSOForm.AutomaticGeneration',
                        })} /*自动生成*/
                      />
                    </Form.Item>
                    <Form.Item
                      rules={[requiredRule]}
                      name={['ssoParameter', 'scope']}
                      label={
                        <HelpDoc
                          leftText
                          title={formatMessage({
                            id: 'odc.NewSSODrawerButton.SSOForm.TheScopeOfApplicationAuthorization',
                          })} /*应用授权作用域，多个空格隔开，建议为 profile*/
                        >
                          Scope
                        </HelpDoc>
                      }
                      messageVariables={{ label: 'Scope' }}
                    >
                      <Select
                        mode="tags"
                        style={{ width: '100%' }}
                        placeholder={formatMessage({
                          id: 'odc.NewSSODrawerButton.SSOForm.PleaseEnter',
                        })} /*请输入*/
                      />
                    </Form.Item>
                    <Space style={{ marginBottom: 12, marginTop: 10 }}>
                      <span style={{ fontWeight: 'bold' }}>
                        {
                          formatMessage({
                            id: 'odc.NewSSODrawerButton.SSOForm.AdvancedOptions',
                          }) /*高级选项*/
                        }
                      </span>
                      <Switch
                        size="small"
                        checked={showExtraConfig}
                        onChange={(v) => setShowExtraConfig(v)}
                      />
                    </Space>
                    <div style={{ display: showExtraConfig ? 'block' : 'none' }}>
                      <Form.Item
                        name={['ssoParameter', 'jwkSetUri']}
                        label={
                          <HelpDoc
                            leftText
                            title={formatMessage({
                              id: 'odc.NewSSODrawerButton.SSOForm.ThePublicKeyAddressProvided',
                            })} /*授权服务器提供的公钥地址，使用公钥进行鉴权*/
                          >
                            jwkSet URL
                          </HelpDoc>
                        }
                      >
                        <Input
                          style={{ width: '100%' }}
                          placeholder={formatMessage({
                            id: 'odc.NewSSODrawerButton.SSOForm.PleaseEnter',
                          })} /*请输入*/
                        />
                      </Form.Item>
                      <Form.Item
                        name={['ssoParameter', 'userNameAttribute']}
                        label={
                          <HelpDoc
                            leftText
                            title={formatMessage({
                              id: 'odc.NewSSODrawerButton.SSOForm.UserNameField',
                            })} /*用户名称字段*/
                          >
                            userNameAttribute
                          </HelpDoc>
                        }
                      >
                        <Input
                          style={{ width: '100%' }}
                          placeholder={formatMessage({
                            id: 'odc.NewSSODrawerButton.SSOForm.PleaseEnter',
                          })} /*请输入*/
                        />
                      </Form.Item>
                      <Form.Item
                        rules={[requiredRule]}
                        name={['ssoParameter', 'clientAuthenticationMethod']}
                        label={
                          <HelpDoc
                            leftText
                            title={formatMessage({
                              id: 'odc.NewSSODrawerButton.SSOForm.TheAuthenticationMethodUsedTo',
                            })} /*使用授权服务器对客户端进行身份验证时使用的身份验证方法*/
                          >
                            Client Authentication Method
                          </HelpDoc>
                        }
                      >
                        <Select
                          style={{ width: 200 }}
                          options={Object.values(IClientAuthenticationMethod).map((item) => {
                            return {
                              label: item,
                              value: item,
                            };
                          })}
                        />
                      </Form.Item>
                      <Form.Item
                        rules={[requiredRule]}
                        name={['ssoParameter', 'authorizationGrantType']}
                        label={
                          <HelpDoc
                            leftText
                            title={formatMessage({
                              id: 'odc.NewSSODrawerButton.SSOForm.AuthorizationMethodOfOauth',
                            })} /*OAUTH2 的授权方式*/
                          >
                            Authorization Grant Type
                          </HelpDoc>
                        }
                      >
                        <Select
                          style={{ width: 200 }}
                          options={Object.values(IAuthorizationGrantType).map((item) => {
                            return {
                              label: item,
                              value: item,
                            };
                          })}
                        />
                      </Form.Item>
                      <Form.Item
                        rules={[requiredRule]}
                        name={['ssoParameter', 'userInfoAuthenticationMethod']}
                        label={
                          <HelpDoc
                            leftText
                            title={formatMessage({
                              id: 'odc.NewSSODrawerButton.SSOForm.AuthenticationMethodUsedWhenSending',
                            })} /*在向资源服务器发送资源请求中的承载访问令牌时使用的身份验证方法*/
                          >
                            User Info Authentication Method
                          </HelpDoc>
                        }
                      >
                        <Select
                          style={{ width: 200 }}
                          options={Object.values(IUserInfoAuthenticationMethod).map((item) => {
                            return {
                              label: item,
                              value: item,
                            };
                          })}
                        />
                      </Form.Item>
                    </div>
                  </>
                );
              } else {
                return (
                  <>
                    <Form.Item
                      rules={[requiredRule]}
                      name={['ssoParameter', 'clientId']}
                      label="Client ID"
                    >
                      <Input
                        style={{ width: '100%' }}
                        placeholder={formatMessage({
                          id: 'odc.NewSSODrawerButton.SSOForm.PleaseEnter',
                        })} /*请输入*/
                      />
                    </Form.Item>
                    <Form.Item
                      style={{ display: !isEdit ? 'block' : 'none' }}
                      rules={[requiredRule]}
                      name={['ssoParameter', 'secret']}
                      label="Client Secret"
                    >
                      <Input
                        style={{ width: '100%' }}
                        placeholder={formatMessage({
                          id: 'odc.NewSSODrawerButton.SSOForm.PleaseEnter',
                        })} /*请输入*/
                      />
                    </Form.Item>
                    <Form.Item
                      rules={[requiredRule]}
                      name={['ssoParameter', 'scope']}
                      label={
                        <HelpDoc
                          leftText
                          title={formatMessage({
                            id: 'odc.NewSSODrawerButton.SSOForm.TheScopeOfApplicationAuthorization',
                          })} /*应用授权作用域，多个空格隔开，建议为 profile*/
                        >
                          Scope
                        </HelpDoc>
                      }
                    >
                      <Select
                        mode="tags"
                        style={{ width: '100%' }}
                        placeholder={formatMessage({
                          id: 'odc.NewSSODrawerButton.SSOForm.PleaseEnter',
                        })} /*请输入*/
                      />
                    </Form.Item>
                    <Form.Item
                      rules={[requiredRule]}
                      name={['ssoParameter', 'issueUrl']}
                      label="Issue URL"
                    >
                      <Input
                        style={{ width: '100%' }}
                        placeholder={formatMessage({
                          id: 'odc.NewSSODrawerButton.SSOForm.PleaseEnter',
                        })} /*请输入*/
                      />
                    </Form.Item>
                    <Form.Item
                      rules={[requiredRule]}
                      name={['ssoParameter', 'redirectUrl']}
                      label={
                        <HelpDoc
                          leftText
                          title={formatMessage({
                            id: 'odc.NewSSODrawerButton.SSOForm.AuthorizeTheServerToCall',
                          })} /*授权服务器回调 ODC 服务的地址，如果 SSO 有回调白名单，需要进行加白*/
                        >
                          Redirect URL
                        </HelpDoc>
                      }
                    >
                      <Input.TextArea
                        autoSize={{ minRows: 2, maxRows: 3 }}
                        disabled
                        style={{ width: '100%' }}
                        placeholder={formatMessage({
                          id: 'odc.NewSSODrawerButton.SSOForm.AutomaticGeneration',
                        })} /*自动生成*/
                      />
                    </Form.Item>
                  </>
                );
              }
            }}
          </Form.Item>
          <Form.Item
            rules={[requiredRule]}
            name={['mappingRule', 'userProfileViewType']}
            label={formatMessage({
              id: 'odc.NewSSODrawerButton.SSOForm.UserInformationDataStructureType',
            })} /*用户信息数据结构类型*/
          >
            <Select
              options={[
                {
                  label: 'FLAT',
                  value: 'FLAT',
                },
                {
                  label: 'NESTED',
                  value: 'NESTED',
                },
              ]}
              style={{ width: 200 }}
              placeholder={formatMessage({
                id: 'odc.NewSSODrawerButton.SSOForm.PleaseEnter',
              })} /*请输入*/
            />
          </Form.Item>
          <Form.Item shouldUpdate noStyle>
            {({ getFieldValue }) => {
              const userProfileViewType = getFieldValue(['mappingRule', 'userProfileViewType']);
              if (userProfileViewType === 'NESTED') {
                return (
                  <Form.Item
                    label={formatMessage({
                      id: 'odc.NewSSODrawerButton.SSOForm.ObtainNestedUserData',
                    })} /*获取嵌套用户数据*/
                    name={['mappingRule', 'nestedAttributeField']}
                    rules={[requiredRule]}
                  >
                    <Input
                      style={{ width: '100%' }}
                      placeholder={formatMessage({
                        id: 'odc.NewSSODrawerButton.SSOForm.PleaseEnter',
                      })} /*请输入*/
                    />
                  </Form.Item>
                );
              }
            }}
          </Form.Item>
          <Form.Item>
            <HelpDoc
              leftText
              title={
                formatMessage(
                  {
                    id: 'odc.NewSSODrawerButton.SSOForm.ASeparateCallbackWhitelistIs',
                  },
                  { redirectUrl: redirectUrl },
                ) //`测试连接需要单独的回调白名单，请手动添加 ${redirectUrl}`
              }
            >
              <a onClick={test}>
                {
                  formatMessage({
                    id: 'odc.NewSSODrawerButton.SSOForm.TestConnection',
                  }) /*测试连接*/
                }
              </a>
            </HelpDoc>
          </Form.Item>
          {testInfo ? (
            <Alert
              type="success"
              showIcon
              message={formatMessage({
                id: 'odc.NewSSODrawerButton.SSOForm.TestConnectionSuccessful',
              })} /*测试连接成功*/
              style={{ marginBottom: 12 }}
              description={<pre style={{ maxHeight: 250, overflow: 'auto' }}>{testInfo}</pre>}
            />
          ) : (
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 12 }}
              message={formatMessage({
                id: 'odc.NewSSODrawerButton.SSOForm.PleaseTestTheConnectionFirst',
              })} /*请先进行测试连接，跳转完成登录后，成功获取测试信息即可保存该配置*/
            />
          )}

          <Typography.Title level={5}>
            {
              formatMessage({
                id: 'odc.NewSSODrawerButton.SSOForm.UserFieldMapping',
              }) /*用户字段映射*/
            }
          </Typography.Title>
          <Form.Item
            rules={[requiredRule]}
            name={['mappingRule', 'userAccountNameField']}
            label={formatMessage({
              id: 'odc.NewSSODrawerButton.SSOForm.UsernameField',
            })} /*用户名字段*/
          >
            <Input
              style={{ width: 200 }}
              placeholder={formatMessage({
                id: 'odc.NewSSODrawerButton.SSOForm.PleaseEnter',
              })} /*请输入*/
            />
          </Form.Item>
          <Form.Item
            rules={[requiredRule]}
            name={['mappingRule', 'userNickNameField']}
            label={formatMessage({
              id: 'odc.NewSSODrawerButton.SSOForm.UserNicknameField',
            })} /*用户昵称字段*/
          >
            <Select
              mode="tags"
              style={{ width: 200 }}
              placeholder={formatMessage({
                id: 'odc.NewSSODrawerButton.SSOForm.PleaseEnter',
              })} /*请输入*/
            />
          </Form.Item>
          <Form.List name={['mappingRule', 'extraInfo']}>
            {(fields, operation) => {
              return (
                <Form.Item
                  style={{ background: 'var(--background-tertraiy-color)', padding: 16 }}
                  label={formatMessage({
                    id: 'odc.NewSSODrawerButton.SSOForm.CustomFields',
                  })} /*自定义字段*/
                >
                  {fields?.map((field, index) => {
                    return (
                      <Space key={field.key}>
                        <Form.Item
                          {...field}
                          key="attributeName"
                          name={[field.name, 'attributeName']}
                        >
                          <Input
                            style={{ width: 180 }}
                            placeholder={formatMessage({
                              id: 'odc.NewSSODrawerButton.SSOForm.EnterAField',
                            })} /*请输入字段*/
                          />
                        </Form.Item>
                        <Form.Item {...field} key={'expression'} name={[field.name, 'expression']}>
                          <Input
                            style={{ width: 200 }}
                            placeholder={formatMessage({
                              id: 'odc.NewSSODrawerButton.SSOForm.EnterACustomFieldMapping',
                            })} /*请输入自定义字段映射规则*/
                          />
                        </Form.Item>
                        <Icon
                          style={{ cursor: 'pointer', paddingBottom: 10 }}
                          component={DeleteOutlined}
                          onClick={() => operation.remove(index)}
                        />
                      </Space>
                    );
                  })}
                  <Button style={{ width: '100%' }} onClick={() => operation.add()} type="dashed">
                    <Icon style={{ verticalAlign: 'text-bottom' }} component={PlusOutlined} />
                    {formatMessage({ id: 'odc.NewSSODrawerButton.SSOForm.Add' }) /*添加*/}
                  </Button>
                </Form.Item>
              );
            }}
          </Form.List>
        </Form>
      );
    }),
  ),
);
