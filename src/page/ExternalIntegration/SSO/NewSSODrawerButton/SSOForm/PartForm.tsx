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

import {
  IAuthorizationGrantType,
  IClientAuthenticationMethod,
  IUserInfoAuthenticationMethod,
} from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Form, Input, InputNumber, Select, Space, Switch, Typography } from 'antd';
import React from 'react';
import HelpDoc from '@/component/helpDoc';
import { requiredRule } from '.';

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
            }), //'请输入server'
            ...requiredRule,
          },
        ]}
      >
        <Input
          placeholder={
            formatMessage({
              id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.D0229F31',
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
              }) /*"用于访问 LDAP 的用户 DN"*/
            }
          >
            {formatMessage({
              id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.88A5F823' /*用户 DN*/,
            })}
          </HelpDoc>
        }
        rules={[
          {
            message: formatMessage({
              id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.9DBF4E00',
            }), //'请输入managerDn'
            ...requiredRule,
          },
        ]}
      >
        <Input
          placeholder={
            formatMessage({
              id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.B2735BBD',
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
                }) /*"用于访问 LDAP 服务器的密码"*/
              }
            >
              {
                formatMessage({
                  id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.DC978DE4' /*访问密码*/,
                }) /* 访问密码 */
              }
            </HelpDoc>
          }
          rules={[
            {
              message: formatMessage({
                id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.4DF22947',
              }), //'请输入访问密码'
              ...requiredRule,
            },
          ]}
        >
          <Input
            placeholder={
              formatMessage({
                id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.93F4243B',
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
      <Form.Item
        name={['ssoParameter', 'loginFailedLimit']}
        label={
          <HelpDoc
            leftText
            title={
              formatMessage({
                id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.F360A8FE',
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
          })}
          addonAfter={
            formatMessage({
              id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.5E8157A1',
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
          })}
          addonAfter={
            formatMessage({
              id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.5FCE84A1',
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
          style={{
            width: '100%',
          }}
          placeholder={formatMessage({
            id: 'odc.NewSSODrawerButton.SSOForm.PleaseEnter',
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
          })} /*自动生成*/
        />
      </Form.Item>
    </>
  );
};
