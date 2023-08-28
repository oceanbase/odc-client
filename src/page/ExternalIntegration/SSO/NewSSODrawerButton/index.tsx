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

import { createIntegration } from '@/common/network/manager';
import { EncryptionAlgorithm, IntegrationType, ISSOConfig } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { encrypt } from '@/util/utils';
import { useUpdate } from 'ahooks';
import { Button, Drawer, FormInstance, message, Space, Tooltip } from 'antd';
import { useRef, useState } from 'react';
import SSOForm from './SSOForm';
import tracert from '@/util/tracert';

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
    tracert.click('a3112.b64009.c330927.d367485');
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
      message.success(
        formatMessage({ id: 'odc.SSO.NewSSODrawerButton.New' }), //新建成功
      );
      onSuccess();
      setOpen(false);
    }
    // onSuccess();
  }

  return (
    <>
      <Button
        onClick={() => {
          tracert.click('a3112.b64009.c330927.d367484');
          setOpen(true);
        }}
        type="primary"
      >
        {formatMessage({ id: 'odc.SSO.NewSSODrawerButton.CreateSsoIntegration' }) /*新建 SSO 集成*/}
      </Button>
      <Drawer
        width={520}
        title={formatMessage({
          id: 'odc.SSO.NewSSODrawerButton.CreateSsoIntegration',
        })} /*新建 SSO 集成*/
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        destroyOnClose
        footer={
          <Space style={{ float: 'right' }}>
            <Button
              onClick={() => {
                setOpen(false);
              }}
            >
              {formatMessage({ id: 'odc.SSO.NewSSODrawerButton.Cancel' }) /*取消*/}
            </Button>
            {formRef.current?.testInfo ? (
              <Button type="primary" onClick={submit}>
                {formatMessage({ id: 'odc.SSO.NewSSODrawerButton.Save' }) /*保存*/}
              </Button>
            ) : (
              <Tooltip
                title={formatMessage({
                  id: 'odc.SSO.NewSSODrawerButton.PleaseTestTheConnectionFirst',
                })} /*请先进行测试连接*/
              >
                <Button type="primary" disabled>
                  {formatMessage({ id: 'odc.SSO.NewSSODrawerButton.Save' }) /*保存*/}
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
