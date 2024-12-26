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
      title="测试连接"
      open={open}
      onCancel={() => {
        setOpen(false);
      }}
      onOk={() => {
        setOpen(false);
        onOk();
      }}
    >
      <p style={{ color: '#00000073' }}>请确认以下测试连接信息</p>
      <Form layout="vertical" requiredMark="optional" form={form}>
        <Form.Item
          name={['ssoParameter', 'acsLocation']}
          label="SP Endpoint"
          tooltip={'用户接受 SSO 服务响应'}
          rules={[
            {
              required: true,
              message: '请输入配置名称以生成 SP Endpoint',
            },
          ]}
        >
          <TextArea
            autoSize={{
              minRows: 2,
              maxRows: 3,
            }}
            disabled
            placeholder={'自动生成，{baseUrl}/login/saml2/sso/{registrationId}'}
          />
        </Form.Item>
        <Form.Item
          name={['ssoParameter', 'testAcsEntityId']}
          label="ACS EntityID"
          rules={[
            {
              required: true,
              message: '请输入配置名称以生成 ACS EntityID',
            },
          ]}
        >
          <TextArea
            autoSize={{
              minRows: 2,
              maxRows: 3,
            }}
            disabled
            placeholder={'自动生成，{baseUrl}/saml2/service-provider-metadata/{registrationId}'}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SAMLModalConfirm;
