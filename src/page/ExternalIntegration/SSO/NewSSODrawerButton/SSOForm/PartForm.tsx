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
import { Form, Input, Select, Space, Switch, Typography } from 'antd';
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
      <Typography.Title level={5}>LDAP 信息</Typography.Title>
      <Form.Item
        name={['ssoParameter', 'server']}
        label={
          <HelpDoc leftText title="LDAP 服务器访问地址">
            URL
          </HelpDoc>
        }
        rules={[requiredRule]}
      >
        <Input addonBefore="LDAP//:" placeholder="请输入，如：cn=admin,dc=example,dc=com" />
      </Form.Item>

      <Form.Item
        name={['ssoParameter', 'managerDn']}
        label={
          <HelpDoc leftText title="用于访问 LDAP 的用户 DN">
            用户 DN
          </HelpDoc>
        }
        rules={[requiredRule]}
      >
        <Input placeholder="请输入，如：cn=admin,dc=example,dc=com" />
      </Form.Item>
      {!isEdit ? (
        <Form.Item
          name={['ssoParameter', 'managerPassword']}
          label={
            <HelpDoc leftText title="用于访问 LDAP 服务器的密码">
              访问密码
            </HelpDoc>
          }
          rules={[requiredRule]}
        >
          <Input placeholder="请输入" />
        </Form.Item>
      ) : null}
      <Form.Item
        name={['ssoParameter', 'userSearchFilter']}
        label={
          <HelpDoc
            leftText
            title="用户查询的过滤条件，可以基于用户的属性（如用户
        名、邮箱、部门等）来过滤搜索结果"
          >
            userSearchFilter
          </HelpDoc>
        }
      >
        <Input placeholder="请输入，如：uid={$username$}" />
      </Form.Item>
      <Form.Item
        name={['ssoParameter', 'userSearchBase']}
        label={
          <HelpDoc
            leftText
            title="指定在搜索用户（user）时使用的起始点或基准点，
        用于限定在哪个部分或组织单位下搜索用户对象"
          >
            userSearchBase
          </HelpDoc>
        }
      >
        <Input placeholder="请输入，如：ou=people" />
      </Form.Item>
      <Form.Item
        name={['ssoParameter', 'groupSearchBase']}
        label={
          <HelpDoc leftText title="搜索群组查询时使用的起始点或基准点">
            groupSearchBase
          </HelpDoc>
        }
      >
        <Input placeholder="请输入" />
      </Form.Item>
      <Form.Item
        name={['ssoParameter', 'groupSearchFilter']}
        label={
          <HelpDoc leftText title="搜索群组查询的过滤条件">
            groupSearchFilter
          </HelpDoc>
        }
      >
        <Input placeholder="请输入" />
      </Form.Item>
      <Form.Item
        name={['ssoParameter', 'groupSearchSubtree']}
        label={
          <HelpDoc leftText title="指定是否在搜索群组时包括子树的参数">
            groupSearchSubtree
          </HelpDoc>
        }
        rules={[requiredRule]}
        initialValue={false}
      >
        <Select
          placeholder="请输入"
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