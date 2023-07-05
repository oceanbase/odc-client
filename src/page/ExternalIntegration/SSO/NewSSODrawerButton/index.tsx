import { createIntegration } from '@/common/network/manager';
import { EncryptionAlgorithm, IntegrationType, ISSOConfig } from '@/d.ts';
import { encrypt } from '@/util/utils';
import { useUpdate } from 'ahooks';
import { Button, Drawer, FormInstance, message, Space, Tooltip } from 'antd';
import { useRef, useState } from 'react';
import SSOForm from './SSOForm';

interface IProps {
  onSuccess: () => void;
}

export default function NewSSODrawerButton({ onSuccess }: IProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<{
    form: FormInstance<ISSOConfig>;
    registrationId: string;
    testInfo: string;
  }>();
  const update = useUpdate();

  async function submit() {
    const form = formRef?.current?.form;
    const value = await form.validateFields();
    const clone = { ...value };
    clone.ssoParameter.registrationId = formRef?.current?.registrationId;
    clone.mappingRule.extraInfo = clone.mappingRule.extraInfo
      ?.map((info) => {
        if (info.attributeName?.trim() && info.expression?.trim()) {
          return info;
        }
      })
      .filter(Boolean);
    const isSuccess = await createIntegration({
      type: IntegrationType.SSO,
      name: clone?.name,
      enabled: true,
      encryption: {
        enabled: true,
        algorithm: EncryptionAlgorithm.RAW,
        secret: encrypt(clone?.ssoParameter?.secret),
      },
      configuration: JSON.stringify(clone),
    });
    if (isSuccess) {
      message.success('新建成功');
      onSuccess();
      setOpen(false);
    }
    // onSuccess();
  }

  return (
    <>
      <Button
        onClick={() => {
          setOpen(true);
        }}
        type="primary"
      >
        新建 SSO 集成
      </Button>
      <Drawer
        width={520}
        title="新建 SSO 集成"
        visible={open}
        onClose={() => {
          setOpen(false);
        }}
        footer={
          <Space style={{ float: 'right' }}>
            <Button
              onClick={() => {
                setOpen(false);
              }}
            >
              取消
            </Button>
            {formRef.current?.testInfo ? (
              <Button type="primary" onClick={submit}>
                保存
              </Button>
            ) : (
              <Tooltip title="请先进行测试连接">
                <Button type="primary" disabled>
                  保存
                </Button>
              </Tooltip>
            )}
          </Space>
        }
      >
        <SSOForm onTestInfoChanged={() => update()} ref={formRef} key={open + ' '} />
      </Drawer>
    </>
  );
}
