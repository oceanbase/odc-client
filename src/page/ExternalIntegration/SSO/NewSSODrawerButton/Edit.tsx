import { getIntegrationDetail, updateIntegration } from '@/common/network/manager';
import { EncryptionAlgorithm, ISSOConfig } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { safeParseJson } from '@/util/utils';
import { useRequest, useUpdate } from 'ahooks';
import { Button, Drawer, message, Space, Spin } from 'antd';
import { useEffect, useMemo, useRef } from 'react';
import SSOForm, { IFormRef } from './SSOForm';

interface IProps {
  visible: boolean;
  id?: number;
  close: () => void;
  onSave: () => void;
}

export default function EditSSODrawer({ visible, id, close, onSave }: IProps) {
  const update = useUpdate();
  const formRef = useRef<IFormRef>();

  const { data, loading, run } = useRequest(getIntegrationDetail, {
    manual: true,
  });

  const configJson: ISSOConfig = useMemo(() => {
    return safeParseJson(data?.configuration);
  }, [data]);

  async function getSSOConfigById(id: number) {
    const data = await run(id);
    const configJson: ISSOConfig = safeParseJson(data?.configuration);
    if (configJson) {
      configJson.ssoParameter.secret = data?.encryption?.secret;
      formRef?.current?.form.setFieldsValue(configJson);
    }
  }

  async function save() {
    const form = formRef?.current?.form;
    const value = await form.validateFields();
    const clone = { ...value };
    clone.ssoParameter.registrationId = configJson?.ssoParameter?.registrationId;
    clone.mappingRule.extraInfo = clone.mappingRule.extraInfo
      ?.map((info) => {
        if (info.attributeName?.trim() && info.expression?.trim()) {
          return info;
        }
      })
      .filter(Boolean);
    const isSuccess = await updateIntegration({
      ...data,
      encryption: {
        enabled: true,
        algorithm: EncryptionAlgorithm.RAW,
        secret: clone?.ssoParameter?.secret,
      },
      configuration: JSON.stringify(clone),
    });
    if (isSuccess) {
      message.success(
        formatMessage({ id: 'odc.SSO.NewSSODrawerButton.Edit.ModifiedSuccessfully' }), //修改成功
      );
      onSave();
      close();
    }
  }

  useEffect(() => {
    if (id) {
      getSSOConfigById(id);
    }
  }, [id]);

  return (
    <Drawer
      width={520}
      visible={visible}
      title={formatMessage({
        id: 'odc.SSO.NewSSODrawerButton.Edit.EditSsoIntegrationConfiguration',
      })} /*编辑 SSO 集成配置*/
      onClose={close}
      footer={
        <Space style={{ float: 'right' }}>
          <Button onClick={() => close()}>
            {formatMessage({ id: 'odc.SSO.NewSSODrawerButton.Edit.Cancel' }) /*取消*/}
          </Button>
          <Button onClick={() => save()} type="primary">
            {
              formatMessage({
                id: 'odc.SSO.NewSSODrawerButton.Edit.ConfirmModification',
              }) /*确认修改*/
            }
          </Button>
        </Space>
      }
    >
      <Spin spinning={loading}>
        <SSOForm
          key={visible + ' '}
          editData={configJson}
          isEdit={true}
          onTestInfoChanged={() => update()}
          ref={formRef}
        />
      </Spin>
    </Drawer>
  );
}
