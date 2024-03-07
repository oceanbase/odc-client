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
  ISSO_LDAP_CONFIG,
  ISSO_MAPPINGRULE,
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
  Typography,
} from 'antd';
import md5 from 'blueimp-md5';
import { inject, observer } from 'mobx-react';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import HelpDoc from '@/component/helpDoc';
import { encrypt } from '@/util/utils';
import { cloneDeep } from 'lodash';
import channel, { ChannelMap } from '@/util/broadcastChannel';
import logger from '@/util/logger';
import { OAUTH2PartForm, LDAPPartForm, OIDCPartForm } from './PartForm';

export const requiredRule = {
  required: true,
};
interface IProps {
  userStore?: UserStore;
  isEdit?: boolean;
  editData?: ISSOConfig;
  onTestInfoChanged: (testInfo: string) => void;
}
export enum ELDAPMode {
  LOGIN = 'LOGIN',
  TEST = 'TEST',
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
      ref: React.RefObject<{
        form: FormInstance<ISSOConfig>;
      }>,
    ) {
      const loginWindow = useRef<Window>();
      const channelStatusRef = useRef<boolean>(false);
      const timer = useRef<NodeJS.Timer>();
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
      // 重复发送消息，直到确认接收方正确接收到了数据。
      function sendDataUntilComfirmedReceive(
        value: {
          mode: ELDAPMode;
          data: {
            name: string;
            type: ISSOType.LDAP;
            ssoParameter: ISSO_LDAP_CONFIG;
            mappingRule: Omit<ISSO_MAPPINGRULE, 'userAccountNameField'>;
          };
        },
        time: number = 1,
      ) {
        if (loginWindow.current?.closed && !channelStatusRef?.current) {
          message.error(
            formatMessage({
              id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.DCD2CBF1' /*'窗口异常关闭，请等待窗口创建，输入账号密码点击登录后完成连接测试！'*/,
            }),
          );
          channel.close([ChannelMap.LDAP_MAIN, ChannelMap.LDAP_TEST]);
          clearTimeout(timer.current);
          timer.current = null;
          return;
        }
        if (channelStatusRef?.current) {
          logger.log(
            `[${ChannelMap.LDAP_MAIN}] LDAPModal received the message from current component, stop recurse.`,
          );
          clearTimeout(timer.current);
          timer.current = null;
          return;
        }
        // 确保测试窗口能够正确接收到测试连接所需的相关数据。
        timer.current = setTimeout(() => {
          logger.log(
            `[${ChannelMap.LDAP_MAIN}] try to send message to component LDAPModal, accept success ? ${channelStatusRef?.current}, retry send ${time} times`,
          );
          channel.send(ChannelMap.LDAP_MAIN, value);
          sendDataUntilComfirmedReceive(value, time + 1);
        }, 1000);
      }
      useEffect(() => {
        return () => {
          clearTimeout(timer.current);
          timer.current = null;
          // 当前组件可能使用到的频道都需要关闭，释放内存。
          channel.close([ChannelMap.LDAP_MAIN, ChannelMap.LDAP_TEST, ChannelMap.ODC_SSO_TEST]);
          loginWindow.current?.close();
        };
      }, []);
      async function testByType(type: ISSOType) {
        switch (type) {
          case ISSOType.LDAP: {
            testLDAP();
            break;
          }
          case ISSOType.OIDC:
          case ISSOType.OAUTH2: {
            test();
            break;
          }
        }
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
        if (value.type === ISSOType.LDAP) return;
        const clone = {
          ...value,
        };
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
            `toolbar=no,
            location=no,
            status=no,
            menubar=no,
            scrollbars=yes,
            resizable=yes,
            width=1024,
            height=600`,
          );
          channel.add(ChannelMap.ODC_SSO_TEST).listen(
            ChannelMap.ODC_SSO_TEST,
            (data) => {
              if (data?.isSuccess && !loginWindow.current?.closed) {
                message.success(
                  formatMessage({
                    id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.C5D23829' /*'测试登录成功！'*/,
                  }),
                );
                loginWindow.current?.close();
                fetchTestInfo(res?.testId);
              }
            },
            true,
          );
        }
      }
      async function testLDAP() {
        channelStatusRef.current = false;
        setTestInfo('');
        const data = await form
          .validateFields([
            'name',
            'type',
            ['ssoParameter', 'server'],
            ['ssoParameter', 'managerDn'],
            ['ssoParameter', 'managerPassword'],
            ['ssoParameter', 'userSearchBase'],
            ['ssoParameter', 'userSearchFilter'],
            ['ssoParameter', 'groupSearchBase'],
            ['ssoParameter', 'groupSearchFilter'],
            ['ssoParameter', 'groupSearchSubtree'],
            ['ssoParameter', 'loginFailedLimit'],
            ['ssoParameter', 'lockTimeSeconds'],
            ['mappingRule', 'userProfileViewType'],
            ['mappingRule', 'nestedAttributeField'],
          ])
          .catch();
        const copyData = cloneDeep(data);
        if (copyData.type !== ISSOType.LDAP) return;
        if (!isEdit) {
          copyData.ssoParameter.managerPassword = encrypt(copyData.ssoParameter.managerPassword);
          copyData.ssoParameter.registrationId = registrationId;
        } else {
          copyData.ssoParameter.registrationId = editData?.ssoParameter?.registrationId;
        }

        channel.reset();
        channel.add([ChannelMap.LDAP_TEST, ChannelMap.LDAP_MAIN]);
        if (!loginWindow.current?.closed) {
          loginWindow.current?.close();
        }
        loginWindow.current = window.open(
          location.origin + '/#/' + 'testLDAP',
          'testLDAPLogin',
          `popup = yes,
          toolbar = no,
          location = no,
          status = no,
          menubar = no,
          scrollbars = no,
          resizable = no,
          width = 460,
          innerWidth = 460,
          height = 640`,
        );
        // 监听要早于发送，确保正确接收数据。
        channel.listen(ChannelMap.LDAP_TEST, (data) => {
          channelStatusRef.current = true;
          if (data?.isSuccess) {
            channel.send(ChannelMap.LDAP_TEST, {
              receiveSuccess: true,
            });
            logger.log(
              `[${ChannelMap.LDAP_MAIN}]: current component received the message from LDAPModal`,
              data,
            );
            message.success(
              formatMessage({
                id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.565EDD98' /*'测试登录成功！'*/,
              }),
            );
            !loginWindow.current?.closed && loginWindow.current?.close();
            fetchTestInfo(data?.testId);
          }
        });

        sendDataUntilComfirmedReceive({
          mode: ELDAPMode.TEST,
          data: copyData,
        });
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
                message: formatMessage({
                  id: 'odc.src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.TheConfigurationNameDoesNot',
                }), //'配置名称不超过 64 个字符'
              },
            ]}
            name={'name'}
            label={formatMessage({
              id: 'odc.NewSSODrawerButton.SSOForm.ConfigurationName',
            })}
            /*配置名称*/ extra={formatMessage({
              id: 'odc.NewSSODrawerButton.SSOForm.TheConfigurationNameWillBe',
            })} /*配置名称将会应用于自定义登录名*/
          >
            <Input
              disabled={isEdit}
              style={{
                width: '100%',
              }}
              placeholder={formatMessage({
                id: 'odc.NewSSODrawerButton.SSOForm.PleaseEnter',
              })} /*请输入*/
            />
          </Form.Item>
          <Form.Item
            rules={[requiredRule]}
            name={'type'}
            label={formatMessage({
              id: 'odc.NewSSODrawerButton.SSOForm.Type',
            })} /*类型*/
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
                {
                  label: 'LDAP',
                  value: ISSOType.LDAP,
                },
              ]}
            />
          </Form.Item>
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const type = getFieldValue(['type']);
              if (type === ISSOType.OAUTH2) {
                return (
                  <OAUTH2PartForm
                    isEdit={isEdit}
                    showExtraConfig={showExtraConfig}
                    setShowExtraConfig={setShowExtraConfig}
                  />
                );
              } else if (type === ISSOType.LDAP) {
                return <LDAPPartForm isEdit={isEdit} />;
              } else {
                return <OIDCPartForm isEdit={isEdit} />;
              }
            }}
          </Form.Item>
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const type = getFieldValue(['type']);
              return type !== ISSOType.LDAP ? (
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
                    style={{
                      width: 200,
                    }}
                    placeholder={formatMessage({
                      id: 'odc.NewSSODrawerButton.SSOForm.PleaseEnter',
                    })} /*请输入*/
                  />
                </Form.Item>
              ) : null;
            }}
          </Form.Item>
          <Form.Item shouldUpdate noStyle>
            {({ getFieldValue }) => {
              const userProfileViewType = getFieldValue(['mappingRule', 'userProfileViewType']);
              if (userProfileViewType === 'NESTED') {
                return (
                  <Form.Item
                    label={formatMessage({
                      id: 'odc.NewSSODrawerButton.SSOForm.ObtainNestedUserData',
                    })}
                    /*获取嵌套用户数据*/ name={['mappingRule', 'nestedAttributeField']}
                    rules={[requiredRule]}
                  >
                    <Input
                      style={{
                        width: '100%',
                      }}
                      placeholder={formatMessage({
                        id: 'odc.NewSSODrawerButton.SSOForm.PleaseEnter',
                      })} /*请输入*/
                    />
                  </Form.Item>
                );
              }
            }}
          </Form.Item>

          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const type = getFieldValue(['type']);
              return (
                <Form.Item>
                  <HelpDoc
                    leftText
                    title={
                      formatMessage(
                        {
                          id: 'odc.NewSSODrawerButton.SSOForm.ASeparateCallbackWhitelistIs',
                        },
                        {
                          redirectUrl: redirectUrl,
                        },
                      ) //`测试连接需要单独的回调白名单，请手动添加 ${redirectUrl}`
                    }
                  >
                    <a onClick={() => testByType(type)}>
                      {
                        formatMessage({
                          id: 'odc.NewSSODrawerButton.SSOForm.TestConnection',
                        }) /*测试连接*/
                      }
                    </a>
                  </HelpDoc>
                </Form.Item>
              );
            }}
          </Form.Item>
          {testInfo ? (
            <Alert
              type="success"
              showIcon
              message={formatMessage({
                id: 'odc.NewSSODrawerButton.SSOForm.TestConnectionSuccessful',
              })}
              /*测试连接成功*/ style={{
                marginBottom: 12,
              }}
              description={
                <pre
                  style={{
                    maxHeight: 250,
                    overflow: 'auto',
                  }}
                >
                  {testInfo}
                </pre>
              }
            />
          ) : (
            <Alert
              type="info"
              showIcon
              style={{
                marginBottom: 12,
              }}
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
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const type = getFieldValue('type');
              if (type !== ISSOType.LDAP) {
                return (
                  <Form.Item
                    rules={[requiredRule]}
                    name={['mappingRule', 'userAccountNameField']}
                    label={formatMessage({
                      id: 'odc.NewSSODrawerButton.SSOForm.UsernameField',
                    })} /*用户名字段*/
                  >
                    <Input
                      style={{
                        width: 200,
                      }}
                      placeholder={formatMessage({
                        id: 'odc.NewSSODrawerButton.SSOForm.PleaseEnter',
                      })} /*请输入*/
                    />
                  </Form.Item>
                );
              }
            }}
          </Form.Item>
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const userNickNameField = getFieldValue(['mappingRule', 'userNickNameField']);
              return (
                <Form.Item
                  rules={[requiredRule]}
                  name={['mappingRule', 'userNickNameField']}
                  label={formatMessage({
                    id: 'odc.NewSSODrawerButton.SSOForm.UserNicknameField',
                  })} /*用户昵称字段*/
                >
                  <Select
                    mode="tags"
                    defaultValue={userNickNameField ? userNickNameField : undefined}
                    style={{
                      width: 200,
                    }}
                    placeholder={formatMessage({
                      id: 'odc.NewSSODrawerButton.SSOForm.PleaseEnter',
                    })} /*请输入*/
                  />
                </Form.Item>
              );
            }}
          </Form.Item>
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const type = getFieldValue(['type']);
              return type === ISSOType.LDAP ? (
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
                    style={{
                      width: 200,
                    }}
                    placeholder={formatMessage({
                      id: 'odc.NewSSODrawerButton.SSOForm.PleaseEnter',
                    })} /*请输入*/
                  />
                </Form.Item>
              ) : null;
            }}
          </Form.Item>
          <Form.List name={['mappingRule', 'extraInfo']}>
            {(fields, operation) => {
              return (
                <Form.Item
                  style={{
                    background: 'var(--background-tertraiy-color)',
                    padding: 16,
                  }}
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
                            style={{
                              width: 180,
                            }}
                            placeholder={formatMessage({
                              id: 'odc.NewSSODrawerButton.SSOForm.EnterAField',
                            })} /*请输入字段*/
                          />
                        </Form.Item>
                        <Form.Item {...field} key={'expression'} name={[field.name, 'expression']}>
                          <Input
                            style={{
                              width: 200,
                            }}
                            placeholder={formatMessage({
                              id: 'odc.NewSSODrawerButton.SSOForm.EnterACustomFieldMapping',
                            })} /*请输入自定义字段映射规则*/
                          />
                        </Form.Item>
                        <Icon
                          style={{
                            cursor: 'pointer',
                            paddingBottom: 10,
                          }}
                          component={DeleteOutlined}
                          onClick={() => operation.remove(index)}
                        />
                      </Space>
                    );
                  })}
                  <Button
                    style={{
                      width: '100%',
                    }}
                    onClick={() => operation.add()}
                    type="dashed"
                  >
                    <Icon
                      style={{
                        verticalAlign: 'text-bottom',
                      }}
                      component={PlusOutlined}
                    />

                    {
                      formatMessage({
                        id: 'odc.NewSSODrawerButton.SSOForm.Add',
                      }) /*添加*/
                    }
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
