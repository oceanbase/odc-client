import { formatMessage } from '@/util/intl';
import { Form, Input, Modal } from 'antd';
import React from 'react';
import type { FormInstance } from 'antd';

const { TextArea } = Input;

interface SAMLModalConfirmProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onOk: () => void;
  form: FormInstance;
}

const SAMLModalConfirm: React.FC<SAMLModalConfirmProps> = (props) => {
  const { open, setOpen, onOk, form } = props;
  return (
    <Modal
      title={formatMessage({
        id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.DCF54625',
        defaultMessage: '测试连接',
      })}
      open={open}
      onCancel={() => {
        setOpen(false);
      }}
      onOk={() => {
        setOpen(false);
        onOk();
      }}
    >
      <p style={{ color: '#00000073' }}>
        {formatMessage({
          id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.54B0C88B',
          defaultMessage: '请确认以下测试连接信息',
        })}
      </p>
      <Form layout="vertical" requiredMark="optional" form={form}>
        <Form.Item
          name={['ssoParameter', 'testAcsLocation']}
          label="SP Endpoint"
          tooltip={formatMessage({
            id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.F950EA44',
            defaultMessage: '用户接受 SSO 服务响应',
          })}
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.8EE8FD55',
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
              id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.5A0E5F22',
              defaultMessage: '自动生成，{baseUrl}/login/saml2/sso/{registrationId}',
            })}
          />
        </Form.Item>
        <Form.Item
          name={['ssoParameter', 'testAcsEntityId']}
          label="ACS EntityID"
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.5D766933',
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
              id: 'src.page.ExternalIntegration.SSO.NewSSODrawerButton.SSOForm.536D5E92',
              defaultMessage:
                '自动生成，{baseUrl}/saml2/service-provider-metadata/{registrationId}',
            })}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SAMLModalConfirm;
