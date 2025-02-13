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

import HelpDoc from '@/component/helpDoc';
import {
  IAuthorizationGrantType,
  IClientAuthenticationMethod,
  ISSOConfig,
  IUserInfoAuthenticationMethod,
  SAMLType,
} from '@/d.ts';
import { formatMessage } from '@/util/intl';
import {
  Checkbox,
  Form,
  FormInstance,
  Input,
  InputNumber,
  message,
  Select,
  Space,
  Switch,
  Typography,
  Tooltip,
} from 'antd';
import React from 'react';
import { requiredRule, SAMLCheckBoxConfigType } from '.';
import copyToCB from 'copy-to-clipboard';
import { CopyOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import styles from './partForm.less';

const { TextArea } = Input;

export const OAUTH2PartForm: React.FC<{
  isEdit: boolean;
  showExtraConfig: boolean;
  setShowExtraConfig: (show: boolean) => void;
}> = ({ isEdit, showExtraConfig, setShowExtraConfig }) => {
  return (
    <>
      <Typography.Title level={5}>
        {
          formatMessage({
            id: 'odc.NewSSODrawerButton.SSOForm.OauthInformation',
            defaultMessage: 'OAUTH 信息',
          }) /*OAUTH 信息*/
        }
      </Typography.Title>
      <Form.Item
        rules={[requiredRule]}
        name={['ssoParameter', 'clientId']}
        label="Client ID"
        messageVariables={{
          label: 'Client ID',
        }}
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
      <Form.Item
        style={{
          display: !isEdit ? 'block' : 'none',
        }}
        rules={isEdit ? [] : [requiredRule]}
        name={['ssoParameter', 'secret']}
        label="Client Secret"
        messageVariables={{
          label: 'Client Secret',
        }}
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
      <Form.Item
        rules={[requiredRule]}
        name={['ssoParameter', 'authUrl']}
        label={
          <HelpDoc
            leftText
            title={formatMessage({
              id: 'odc.NewSSODrawerButton.SSOForm.ObtainTheGrantCodeAddress',
              defaultMessage: '授权服务器提供的获取 grant-code 地址',
            })} /*授权服务器提供的获取 grant-code 地址*/
          >
            Auth URL
          </HelpDoc>
        }
        messageVariables={{
          label: 'Auth URL',
        }}
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
      <Form.Item
        rules={[requiredRule]}
        name={['ssoParameter', 'userInfoUrl']}
        label={
          <HelpDoc
            leftText
            title={formatMessage({
              id: 'odc.NewSSODrawerButton.SSOForm.ObtainTheUserInfoAddress',
              defaultMessage: '授权服务器提供的获取 user-info 地址',
            })} /*授权服务器提供的获取 user-info 地址*/
          >
            User Info URL
          </HelpDoc>
        }
        messageVariables={{
          label: 'User Info URL',
        }}
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
      <Form.Item
        rules={[requiredRule]}
        name={['ssoParameter', 'tokenUrl']}
        label={
          <HelpDoc
            leftText
            title={formatMessage({
              id: 'odc.NewSSODrawerButton.SSOForm.ObtainTheAccessTokenAddress',
              defaultMessage: '授权服务器提供的获取 access-token 地址',
            })} /*授权服务器提供的获取 access-token 地址*/
          >
            Token URL
          </HelpDoc>
        }
        messageVariables={{
          label: 'Token URL',
        }}
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
      <Form.Item
        rules={[requiredRule]}
        name={['ssoParameter', 'redirectUrl']}
        label={
          <HelpDoc
            leftText
            title={formatMessage({
              id: 'odc.NewSSODrawerButton.SSOForm.AuthorizeTheServerToCall',
              defaultMessage: '授权服务器回调 ODC 服务的地址，如果 SSO 有回调白名单，需要进行加白',
            })} /*授权服务器回调 ODC 服务的地址，如果 SSO 有回调白名单，需要进行加白*/
          >
            Redirect URL
          </HelpDoc>
        }
        messageVariables={{
          label: 'Redirect URL',
        }}
      >
        <Input.TextArea
          autoSize={{
            minRows: 2,
            maxRows: 3,
          }}
          disabled
          style={{
            width: '100%',
          }}
          placeholder={formatMessage({
            id: 'odc.NewSSODrawerButton.SSOForm.AutomaticGeneration',
            defaultMessage: '自动生成',
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
              defaultMessage: '应用授权作用域，多个空格隔开，建议为 profile',
            })} /*应用授权作用域，多个空格隔开，建议为 profile*/
          >
            Scope
          </HelpDoc>
        }
        messageVariables={{
          label: 'Scope',
        }}
      >
        <Select
          mode="tags"
          style={{
            width: '100%',
          }}
          placeholder={formatMessage({
            id: 'odc.NewSSODrawerButton.SSOForm.PleaseEnter',
            defaultMessage: '请输入',
          })} /*请输入*/
        />
      </Form.Item>
      <Space
        style={{
          marginBottom: 12,
          marginTop: 10,
        }}
      >
        <span
          style={{
            fontWeight: 'bold',
          }}
        >
          {
            formatMessage({
              id: 'odc.NewSSODrawerButton.SSOForm.AdvancedOptions',
              defaultMessage: '高级选项',
            }) /*高级选项*/
          }
        </span>
        <Switch size="small" checked={showExtraConfig} onChange={(v) => setShowExtraConfig(v)} />
      </Space>
      <div
        style={{
          display: showExtraConfig ? 'block' : 'none',
        }}
      >
        <Form.Item
          name={['ssoParameter', 'jwkSetUri']}
          label={
            <HelpDoc
              leftText
              title={formatMessage({
                id: 'odc.NewSSODrawerButton.SSOForm.ThePublicKeyAddressProvided',
                defaultMessage: '授权服务器提供的公钥地址，使用公钥进行鉴权',
              })} /*授权服务器提供的公钥地址，使用公钥进行鉴权*/
            >
              jwkSet URL
            </HelpDoc>
          }
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
        <Form.Item
          name={['ssoParameter', 'userNameAttribute']}
          label={
            <HelpDoc
              leftText
              title={formatMessage({
                id: 'odc.NewSSODrawerButton.SSOForm.UserNameField',
                defaultMessage: '用户名称字段',
              })} /*用户名称字段*/
            >
              userNameAttribute
            </HelpDoc>
          }
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
        <Form.Item
          rules={[requiredRule]}
          name={['ssoParameter', 'clientAuthenticationMethod']}
          label={
            <HelpDoc
              leftText
              title={formatMessage({
                id: 'odc.NewSSODrawerButton.SSOForm.TheAuthenticationMethodUsedTo',
                defaultMessage: '使用授权服务器对客户端进行身份验证时使用的身份验证方法',
              })} /*使用授权服务器对客户端进行身份验证时使用的身份验证方法*/
            >
              Client Authentication Method
            </HelpDoc>
          }
        >
          <Select
            style={{
              width: 200,
            }}
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
                defaultMessage: 'OAUTH2 的授权方式',
              })} /*OAUTH2 的授权方式*/
            >
              Authorization Grant Type
            </HelpDoc>
          }
        >
          <Select
            style={{
              width: 200,
            }}
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
                defaultMessage: '在向资源服务器发送资源请求中的承载访问令牌时使用的身份验证方法',
              })} /*在向资源服务器发送资源请求中的承载访问令牌时使用的身份验证方法*/
            >
              User Info Authentication Method
            </HelpDoc>
          }
        >
          <Select
            style={{
              width: 200,
            }}
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
};
export const LDAPPartForm: React.FC<{
  isEdit: boolean;
}> = ({ isEdit }) => {
  return (
    <>
      <Typography.Title level={5}>
        {
          formatMessage({
            id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.452BC9D2' /*LDAP 信息*/,
            defaultMessage: 'LDAP 信息',
          }) /* LDAP 信息 */
        }
      </Typography.Title>
      <Form.Item
        name={['ssoParameter', 'server']}
        label={
          <HelpDoc
            leftText
            title={
              formatMessage({
                id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.C9C6091D',
                defaultMessage: 'LDAP 服务器访问地址',
              }) /*"LDAP 服务器访问地址"*/
            }
          >
            URL
          </HelpDoc>
        }
        rules={[
          {
            message: formatMessage({
              id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.DBB95C01',
              defaultMessage: '请输入server',
            }), //'请输入server'
            ...requiredRule,
          },
        ]}
      >
        <Input
          placeholder={
            formatMessage({
              id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.D0229F31',
              defaultMessage: '请输入，如：ldap://odc.example.org/dc=example,dc=com',
            }) /*"请输入，如：ldap://11.124.9.78/dc=example,dc=com"*/
          }
        />
      </Form.Item>

      <Form.Item
        name={['ssoParameter', 'managerDn']}
        label={
          <HelpDoc
            leftText
            title={
              formatMessage({
                id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.14B65EC7',
                defaultMessage: '用于访问 LDAP 的用户 DN',
              }) /*"用于访问 LDAP 的用户 DN"*/
            }
          >
            {formatMessage({
              id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.88A5F823' /*用户 DN*/,
              defaultMessage: '用户 DN',
            })}
          </HelpDoc>
        }
        rules={[
          {
            message: formatMessage({
              id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.9DBF4E00',
              defaultMessage: '请输入managerDn',
            }), //'请输入managerDn'
            ...requiredRule,
          },
        ]}
      >
        <Input
          placeholder={
            formatMessage({
              id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.B2735BBD',
              defaultMessage: '请输入，如：cn=admin,dc=example,dc=com',
            }) /*"请输入，如：cn=admin,dc=example,dc=com"*/
          }
        />
      </Form.Item>
      {!isEdit ? (
        <Form.Item
          name={['ssoParameter', 'managerPassword']}
          label={
            <HelpDoc
              leftText
              title={
                formatMessage({
                  id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.8C506EE9',
                  defaultMessage: '用于访问 LDAP 服务器的密码',
                }) /*"用于访问 LDAP 服务器的密码"*/
              }
            >
              {
                formatMessage({
                  id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.DC978DE4' /*访问密码*/,
                  defaultMessage: '访问密码',
                }) /* 访问密码 */
              }
            </HelpDoc>
          }
          rules={[
            {
              message: formatMessage({
                id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.4DF22947',
                defaultMessage: '请输入访问密码',
              }), //'请输入访问密码'
              ...requiredRule,
            },
          ]}
        >
          <Input
            placeholder={
              formatMessage({
                id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.93F4243B',
                defaultMessage: '请输入',
              }) /*"请输入"*/
            }
          />
        </Form.Item>
      ) : null}
      <Form.Item
        name={['ssoParameter', 'userSearchFilter']}
        rules={[
          {
            message: formatMessage({
              id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.A12483CB',
              defaultMessage: '请输入userSearchFilter',
            }), //'请输入userSearchFilter'
            ...requiredRule,
          },
        ]}
        label={
          <HelpDoc
            leftText
            title={
              formatMessage({
                id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.80683796',
                defaultMessage:
                  '用户查询的过滤条件，可以基于用户的属性（如用户名、邮箱、部门等）来过滤搜索结果',
              }) /*"用户查询的过滤条件，可以基于用户的属性（如用户
          名、邮箱、部门等）来过滤搜索结果"*/
            }
          >
            userSearchFilter
          </HelpDoc>
        }
      >
        <Input
          placeholder={
            formatMessage({
              id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.67DB56FF',
              defaultMessage: '请输入，如：uid={$username$}',
            }) /*"请输入，如：uid={$username$}"*/
          }
        />
      </Form.Item>
      <Form.Item
        name={['ssoParameter', 'userSearchBase']}
        rules={[
          {
            message: formatMessage({
              id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.573C0B46',
              defaultMessage: '请输入userSearchBase',
            }), //'请输入userSearchBase'
            ...requiredRule,
          },
        ]}
        label={
          <HelpDoc
            leftText
            title={
              formatMessage({
                id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.4250536F',
                defaultMessage:
                  '指定在搜索用户（user）时使用的起始点或基准点，用于限定在哪个部分或组织单位下搜索用户对象',
              }) /*"指定在搜索用户（user）时使用的起始点或基准点，
          用于限定在哪个部分或组织单位下搜索用户对象"*/
            }
          >
            userSearchBase
          </HelpDoc>
        }
      >
        <Input
          placeholder={
            formatMessage({
              id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.03CD0A4A',
              defaultMessage: '请输入，如：ou=people',
            }) /*"请输入，如：ou=people"*/
          }
        />
      </Form.Item>
      <Form.Item
        name={['ssoParameter', 'groupSearchBase']}
        label={
          <HelpDoc
            leftText
            title={
              formatMessage({
                id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.2E3212A5',
                defaultMessage: '搜索群组查询时使用的起始点或基准点',
              }) /*"搜索群组查询时使用的起始点或基准点"*/
            }
          >
            groupSearchBase
          </HelpDoc>
        }
      >
        <Input
          placeholder={
            formatMessage({
              id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.487EBC10',
              defaultMessage: '请输入',
            }) /*"请输入"*/
          }
        />
      </Form.Item>
      <Form.Item
        name={['ssoParameter', 'groupSearchFilter']}
        label={
          <HelpDoc
            leftText
            title={
              formatMessage({
                id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.C793F4C6',
                defaultMessage: '搜索群组查询的过滤条件',
              }) /*"搜索群组查询的过滤条件"*/
            }
          >
            groupSearchFilter
          </HelpDoc>
        }
      >
        <Input
          placeholder={
            formatMessage({
              id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.405C3356',
              defaultMessage: '请输入',
            }) /*"请输入"*/
          }
        />
      </Form.Item>
      <Form.Item
        name={['ssoParameter', 'groupSearchSubtree']}
        label={
          <HelpDoc
            leftText
            title={
              formatMessage({
                id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.80A8006E',
                defaultMessage: '指定是否在搜索群组时包括子树的参数',
              }) /*"指定是否在搜索群组时包括子树的参数"*/
            }
          >
            groupSearchSubtree
          </HelpDoc>
        }
        rules={[requiredRule]}
        initialValue={false}
      >
        <Select
          placeholder={
            formatMessage({
              id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.65316D1D',
              defaultMessage: '请输入',
            }) /*"请输入"*/
          }
          options={[
            {
              label: 'true',
              value: true,
            },
            {
              label: 'false',
              value: false,
            },
          ]}
        />
      </Form.Item>
      {/* <SomeFetureInODC430 tip='use it after 424'/> */}
    </>
  );
};
const SomeFetureInODC430: React.FC<{
  tip: string;
}> = ({ tip }) => {
  return (
    <>
      <Form.Item
        name={['ssoParameter', 'loginFailedLimit']}
        label={
          <HelpDoc
            leftText
            title={
              formatMessage({
                id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.F360A8FE',
                defaultMessage: '设置为0表示不设置最大连续登录失败次数',
              }) /*"设置为0表示不设置最大连续登录失败次数"*/
            }
          >
            loginFailedLimit
          </HelpDoc>
        }
        rules={[
          {
            ...requiredRule,
            message: formatMessage({
              id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.591F82D8',
              defaultMessage: '请输入最大连续登录失败次数',
            }), //'请输入最大连续登录失败次数'
          },
        ]}
        initialValue={5}
      >
        <InputNumber
          style={{ width: '200px' }}
          min={0}
          placeholder={formatMessage({
            id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.E8087E7D',
            defaultMessage: '最大连续登录失败次数',
          })}
          addonAfter={
            formatMessage({
              id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.5E8157A1',
              defaultMessage: '次',
            }) /*"次"*/
          }
        />
      </Form.Item>
      <Form.Item
        name={['ssoParameter', 'lockTimeSeconds']}
        label={
          <HelpDoc
            leftText
            title={
              formatMessage({
                id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.7AC603F1',
                defaultMessage: '多少秒后重置登录次数',
              }) /*"多少秒后重置登录次数"*/
            }
          >
            lockTimeSeconds
          </HelpDoc>
        }
        rules={[
          {
            ...requiredRule,
            message: formatMessage({
              id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.E1E62ABD',
              defaultMessage: '请输入登录次数重置时间',
            }), //'请输入登录次数重置时间'
          },
        ]}
        initialValue={600}
      >
        <InputNumber
          style={{ width: '200px' }}
          min={0}
          placeholder={formatMessage({
            id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.19909602',
            defaultMessage: '登录次数重置时间',
          })}
          addonAfter={
            formatMessage({
              id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.5FCE84A1',
              defaultMessage: '秒',
            }) /*"秒"*/
          }
        />
      </Form.Item>
    </>
  );
};
export const OIDCPartForm: React.FC<{
  isEdit: boolean;
}> = ({ isEdit }) => {
  return (
    <>
      <Typography.Title level={5}>
        {
          formatMessage({
            id: 'odc.NewSSODrawerButton.SSOForm.OauthInformation',
            defaultMessage: 'OAUTH 信息',
          }) /*OAUTH 信息*/
        }
      </Typography.Title>
      <Form.Item rules={[requiredRule]} name={['ssoParameter', 'clientId']} label="Client ID">
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
      <Form.Item
        style={{
          display: !isEdit ? 'block' : 'none',
        }}
        rules={isEdit ? [] : [requiredRule]}
        name={['ssoParameter', 'secret']}
        label="Client Secret"
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
      <Form.Item
        rules={[requiredRule]}
        name={['ssoParameter', 'scope']}
        label={
          <HelpDoc
            leftText
            title={formatMessage({
              id: 'odc.NewSSODrawerButton.SSOForm.TheScopeOfApplicationAuthorization',
              defaultMessage: '应用授权作用域，多个空格隔开，建议为 profile',
            })} /*应用授权作用域，多个空格隔开，建议为 profile*/
          >
            Scope
          </HelpDoc>
        }
      >
        <Select
          mode="tags"
          style={{
            width: '100%',
          }}
          placeholder={formatMessage({
            id: 'odc.NewSSODrawerButton.SSOForm.PleaseEnter',
            defaultMessage: '请输入',
          })} /*请输入*/
        />
      </Form.Item>
      <Form.Item rules={[requiredRule]} name={['ssoParameter', 'issueUrl']} label="Issue URL">
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
      <Form.Item
        rules={[requiredRule]}
        name={['ssoParameter', 'redirectUrl']}
        label={
          <HelpDoc
            leftText
            title={formatMessage({
              id: 'odc.NewSSODrawerButton.SSOForm.AuthorizeTheServerToCall',
              defaultMessage: '授权服务器回调 ODC 服务的地址，如果 SSO 有回调白名单，需要进行加白',
            })} /*授权服务器回调 ODC 服务的地址，如果 SSO 有回调白名单，需要进行加白*/
          >
            Redirect URL
          </HelpDoc>
        }
      >
        <Input.TextArea
          autoSize={{
            minRows: 2,
            maxRows: 3,
          }}
          disabled
          style={{
            width: '100%',
          }}
          placeholder={formatMessage({
            id: 'odc.NewSSODrawerButton.SSOForm.AutomaticGeneration',
            defaultMessage: '自动生成',
          })} /*自动生成*/
        />
      </Form.Item>
    </>
  );
};

export const SAMLPartForm: React.FC<{
  isEdit: boolean;
  showExtraConfigForSAML: boolean;
  setShowExtraConfigForSAML: (show: boolean) => void;
  updateSAMLCheckBoxConfig: (type: SAMLType, checked: boolean, value?: string) => void;
  SAMLCheckBoxConfig: SAMLCheckBoxConfigType;
  registrationId: string;
  formConfig: FormInstance<ISSOConfig>;
}> = ({
  isEdit,
  showExtraConfigForSAML,
  setShowExtraConfigForSAML,
  updateSAMLCheckBoxConfig,
  SAMLCheckBoxConfig,
  formConfig,
}) => {
  const metadataUriValue = Form.useWatch(['ssoParameter', 'metadataUri'], formConfig);
  const providerEntityIdValue = Form.useWatch(['ssoParameter', 'providerEntityId'], formConfig);
  return (
    <>
      <Typography.Title level={5}>
        {formatMessage({
          id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.995D697E',
          defaultMessage: 'SAML 信息',
        })}
      </Typography.Title>
      <Form.Item
        name={['ssoParameter', 'acsLocation']}
        label="SP Endpoint"
        tooltip={formatMessage({
          id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.28FAAB4B',
          defaultMessage: '用户接受 SSO 服务响应',
        })}
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.1C7B19EE',
              defaultMessage: '请输入配置名称以生成 SP Endpoint',
            }),
          },
        ]}
      >
        <TextArea
          autoSize={{
            minRows: 2,
            maxRows: 3,
          }}
          disabled
          placeholder={formatMessage({
            id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.8841571A',
            defaultMessage: '自动生成，{baseUrl}/login/saml2/sso/{registrationId}',
          })}
        />
      </Form.Item>
      <Form.Item
        name={['ssoParameter', 'acsEntityId']}
        label="ACS EntityID"
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.8D6A20C0',
              defaultMessage: '请输入配置名称以生成 ACS EntityID',
            }),
          },
        ]}
      >
        <TextArea
          autoSize={{
            minRows: 2,
            maxRows: 3,
          }}
          disabled
          placeholder={formatMessage({
            id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.CC5C7D3D',
            defaultMessage: '自动生成，{baseUrl}/saml2/service-provider-metadata/{registrationId}',
          })}
        />
      </Form.Item>
      <Form.Item
        rules={[
          {
            required: showExtraConfigForSAML ? false : true,
            message: formatMessage({
              id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.FB29759B',
              defaultMessage: '未配置时，需要补充高级选项中的 SSO 相关配置信息',
            }),
          },
        ]}
        name={['ssoParameter', 'metadataUri']}
        label="Metadata URI"
        tooltip={formatMessage({
          id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.07BABB3C',
          defaultMessage: '元数据 URL',
        })}
      >
        <Input
          style={{
            width: '100%',
          }}
          placeholder={'如：https://odctestsaml.authing.cn/api/v2/saml-idp/xxxxxxx/metadata'}
        />
      </Form.Item>
      <Space
        style={{
          marginBottom: 12,
          marginTop: 10,
        }}
      >
        <span
          style={{
            fontWeight: 'bold',
          }}
        >
          {
            formatMessage({
              id: 'odc.NewSSODrawerButton.SSOForm.AdvancedOptions',
              defaultMessage: '高级选项',
            }) /*高级选项*/
          }
        </span>
        <Switch
          size="small"
          checked={showExtraConfigForSAML}
          onChange={(v) => setShowExtraConfigForSAML(v)}
        />
      </Space>
      <div
        style={{
          display: showExtraConfigForSAML ? 'block' : 'none',
        }}
      >
        <Form.Item
          name={['ssoParameter', 'providerEntityId']}
          label="Provider EntityID"
          tooltip={formatMessage({
            id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.AFC293F1',
            defaultMessage: '服务提供商的唯一标识',
          })}
          rules={[
            {
              required: isEdit ? providerEntityIdValue : showExtraConfigForSAML ? true : false,
            },
          ]}
        >
          <TextArea
            autoSize={{
              minRows: 2,
              maxRows: 3,
            }}
            disabled
            placeholder={formatMessage({
              id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.AA5602CF',
              defaultMessage:
                '系统自动生成，{baseUrl}/saml2/service-provider-metadata/{registrationId}',
            })}
          />
        </Form.Item>
        <Form.Item
          name={['ssoParameter', 'singlesignon']}
          label={formatMessage({
            id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.9B0937D9',
            defaultMessage: 'SSO 配置',
          })}
          rules={[requiredRule]}
          shouldUpdate={true}
        >
          <p style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
            {formatMessage({
              id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.63A7B3A4',
              defaultMessage: '未配置 Metadata URi 时，建议补充以下配置',
            })}
          </p>
          <div style={{ padding: '8px 16px 6px 16px', background: '#f7f9fb', borderRadius: 2 }}>
            <Form.Item
              label="URL"
              name={['ssoParameter', 'singlesignon', 'url']}
              rules={[{ required: !metadataUriValue }]}
            >
              <Input
                style={{
                  width: '100%',
                }}
                placeholder={'如：https://odctestsaml.authing.cn/api/v2/saml-idp/xxxxxxx/metadata'}
              />
            </Form.Item>
            <Form.Item
              name={['ssoParameter', 'singlesignon', 'binding']}
              label={formatMessage({
                id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.CDE05469',
                defaultMessage: '绑定方法',
              })}
              initialValue={'POST'}
              rules={[{ required: !metadataUriValue }]}
            >
              <Select
                style={{
                  width: 200,
                }}
                options={[
                  {
                    label: 'Post',
                    value: 'POST',
                  },
                  {
                    label: 'Redirect',
                    value: 'REDIRECT',
                  },
                ]}
              />
            </Form.Item>
            <Form.Item
              name={['ssoParameter', 'singlesignon', 'signRequest']}
              label={formatMessage({
                id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.31D71B2D',
                defaultMessage: '登录请求',
              })}
              initialValue={true}
              rules={[{ required: !metadataUriValue }]}
            >
              <Select
                style={{
                  width: 200,
                }}
                options={[
                  {
                    label: 'True',
                    value: true,
                  },
                  {
                    label: 'False',
                    value: false,
                  },
                ]}
              />
            </Form.Item>
          </div>
        </Form.Item>

        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Checkbox
              checked={SAMLCheckBoxConfig.signing.checked}
              onChange={(e) => updateSAMLCheckBoxConfig(SAMLType.signing, e.target.checked)}
            >
              {formatMessage({
                id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.E1797DB0',
                defaultMessage: '签名配置',
              })}

              <Tooltip
                title={formatMessage({
                  id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.3EB7CEBA',
                  defaultMessage: '用于保证 ODC 到 IDP 服务的请求不被篡改',
                })}
              >
                <QuestionCircleOutlined
                  style={{ marginLeft: '6px', color: 'rgba(0, 0, 0, 0.45)' }}
                />
              </Tooltip>
            </Checkbox>

            <div
              className={styles.SAMLCheckBoxConfigDiv}
              style={{
                display: SAMLCheckBoxConfig.signing.checked ? 'block' : 'none',
              }}
            >
              <a
                onClick={() => {
                  copyToCB(SAMLCheckBoxConfig.signing.value);
                  message.success(
                    formatMessage({
                      id: 'odc.component.Log.CopiedSuccessfully',
                      defaultMessage: '复制成功',
                    }), //复制成功
                  );
                }}
                className={styles.SAMLCopyButton}
              >
                <CopyOutlined />
              </a>
              <div className={styles.SAMLConfigContent}>{SAMLCheckBoxConfig.signing.value}</div>
            </div>
          </div>

          <div>
            <Checkbox
              checked={SAMLCheckBoxConfig.verification.checked}
              onChange={(e) => updateSAMLCheckBoxConfig(SAMLType.verification, e.target.checked)}
            >
              {formatMessage({
                id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.96DF4820',
                defaultMessage: '认证配置',
              })}

              <Tooltip
                title={formatMessage({
                  id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.FAFB9D5D',
                  defaultMessage: '用于保证 IDP 到 ODC 的请求不被篡改',
                })}
              >
                <QuestionCircleOutlined
                  style={{ marginLeft: '6px', color: 'rgba(0, 0, 0, 0.45)' }}
                />
              </Tooltip>
            </Checkbox>

            <TextArea
              rows={6}
              value={SAMLCheckBoxConfig.verification.value}
              onChange={(e) => {
                updateSAMLCheckBoxConfig(SAMLType.verification, true, e.target.value);
              }}
              style={{
                display: SAMLCheckBoxConfig.verification.checked ? 'block' : 'none',
              }}
            />
          </div>
          <Checkbox
            checked={SAMLCheckBoxConfig.decryption.checked}
            onChange={(e) => updateSAMLCheckBoxConfig(SAMLType.decryption, e.target.checked)}
          >
            {formatMessage({
              id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.FAC80099',
              defaultMessage: '解密配置',
            })}

            <Tooltip
              title={formatMessage({
                id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.387EEC11',
                defaultMessage: '用于保证 IDP 到 ODC 服务的请求解密',
              })}
            >
              <QuestionCircleOutlined style={{ marginLeft: '6px', color: 'rgba(0, 0, 0, 0.45)' }} />
            </Tooltip>
          </Checkbox>
          <div
            className={styles.SAMLCheckBoxConfigDiv}
            style={{
              display: SAMLCheckBoxConfig.decryption.checked ? 'block' : 'none',
            }}
          >
            <a
              onClick={() => {
                copyToCB(SAMLCheckBoxConfig.decryption.value);
                message.success(
                  formatMessage({
                    id: 'odc.component.Log.CopiedSuccessfully',
                    defaultMessage: '复制成功',
                  }), //复制成功
                );
              }}
              className={styles.SAMLCopyButton}
            >
              <CopyOutlined />
            </a>
            <div className={styles.SAMLConfigContent}>{SAMLCheckBoxConfig.decryption.value}</div>
          </div>
        </Space>
      </div>
    </>
  );
};
