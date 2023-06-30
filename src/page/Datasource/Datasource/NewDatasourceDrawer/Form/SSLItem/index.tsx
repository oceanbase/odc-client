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
              href={getLocalDocs('1.web-odc-create-private-connection.html')}
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
