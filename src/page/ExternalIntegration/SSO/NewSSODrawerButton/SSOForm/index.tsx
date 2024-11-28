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

import { getTestUserInfo, querySecretKey, testClientRegistration } from '@/common/network/manager';
import HelpDoc from '@/component/helpDoc';
import {
  IAuthorizationGrantType,
  IClientAuthenticationMethod,
  ISSOConfig,
  ISSOType,
  ISSO_LDAP_CONFIG,
  ISSO_MAPPINGRULE,
  ISSO_SAML_CONFIG,
  IUserInfoAuthenticationMethod,
} from '@/d.ts';
import { UserStore } from '@/store/login';
import channel, { ChannelMap } from '@/util/broadcastChannel';
import { formatMessage } from '@/util/intl';
import logger from '@/util/logger';
import { encrypt } from '@/util/utils';
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
import { useWatch } from 'antd/lib/form/Form';
import md5 from 'blueimp-md5';
import { cloneDeep } from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { LDAPPartForm, OAUTH2PartForm, OIDCPartForm, SAMLPartForm } from './PartForm';

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
export enum SAMLType {
  verification = 'verification',
  signing = 'signing',
  decryption = 'decryption',
}
export interface IFormRef {
  form: FormInstance<ISSOConfig>;
  registrationId: string;
  testInfo: string;
}

export interface SAMLCheckBoxConfigType {
  verification: { checked: boolean; value: string };
  signing: {
    checked: boolean;
    value: string;
  };
  decryption: {
    checked: boolean;
    value: string;
  };
}

export default inject('userStore')(
  observer(
    forwardRef(function NewSSODrawerButton(
      { userStore, isEdit, editData, onTestInfoChanged }: IProps,
      ref: React.RefObject<{
        form: FormInstance<ISSOConfig>;
      }>,
    ) {
      const [form] = Form.useForm<ISSOConfig>();
      const type = useWatch('type', form);
      const userProfileViewType = useWatch(['mappingRule', 'userProfileViewType'], form);
      const userNickNameField = useWatch(['mappingRule', 'userNickNameField'], form);
      const loginWindow = useRef<Window>();

      const channelStatusRef = useRef<boolean>(false);
      const timer = useRef<NodeJS.Timer>();
      const [showExtraConfig, setShowExtraConfig] = useState(!!isEdit);
      const [showExtraConfigForSAML, setShowExtraConfigForSAML] = useState(!!isEdit);
      const [registrationId, setRegistrationId] = useState('');
      const [testInfo, _setTestInfo] = useState<string>();
      const [SAMLCheckBoxConfig, setSAMLCheckBoxConfig] = useState<SAMLCheckBoxConfigType>({
        verification: { checked: false, value: '' },
        signing: {
          checked: false,
          value: '',
        },
        decryption: {
          checked: false,
          value: '',
        },
      });

      function setTestInfo(v: string) {
        _setTestInfo(v);
        onTestInfoChanged(v);
      }
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
              defaultMessage: '窗口异常关闭，请等待窗口创建，输入账号密码点击登录后完成连接测试！',
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
          case ISSOType.OAUTH2:
          case ISSOType.SAML: {
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
          ['ssoParameter', 'acsLocation'],
          ['ssoParameter', 'acsEntityId'],
          ['ssoParameter', 'metadataUri'],
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

        // const a = {
        //   configuration:
        //     '{"ldap":false,"mappingRule":{"extraInfo":null,"nestedAttributeField":null,"userAccountNameField":null,"userNickNameField":null,"userProfileViewType":null},"name":"SAML","oauth2OrOidc":false,"saml":true,"ssoParameter":{"acsBinding":"POST","acsLocation":"{baseUrl}/login/saml2/sso/{registrationId}","decryption":{"certificate":null},"entityId":"{baseUrl}/saml2/service-provider-metadata/{registrationId}","metadataUri":"https://odctestsaml.authing.cn/api/v2/saml-idp/672322db437a57d3142edfc1/metadata","name":"SAML","providerEntityId":null,"registrationId":"1-SAML","signing":{"certificate":"-----BEGIN CERTIFICATE-----\\\\nMIIDITCCAgmgAwIBAgIJAKoHfqzUOkELMA0GCSqGSIb3DQEBCwUAMFAxDTALBgNVBAMMBFRlc3QxDDAKBgNVBAoMA09EQzERMA8GA1UEBwwISGFuZ3pob3UxETAPBgNVBAgMCEhhbmd6aG91MQswCQYDVQQGEwJDTjAeFw0yNDExMDExMjIwMTRaFw0yNTExMDExMjIwMTRaMFAxDTALBgNVBAMMBFRlc3QxDDAKBgNVBAoMA09EQzERMA8GA1UEBwwISGFuZ3pob3UxETAPBgNVBAgMCEhhbmd6aG91MQswCQYDVQQGEwJDTjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBANvIuezSjME9NKNlfcvyMRdn51/dHvuVT0OV9pJr04qT3VZArJuiibiLPS9I+CSu+4WRlvBrgmf6QSKt8Irm86dXTVU8t6o92SUsdBPslHG9lLfhKU4yQLbE1X3t0pQHJ3YSON7s9iJ2NtlFk47+bgS02eeAkffjYq1bD7YvIlkeLl9fFh9QTB0rLIMyBc7jftygjogLKQ6ZwLw5IxViMi64KAkFxkePJz8S5nQ0X4/cpM5p6GeWgk5WDxCOcUYlzoyVRx9HrwdFUKmPsyuRTPRKunuFwPuVEi2O2QqfqSqGQg6/yZDdX6scvh40HFamT7+34C5JYJn+8g2MHLc/MdMCAwEAATANBgkqhkiG9w0BAQsFAAOCAQEAMSaAF6TPp3nAh3T9E4ZVN+fXQZsxd8BuvgMl410oJiAAdnDQPPcXO7I+FwISFKBKl5n2W8TIMis3NUhO52eD+uLtVK+lGRTw0U9qtOfplirDfXRTGriWPobNQwTZJGOAukZNeC24KklM3EqhOmoiOD93qlg3REaBqDmlquAYimn/BmE+KsgALzbThvkCsTcs3Rth+Y0Io63xw8qNzgoZyhoqQhpz7lb05w9QLTWqIPAwi+H9+myIokjyKjLtUL5KS/oRZ54KgXzK++fqsU/hrukx47wg4gZjN0v6gsrvezi/BPxWDIfa4Trju4k8kRHHzybhmxhsjAHqOOJgW0mptQ==\\\\n-----END CERTIFICATE-----"},"singlesignon":{"binding":null,"signRequest":null,"url":null},"verification":{"certificate":null}},"type":"SAML"}',
        // };
        // const signingValue = await querySecretKey();
        // if (value.type === ISSOType.SAML) {
        //   const { acsLocation, metadataUri, acsEntityId } = value.ssoParameter;
        //   const { registrationId } = clone.ssoParameter;
        //   console.log(metadataUri);
        //   clone.ldap = false;
        //   clone.saml = true;
        //   clone.oauth2OrOidc = false;
        //   clone.ssoParameter = {
        //     decryption: { certificate: null },
        //     acsBinding: 'POST',
        //     name: value.name,
        //     acsLocation,
        //     metadataUri,
        //     registrationId,
        //     acsEntityId,
        //     providerEntityId: null,
        //     singlesignon: form.getFieldValue(['ssoParameter', 'singlesignon']),
        //     verification: { certificate: null },
        //     signing: { certificate: signingValue },
        //   };
        // }
        // console.log(SAMLCheckBoxConfig);
        // clone.ssoParameter.acsBinding = "POST";
        // clone.ssoParameter.decryption = {certificate:null};
        // clone.ssoParameter.name = form.getFieldValue('name');
        // clone.ssoParameter.signing = { certificate: signingValue };
        // clone.ssoParameter.singlesignon = form.getFieldValue(['ssoParameter', 'singlesignon']);
        // clone.ssoParameter.verification = { certificate: null };
        // console.log(clone.ssoParameter);
        // console.log(JSON.parse(a.configuration).ssoParameter);
        // const  c = '{\"name\":\"CAS\",\"type\":\"OAUTH2\",\"ssoParameter\":{\"clientId\":\"20221109\",\"authUrl\":\"https://cas.example.org:8443/cas/oauth2.0/authorize\",\"userInfoUrl\":\"https://cas.example.org:8443/cas/oauth2.0/profile\",\"tokenUrl\":\"https://cas.example.org:8443/cas/oauth2.0/accessToken\",\"redirectUrl\":\"http://11.162.217.57:9299/login/oauth2/code/1-90175b3c3d6370a3df874483caf5bc2c?odc_back_url=http%3A%2F%2F11.162.217.57%3A9299%2F%23%2Fgateway%2FeyJhY3Rpb24iOiJ0ZXN0TG9naW4iLCJkYXRhIjp7fX0%3D\",\"scope\":[\"profile\"],\"jwkSetUri\":null,\"userNameAttribute\":null,\"clientAuthenticationMethod\":\"client_secret_basic\",\"authorizationGrantType\":\"authorization_code\",\"userInfoAuthenticationMethod\":\"header\",\"registrationId\":\"1-90175b3c3d6370a3df874483caf5bc2c\"},\"mappingRule\":{\"userProfileViewType\":\"NESTED\",\"nestedAttributeField\":\"attributes\"}}';
        // console.log(JSON.parse(c).ssoParameter);
        console.log(clone);
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
              console.log('success');
              console.log(data);
              if (data?.isSuccess && !loginWindow.current?.closed) {
                message.success(
                  formatMessage({
                    id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.C5D23829' /*'测试登录成功！'*/,
                    defaultMessage: '测试登录成功！',
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
            // ['ssoParameter', 'loginFailedLimit'],
            // ['ssoParameter', 'lockTimeSeconds'],
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
                defaultMessage: '测试登录成功！',
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
        switch (form.getFieldValue('type')) {
          case ISSOType.SAML:
            form.setFieldsValue({
              ssoParameter: {
                acsLocation: `${window.ODCApiHost || location.origin}/login/saml2/sso/${id}`,
                acsEntityId: `${
                  window.ODCApiHost || location.origin
                }/saml2/service-provider-metadata/${id}`,
              },
            });
            if (showExtraConfigForSAML) {
              form.setFieldsValue({
                ssoParameter: {
                  providerEntityId: `${
                    window.ODCApiHost || location.origin
                  }/saml2/service-provider-metadata/${id}`,
                },
              });
            }
          default:
            form.setFieldsValue({
              ssoParameter: {
                redirectUrl: `${window.ODCApiHost || location.origin}/login/oauth2/code/${id}`,
              },
            });
        }
      }
      const getPartForm = (type: ISSOType) => {
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
        } else if (type === ISSOType.SAML) {
          return (
            <SAMLPartForm
              isEdit={isEdit}
              showExtraConfigForSAML={showExtraConfigForSAML}
              setShowExtraConfigForSAML={setShowExtraConfigForSAML}
              updateSAMLCheckBoxConfig={updateSAMLCheckBoxConfig}
              SAMLCheckBoxConfig={SAMLCheckBoxConfig}
              registrationId={registrationId}
              formConfig={form}
            />
          );
        } else {
          return <OIDCPartForm isEdit={isEdit} />;
        }
      };
      const redirectUrl = `${window.ODCApiHost || location.origin}/login/oauth2/code/${
        userStore?.organizationId
      }-test`;

      const updateSAMLCheckBoxConfig = async (type: string, checked: boolean, value?: string) => {
        if (checked) {
          switch (type) {
            case SAMLType.signing:
              const signingValue = await querySecretKey();
              setSAMLCheckBoxConfig({
                ...SAMLCheckBoxConfig,
                [type]: {
                  checked,
                  value: signingValue,
                },
              });
              return;
            case SAMLType.decryption:
              const decryptionValue = await querySecretKey();
              setSAMLCheckBoxConfig({
                ...SAMLCheckBoxConfig,
                [type]: {
                  checked,
                  value: decryptionValue,
                },
              });
              return;
            default:
              setSAMLCheckBoxConfig({
                ...SAMLCheckBoxConfig,
                [type]: {
                  checked,
                  value: value || SAMLCheckBoxConfig[type]?.value,
                },
              });
          }
        }

        setSAMLCheckBoxConfig({
          ...SAMLCheckBoxConfig,
          [type]: {
            checked,
            value: value || SAMLCheckBoxConfig[type]?.value,
          },
        });
      };

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
                  defaultMessage: '配置名称不超过 64 个字符',
                }), //'配置名称不超过 64 个字符'
              },
            ]}
            name={'name'}
            label={formatMessage({
              id: 'odc.NewSSODrawerButton.SSOForm.ConfigurationName',
              defaultMessage: '配置名称',
            })}
            /*配置名称*/ extra={formatMessage({
              id: 'odc.NewSSODrawerButton.SSOForm.TheConfigurationNameWillBe',
              defaultMessage: '配置名称将会应用于自定义登录名',
            })} /*配置名称将会应用于自定义登录名*/
          >
            <Input
              disabled={isEdit}
              style={{
                width: '100%',
              }}
              placeholder={formatMessage({
                id: 'odc.NewSSODrawerButton.SSOForm.PleaseEnter',
                defaultMessage: '请输入',
              })} /*请输入*/
            />
          </Form.Item>
          <Form.Item
            rules={[requiredRule]}
            name={'type'}
            label={formatMessage({
              id: 'odc.NewSSODrawerButton.SSOForm.Type',
              defaultMessage: '类型',
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
                {
                  label: 'SAML',
                  value: ISSOType.SAML,
                },
              ]}
            />
          </Form.Item>
          <Form.Item noStyle shouldUpdate>
            {getPartForm(type)}
          </Form.Item>
          <Form.Item noStyle shouldUpdate>
            {type !== ISSOType.LDAP ? (
              <Form.Item
                rules={[requiredRule]}
                name={['mappingRule', 'userProfileViewType']}
                label={formatMessage({
                  id: 'odc.NewSSODrawerButton.SSOForm.UserInformationDataStructureType',
                  defaultMessage: '用户信息数据结构类型',
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
                    defaultMessage: '请输入',
                  })} /*请输入*/
                />
              </Form.Item>
            ) : null}
          </Form.Item>
          <Form.Item shouldUpdate noStyle>
            {userProfileViewType === 'NESTED' && (
              <Form.Item
                label={formatMessage({
                  id: 'odc.NewSSODrawerButton.SSOForm.ObtainNestedUserData',
                  defaultMessage: '获取嵌套用户数据',
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
                    defaultMessage: '请输入',
                  })} /*请输入*/
                />
              </Form.Item>
            )}
          </Form.Item>
          <Form.Item noStyle shouldUpdate>
            <Form.Item>
              <HelpDoc
                leftText
                title={
                  formatMessage(
                    {
                      id: 'odc.NewSSODrawerButton.SSOForm.ASeparateCallbackWhitelistIs',
                      defaultMessage: '测试连接需要单独的回调白名单，请手动添加 {redirectUrl}',
                    },
                    { redirectUrl },
                  ) //`测试连接需要单独的回调白名单，请手动添加 ${redirectUrl}`
                }
              >
                <a onClick={() => testByType(type)}>
                  {
                    formatMessage({
                      id: 'odc.NewSSODrawerButton.SSOForm.TestConnection',
                      defaultMessage: '测试连接',
                    }) /*测试连接*/
                  }
                </a>
              </HelpDoc>
            </Form.Item>
          </Form.Item>
          {testInfo ? (
            <Alert
              type="success"
              showIcon
              message={formatMessage({
                id: 'odc.NewSSODrawerButton.SSOForm.TestConnectionSuccessful',
                defaultMessage: '测试连接成功',
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
                defaultMessage: '请先进行测试连接，跳转完成登录后，成功获取测试信息即可保存该配置',
              })} /*请先进行测试连接，跳转完成登录后，成功获取测试信息即可保存该配置*/
            />
          )}

          <Typography.Title level={5}>
            {
              formatMessage({
                id: 'odc.NewSSODrawerButton.SSOForm.UserFieldMapping',
                defaultMessage: '用户字段映射',
              }) /*用户字段映射*/
            }
          </Typography.Title>
          <Form.Item noStyle shouldUpdate>
            {type !== ISSOType.LDAP && (
              <Form.Item
                rules={[requiredRule]}
                name={['mappingRule', 'userAccountNameField']}
                label={formatMessage({
                  id: 'odc.NewSSODrawerButton.SSOForm.UsernameField',
                  defaultMessage: '用户名字段',
                })} /*用户名字段*/
              >
                <Input
                  style={{
                    width: 200,
                  }}
                  placeholder={formatMessage({
                    id: 'odc.NewSSODrawerButton.SSOForm.PleaseEnter',
                    defaultMessage: '请输入',
                  })} /*请输入*/
                />
              </Form.Item>
            )}
          </Form.Item>
          <Form.Item noStyle shouldUpdate>
            <Form.Item
              rules={[requiredRule]}
              name={['mappingRule', 'userNickNameField']}
              label={formatMessage({
                id: 'odc.NewSSODrawerButton.SSOForm.UserNicknameField',
                defaultMessage: '用户昵称字段',
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
                  defaultMessage: '请输入',
                })} /*请输入*/
              />
            </Form.Item>
          </Form.Item>
          <Form.Item noStyle shouldUpdate>
            {type === ISSOType.LDAP ? (
              <Form.Item
                rules={[requiredRule]}
                name={['mappingRule', 'userProfileViewType']}
                label={formatMessage({
                  id: 'odc.NewSSODrawerButton.SSOForm.UserInformationDataStructureType',
                  defaultMessage: '用户信息数据结构类型',
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
                    defaultMessage: '请输入',
                  })} /*请输入*/
                />
              </Form.Item>
            ) : null}
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
                    defaultMessage: '自定义字段',
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
                              defaultMessage: '请输入字段',
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
                              defaultMessage: '请输入自定义字段映射规则',
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
                        defaultMessage: '添加',
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
