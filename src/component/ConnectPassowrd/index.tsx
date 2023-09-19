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

import { getConnectionDetail, testConnection } from '@/common/network/connection';
import { AccountType, ConnectType, IConnection, IConnectionTestErrorType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { KeyOutlined } from '@ant-design/icons';
import { Form, Input, Modal } from 'antd';

const PasswordModal = function ({ formRef, cid, newConnection }) {
  const [form] = Form.useForm<{ password: string }>();
  formRef.valid = async function () {
    const values = await form.validateFields();
    if (!values) {
      return null;
    }
    let testResult: {
      data: {
        active: boolean;
        errorCode: IConnectionTestErrorType;
        errorMessage: string;
        type: ConnectType;
      };
      errMsg?: string;
    } = null;
    if (newConnection) {
      /**
       * 测试未存在的连接
       */
      testResult = await testConnection(
        { ...newConnection, password: values.password },
        AccountType.MAIN,
      );
    } else {
      const connection = await getConnectionDetail(cid);
      if (!connection) {
        return null;
      }
      testResult = await testConnection(
        {
          type: connection.type,
          clusterName: connection.clusterName,
          tenantName: connection.tenantName,
          username: connection.username,
          password: values.password,
          host: connection.host,
          port: connection.port,
          sslConfig: {
            enabled: false,
          },
        },

        AccountType.MAIN,
      );
    }

    const data = testResult?.data;
    if (data?.errorMessage || !data) {
      form.setFields([
        {
          name: 'password',
          errors: [data?.errorMessage || 'NetError'],
        },
      ]);

      return null;
    }
    /**
     * test成功
     */
    return values;
  };
  return (
    <Form initialValues={{ password: '' }} form={form}>
      <Input
        style={{
          position: 'fixed',
          top: 0,
          width: 0,
          padding: 0,
          background: 'transparent',
          border: 0,
        }}
      />

      <Form.Item
        label={formatMessage({ id: 'odc.component.ConnectPassowrd.Password' })}
        /*密码*/ name="password"
      >
        <Input.Password autoComplete="new-password" id="connectPasswordInput" />
      </Form.Item>
    </Form>
  );
};

export default function ShowConnectPassword(
  cid?: string,
  newConnection?: Partial<IConnection>,
): Promise<{ password: string } | string> {
  return new Promise((resolve, reject) => {
    const formRef = { valid: null };
    const callback = resolve;
    Modal.confirm({
      zIndex: 1004,
      title: formatMessage({
        id: 'odc.component.ConnectPassowrd.EnterTheConnectionPassword',
      }),
      // 请输入连接密码
      icon: <KeyOutlined />,
      /**
       * 这里需要添加一个视觉上不可见的input，来欺骗 chorme 等浏览器填充密码的时候，把账号填充在这个input上，从而不影响其他正常的input组件
       */
      content: <PasswordModal cid={cid} formRef={formRef} newConnection={newConnection} />,
      onOk: () => {
        return new Promise(async (resolve, reject) => {
          let v;
          try {
            v = await formRef.valid();
          } catch (e) {
            console.log(e);
          }
          if (!v) {
            reject();
          } else {
            callback({
              password: v.password,
            });
            resolve(true);
          }
        });
      },
      onCancel: () => {
        callback(null);
      },
    });
  });
}
