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

import DatasourceFormContext from '../context';
import { useContext, useMemo, useState } from 'react';
import { Space, Form, Input, Typography, Row, message } from 'antd';
import Action from '@/component/Action';
import { formatMessage } from '@/util/intl';
import ErrorTip from '../components/ErrorTip';
import { testConnection } from '@/common/network/connection';
import { AccountType, IConnectionTestErrorType, ConnectType } from '@/d.ts';

const placeholder = {
  [ConnectType.OSS]: {
    placeholder: 'oss://obcloud-samples/document',
  },
  [ConnectType.COS]: {
    placeholder: 'cos://obcloud-samples/document',
  },
  [ConnectType.OBS]: {
    placeholder: 'obs://obcloud-samples/document',
  },
  [ConnectType.S3A]: {
    placeholder: 's3://obcloud-samples/document',
  },
};

interface CloudStorageFormProps {
  isEdit: boolean;
}

const CloudStorageForm: React.FC<CloudStorageFormProps> = (props) => {
  const { dataSourceConfig, form, testResult, setTestResult } =
    useContext(DatasourceFormContext) || {};
  const { isEdit } = props;
  if (!dataSourceConfig?.cloudStorage) {
    return null;
  }
  const Type = Form.useWatch('type', form);
  const handleTest = async () => {
    try {
      await form.validateFields(['username', 'password', 'region', 'host']);
    } catch (error) {
      console.error('Validation failed:', error);
      return;
    }
    const params = form.getFieldsValue(['username', 'password', 'region', 'type', 'host']);
    const res = await testConnection(params, AccountType.MAIN, true);
    if (res?.errMsg) {
      setTestResult({
        errorCode: IConnectionTestErrorType.UNKNOWN,
        errorMessage: res?.errMsg,
        active: false,
        type: null,
      });
      return;
    }
    if (!res?.data?.active) {
      switch (res?.data?.errorCode) {
        case IConnectionTestErrorType.ACCESS_DENIED:
        case IConnectionTestErrorType.INVALID_ACCESSKEY_ID: {
          form.setFields([
            {
              errors: [res?.data?.errorMessage],
              name: ['username'],
            },
          ]);
          break;
        }
        case IConnectionTestErrorType.SIGNATURE_DOES_NOT_MATCH: {
          form.setFields([
            {
              errors: [res?.data?.errorMessage],
              name: ['password'],
            },
          ]);
          break;
        }
      }
    } else {
      message.success(
        formatMessage({
          id: 'src.page.Datasource.Datasource.NewDatasourceDrawer.Form.CloudStorageForm.79FBC953',
          defaultMessage: '测试连接成功',
        }),
      );
    }
    setTestResult(res?.data);
  };

  const passwordValidStatus = useMemo(() => {
    if (testResult?.active) {
      return 'success';
    } else if (
      [
        IConnectionTestErrorType.SIGNATURE_DOES_NOT_MATCH,
        IConnectionTestErrorType.UNKNOWN,
      ].includes(testResult?.errorCode)
    ) {
      return 'error';
    }
  }, [testResult]);

  const usernameValidStatus = useMemo(() => {
    if (testResult?.active) {
      return 'success';
    } else if (
      [
        IConnectionTestErrorType.ACCESS_DENIED,
        IConnectionTestErrorType.INVALID_ACCESSKEY_ID,
        IConnectionTestErrorType.UNKNOWN,
      ].includes(testResult?.errorCode)
    ) {
      return 'error';
    }
  }, [testResult]);

  return (
    <>
      <Form.Item
        label={formatMessage({
          id: 'src.page.Datasource.Datasource.NewDatasourceDrawer.Form.CloudStorageForm.7C7CBA83',
          defaultMessage: '文件 URL',
        })}
        name={'host'}
        tooltip={formatMessage({
          id: 'src.page.Datasource.Datasource.NewDatasourceDrawer.Form.CloudStorageForm.105ECDDE',
          defaultMessage: '访问对象文件的路径地址',
        })}
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Input autoComplete="off" disabled={isEdit} placeholder={placeholder[Type]?.placeholder} />
      </Form.Item>
      <Form.Item
        label={formatMessage({
          id: 'src.page.Datasource.Datasource.NewDatasourceDrawer.Form.CloudStorageForm.CE7555C1',
          defaultMessage: '地域',
        })}
        name={'region'}
        tooltip={formatMessage({
          id: 'src.page.Datasource.Datasource.NewDatasourceDrawer.Form.CloudStorageForm.47E5C6F0',
          defaultMessage: '用于标识数据存储的具体地理位置区域',
        })}
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Input
          autoComplete="off"
          disabled={isEdit}
          placeholder={formatMessage({
            id: 'src.page.Datasource.Datasource.NewDatasourceDrawer.Form.CloudStorageForm.FEA72F35',
            defaultMessage: '示例: cn-north-1',
          })}
        />
      </Form.Item>
      <Space size={24}>
        <Form.Item
          label={formatMessage({
            id: 'src.page.Datasource.Datasource.NewDatasourceDrawer.Form.CloudStorageForm.B04CC70F',
            defaultMessage: '访问密钥 ID',
          })}
          validateStatus={usernameValidStatus}
          hasFeedback={!!usernameValidStatus}
          name={'username'}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input
            autoComplete="off"
            style={{ width: 224 }}
            placeholder={formatMessage({
              id: 'src.page.Datasource.Datasource.NewDatasourceDrawer.Form.CloudStorageForm.990704A2',
              defaultMessage: '请输入',
            })}
          />
        </Form.Item>
        <Form.Item
          label={formatMessage({
            id: 'src.page.Datasource.Datasource.NewDatasourceDrawer.Form.CloudStorageForm.9E9AD5FC',
            defaultMessage: '访问密钥',
          })}
          name={'password'}
          validateStatus={passwordValidStatus}
          hasFeedback={!!passwordValidStatus}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input.Password
            autoComplete="off"
            style={{ width: 224 }}
            placeholder={formatMessage({
              id: 'src.page.Datasource.Datasource.NewDatasourceDrawer.Form.CloudStorageForm.E1CB23D0',
              defaultMessage: '请输入',
            })}
          />
        </Form.Item>
      </Space>

      <ErrorTip errorMessage={testResult?.errorMessage} />
      <Row>
        <Space size={12}>
          <Action.Link
            onClick={async () => {
              return handleTest();
            }}
          >
            {formatMessage({
              id: 'portal.connection.form.test',
              defaultMessage: '测试连接',
            })}
          </Action.Link>
        </Space>
      </Row>
    </>
  );
};

export default CloudStorageForm;
