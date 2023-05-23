import { getIntegrationDetail } from '@/common/network/manager';
import { ISSOConfig, ISSOType } from '@/d.ts';
import { useRequest } from 'ahooks';
import { Button, Descriptions, Drawer, Spin } from 'antd';
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
      default: {
        return null;
      }
    }
  }

  return (
    <Drawer
      width={520}
      title="SSO 配置"
      visible={visible}
      onClose={() => close()}
      footer={
        <Button style={{ float: 'right' }} onClick={() => close()}>
          关闭
        </Button>
      }
    >
      <Spin spinning={loading}>
        <Descriptions column={1} title="基本信息">
          <Descriptions.Item label="配置名称">{data?.name}</Descriptions.Item>
          <Descriptions.Item label="状态">{data?.enabled ? '启动' : '关闭'}</Descriptions.Item>
          <Descriptions.Item label="类型">{configJson?.type}</Descriptions.Item>
        </Descriptions>
        {renderConfig()}
        <Descriptions column={2} title="用户字段映射">
          <Descriptions.Item label="用户名">
            {configJson?.mappingRule?.userAccountNameField}
          </Descriptions.Item>
          <Descriptions.Item label="用户昵称">
            {configJson?.mappingRule?.userNickNameField}
          </Descriptions.Item>
          <Descriptions.Item label="组织名称">
            {configJson?.mappingRule?.organizationNameField}
          </Descriptions.Item>
          <Descriptions.Item label="用户信息数据结构类型">
            {configJson?.mappingRule?.userProfileViewType}
          </Descriptions.Item>
          {configJson?.mappingRule?.userProfileViewType === 'NESTED' && (
            <Descriptions.Item label="获取嵌套用户数据">{data?.name}</Descriptions.Item>
          )}
        </Descriptions>
        {configJson?.mappingRule?.extraInfo?.length ? (
          <Descriptions column={1} title="自定义字段">
            {configJson?.mappingRule?.extraInfo?.map((item) => {
              return (
                <Descriptions.Item label={item.attributeName}>{item.expression}</Descriptions.Item>
              );
            })}
          </Descriptions>
        ) : null}
      </Spin>
    </Drawer>
  );
}
