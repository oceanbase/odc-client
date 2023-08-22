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

import FormItemPanel from '@/component/FormItemPanel';
import { formatMessage, getLocalDocs } from '@/util/intl';
import { Checkbox, Form, Space } from 'antd';
import React from 'react';
import SingleUpload from './SingleUploadFile';

interface IProps {}

const SSLItem: React.FC<IProps> = function () {
  return (
    <>
      <Form.Item valuePropName="checked" name={['sslConfig', 'enabled']}>
        <Checkbox>
          <Space>
            {
              formatMessage({
                id: 'odc.AddConnectionForm.SSLItem.EnableSsl',
              }) /*启用 SSL*/
            }

            <a
              href={getLocalDocs('100.create-a-personal-connection.html')}
              target={'_blank'}
              onClick={(e) => {
                e.stopPropagation();
              }}
              rel="noreferrer"
            >
              {
                formatMessage({
                  id: 'odc.AddConnectionForm.SSLItem.HowToObtain',
                }) /*如何获取？*/
              }
            </a>
          </Space>
        </Checkbox>
      </Form.Item>
      <Form.Item shouldUpdate noStyle>
        {({ getFieldValue }) => {
          const sslEnabled = getFieldValue(['sslConfig', 'enabled']);
          if (sslEnabled) {
            return (
              <FormItemPanel keepExpand>
                <Form.Item
                  label={formatMessage({
                    id: 'odc.AddConnectionForm.SSLItem.ClientKey',
                  })}
                  /*客户端密钥*/ name={['sslConfig', 'clientKeyObjectId']}
                >
                  <SingleUpload />
                </Form.Item>
                <Form.Item
                  label={formatMessage({
                    id: 'odc.AddConnectionForm.SSLItem.ClientCertificate',
                  })}
                  /*客户端证书*/ name={['sslConfig', 'clientCertObjectId']}
                >
                  <SingleUpload />
                </Form.Item>
                <Form.Item
                  label={formatMessage({
                    id: 'odc.AddConnectionForm.SSLItem.CaCertificate',
                  })}
                  /*CA 证书*/ name={['sslConfig', 'CACertObjectId']}
                >
                  <SingleUpload />
                </Form.Item>
              </FormItemPanel>
            );
          }
        }}
      </Form.Item>
    </>
  );
};

export default SSLItem;
