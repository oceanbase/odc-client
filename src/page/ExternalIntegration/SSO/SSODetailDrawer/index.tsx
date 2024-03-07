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

import { getIntegrationDetail } from '@/common/network/manager';
import { ISSOConfig, ISSOType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { useRequest } from 'ahooks';
import { Button, Descriptions, Drawer, Space, Spin } from 'antd';
import { useEffect, useMemo } from 'react';

interface IProps {
  visible: boolean;
  id: number;
  close: () => void;
}

export default function SSODetailDrawer({ visible, id, close }: IProps) {
  const { data, loading, run, cancel } = useRequest(getIntegrationDetail, {
    manual: true,
  });

  const configJson: ISSOConfig = useMemo(() => {
    try {
      return JSON.parse(data?.configuration);
    } catch (e) {
      return null;
    }
  }, [data]);

  useEffect(() => {
    if (visible && id) {
      run(id);
    } else if (!visible) {
      cancel();
    }
  }, [visible, id]);

  function renderConfig() {
    const type = configJson?.type;
    switch (type) {
      case ISSOType.OAUTH2: {
        return (
          <Descriptions column={1} title="OAUTH2">
            <Descriptions.Item label="Client ID">
              {configJson?.ssoParameter?.clientId}
            </Descriptions.Item>
            <Descriptions.Item label="Auth URL">
              {configJson?.ssoParameter?.authUrl}
            </Descriptions.Item>
            <Descriptions.Item label="User Info URL">
              {configJson?.ssoParameter?.userInfoUrl}
            </Descriptions.Item>
            <Descriptions.Item label="Token URL">
              {configJson?.ssoParameter?.tokenUrl}
            </Descriptions.Item>
            <Descriptions.Item label="Redirect URL">
              {configJson?.ssoParameter?.redirectUrl}
            </Descriptions.Item>
            <Descriptions.Item label="Scope">
              {configJson?.ssoParameter?.scope?.join(' | ')}
            </Descriptions.Item>
            <Descriptions.Item label="jwkSet URL">
              {configJson?.ssoParameter?.jwkSetUri || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Client Authentication Method">
              {configJson?.ssoParameter?.clientAuthenticationMethod}
            </Descriptions.Item>
            <Descriptions.Item label="Authorization Grant Type">
              {configJson?.ssoParameter?.authorizationGrantType}
            </Descriptions.Item>
            <Descriptions.Item label="User Info Authentication Method">
              {configJson?.ssoParameter?.userInfoAuthenticationMethod}
            </Descriptions.Item>
          </Descriptions>
        );
      }
      case ISSOType.OIDC: {
        return (
          <Descriptions column={1} title="OIDC">
            <Descriptions.Item label="Client ID">
              {configJson?.ssoParameter?.clientId}
            </Descriptions.Item>
            <Descriptions.Item label="Redirect URL">
              {configJson?.ssoParameter?.redirectUrl}
            </Descriptions.Item>
            <Descriptions.Item label="Scope">
              {configJson?.ssoParameter?.scope?.join(' | ')}
            </Descriptions.Item>
            <Descriptions.Item label="issue URL">
              {configJson?.ssoParameter?.issueUrl}
            </Descriptions.Item>
          </Descriptions>
        );
      }
      case ISSOType.LDAP: {
        return (
          <Descriptions column={1} title="LDAP">
            <Descriptions.Item label="URL">
              {configJson?.ssoParameter?.server || '-'}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                formatMessage({
                  id: 'src.page.ExternalIntegration.SSO.SSODetailDrawer.F86DB093',
                }) /*"用户 DN"*/
              }
            >
              {configJson?.ssoParameter?.managerDn || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="userSearchFilter">
              {configJson?.ssoParameter?.userSearchFilter || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="userSearchBase">
              {configJson?.ssoParameter?.userSearchBase || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="groupSearchFilter">
              {configJson?.ssoParameter?.groupSearchFilter || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="groupSearchBase">
              {configJson?.ssoParameter?.groupSearchBase || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="groupSearchSubtree">
              {configJson?.ssoParameter?.groupSearchSubtree ? 'true' : 'false'}
            </Descriptions.Item>
          </Descriptions>
        );
      }
      default: {
        return null;
      }
    }
  }
  const isLdap = configJson?.type === ISSOType.LDAP;
  return (
    <Drawer
      width={520}
      title={formatMessage({ id: 'odc.SSO.SSODetailDrawer.SsoConfiguration' })} /*SSO 配置*/
      open={visible}
      onClose={() => close()}
      footer={
        <Button style={{ float: 'right' }} onClick={() => close()}>
          {formatMessage({ id: 'odc.SSO.SSODetailDrawer.Close' }) /*关闭*/}
        </Button>
      }
    >
      <Spin spinning={loading}>
        <Space direction="vertical">
          <Descriptions
            column={1}
            title={formatMessage({ id: 'odc.SSO.SSODetailDrawer.BasicInformation' })} /*基本信息*/
          >
            <Descriptions.Item
              label={formatMessage({
                id: 'odc.SSO.SSODetailDrawer.ConfigurationName',
              })} /*配置名称*/
            >
              {data?.name}
            </Descriptions.Item>
            <Descriptions.Item
              label={formatMessage({ id: 'odc.SSO.SSODetailDrawer.Status' })} /*状态*/
            >
              {
                data?.enabled
                  ? formatMessage({ id: 'odc.SSO.SSODetailDrawer.Start' }) //启动
                  : formatMessage({ id: 'odc.SSO.SSODetailDrawer.Close' }) //关闭
              }
            </Descriptions.Item>
            <Descriptions.Item
              label={formatMessage({ id: 'odc.SSO.SSODetailDrawer.Type' })} /*类型*/
            >
              {configJson?.type}
            </Descriptions.Item>
          </Descriptions>
          {renderConfig()}
          <Descriptions
            column={2}
            title={formatMessage({
              id: 'odc.SSO.SSODetailDrawer.UserFieldMapping',
            })} /*用户字段映射*/
          >
            {!isLdap && (
              <Descriptions.Item
                label={formatMessage({
                  id: 'odc.SSO.SSODetailDrawer.UsernameField',
                })} /*用户名字段*/
              >
                {configJson?.mappingRule?.userAccountNameField}
              </Descriptions.Item>
            )}

            <Descriptions.Item
              label={formatMessage({
                id: 'odc.SSO.SSODetailDrawer.UserNicknameField',
              })} /*用户昵称字段*/
            >
              {configJson?.mappingRule?.userNickNameField}
            </Descriptions.Item>
            <Descriptions.Item
              label={formatMessage({
                id: 'odc.SSO.SSODetailDrawer.UserInformationDataStructureType',
              })} /*用户信息数据结构类型*/
            >
              {configJson?.mappingRule?.userProfileViewType}
            </Descriptions.Item>
            {configJson?.mappingRule?.userProfileViewType === 'NESTED' && (
              <Descriptions.Item
                label={formatMessage({
                  id: 'odc.SSO.SSODetailDrawer.ObtainNestedUserData',
                })} /*获取嵌套用户数据*/
              >
                {data?.name}
              </Descriptions.Item>
            )}
          </Descriptions>
          {configJson?.mappingRule?.extraInfo?.length ? (
            <Descriptions
              column={1}
              title={formatMessage({ id: 'odc.SSO.SSODetailDrawer.CustomFields' })} /*自定义字段*/
            >
              {configJson?.mappingRule?.extraInfo?.map((item) => {
                return (
                  <Descriptions.Item label={item.attributeName}>
                    {item.expression}
                  </Descriptions.Item>
                );
              })}
            </Descriptions>
          ) : null}
        </Space>
      </Spin>
    </Drawer>
  );
}
