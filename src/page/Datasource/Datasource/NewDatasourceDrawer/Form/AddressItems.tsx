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

import { haveOCP } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { checkNumberRange, validTrimEmptyWithWarn } from '@/util/valid';
import { Col, Form, Input, Row, Select, Space } from 'antd';
import { isNil } from 'lodash';
import React, { useContext } from 'react';
import DatasourceFormContext from './context';
import styles from './index.less';
import InstanceSelect from './InstanceSelect';
interface IProps {}
const AddressItems: React.FC<IProps> = function (props) {
  const { isEdit, dataSourceConfig } = useContext(DatasourceFormContext);
  const renderConnectInfo = () => {
    const items = dataSourceConfig?.address?.items;
    const formItems = items?.map((item) => {
      switch (item) {
        case 'cluster': {
          return (
            <Col span={12}>
              <Form.Item
                name="clusterName"
                label={formatMessage({
                  id: 'odc.component.AddConnectionForm.AddressItems.ClusterName',
                })}
                /*集群名*/
                style={{
                  marginBottom: 16,
                }}
              >
                <Input
                  style={{
                    width: '100%',
                  }}
                  placeholder={formatMessage({
                    id: 'odc.component.AddConnectionForm.AddressItems.EnterAClusterName',
                  })}
                  /*请输入集群名*/
                />
              </Form.Item>
            </Col>
          );
        }
        case 'ip': {
          return (
            <Col span={12}>
              <Form.Item
                name="host"
                style={{
                  marginBottom: 16,
                }}
                label={
                  formatMessage({
                    id: 'odc.src.page.Datasource.Datasource.NewDatasourceDrawer.Form.HostIPDomainName',
                  }) //"主机 IP/域名"
                }
                rules={[
                  {
                    required: true,
                    message: formatMessage({
                      id: 'odc.component.AddConnectionForm.AddressItems.EnterTheHostAddress',
                    }),
                    //请输入主机地址
                  },
                ]}
              >
                <Input
                  style={{
                    width: '100%',
                  }}
                  placeholder={
                    formatMessage({
                      id: 'odc.component.AddConnectionForm.AddressItems.EnterTheHostAddress',
                    })

                    //请输入主机地址
                  }
                />
              </Form.Item>
            </Col>
          );
        }
        case 'port': {
          return (
            <Col span={12}>
              <Form.Item
                name="port"
                style={{
                  marginBottom: 16,
                }}
                label={formatMessage({
                  id: 'portal.connection.form.port',
                })}
                rules={[
                  {
                    required: true,
                    message: formatMessage({
                      id: 'odc.AddConnectionDrawer.AddConnectionForm.EnterThePortNumber',
                    }),
                  },
                  {
                    validator: checkNumberRange(0, 65535),
                  },
                ]}
                validateFirst
              >
                <Input
                  style={{
                    width: '100%',
                  }}
                  placeholder={formatMessage({
                    id: 'odc.component.AddConnectionForm.AddressItems.EnterAPort',
                  })}
                  /*请输入端口*/
                />
              </Form.Item>
            </Col>
          );
        }
        case 'tenant': {
          return (
            <Col span={12}>
              <Form.Item
                label={formatMessage({
                  id: 'odc.component.AddConnectionForm.AddressItems.TenantName',
                })}
                /*租户名*/
                name="tenantName"
                style={{
                  marginBottom: 16,
                }}
                rules={[
                  {
                    required: true,
                    message: formatMessage({
                      id: 'odc.component.AddConnectionForm.AddressItems.EnterATenantName',
                    }),
                    //请输入租户名
                  },

                  {
                    validator: validTrimEmptyWithWarn(
                      formatMessage({
                        id: 'portal.connection.form.tenant.validation.trim',
                      }),
                    ),
                  },
                ]}
              >
                <Input
                  style={{
                    width: '100%',
                  }}
                  placeholder={formatMessage({
                    id: 'odc.component.AddConnectionForm.AddressItems.EnterATenantName',
                  })}
                  /*请输入租户名*/
                />
              </Form.Item>
            </Col>
          );
        }
        case 'sid': {
          return (
            <Col span={24}>
              <Form.Item noStyle shouldUpdate>
                {({ getFieldValue, setFieldsValue }) => {
                  const serviceName = getFieldValue('serviceName');
                  const type = isNil(serviceName) ? 'sid' : 'serviceName';
                  return (
                    <Form.Item
                      required
                      label={
                        formatMessage({
                          id: 'src.page.Datasource.Datasource.NewDatasourceDrawer.Form.BDA4C2AB',
                        }) /*"数据库"*/
                      }
                      shouldUpdate
                    >
                      <Space.Compact block>
                        <div style={{ width: '30%' }}>
                          <Select
                            value={type}
                            style={{ width: '100%' }}
                            size="small"
                            options={[
                              {
                                label: 'SID',
                                value: 'sid',
                              },
                              {
                                label: formatMessage({
                                  id: 'src.page.Datasource.Datasource.NewDatasourceDrawer.Form.C2435F5F',
                                }), //'服务名'
                                value: 'serviceName',
                              },
                            ]}
                            onChange={(value) => {
                              setFieldsValue({
                                sid: value === 'sid' ? '' : null,
                                serviceName: value === 'serviceName' ? '' : null,
                              });
                            }}
                          />
                        </div>
                        <Form.Item
                          rules={[{ required: true }]}
                          style={{ width: '70%', marginLeft: -1 }}
                          name={type}
                          label=""
                        >
                          <Input style={{ width: '100%' }} />
                        </Form.Item>
                      </Space.Compact>
                    </Form.Item>
                  );
                }}
              </Form.Item>
            </Col>
          );
        }
        default: {
          return null;
        }
      }
    });

    return (
      <div className={styles.inlineForm}>
        <div>
          <Row gutter={12}>{formItems}</Row>
        </div>
      </div>
    );
  };
  return (
    <>
      <div className="ant-form-item-label">
        <label>
          {formatMessage({
            id: 'portal.connection.form.address',
          })}
        </label>
      </div>
      {haveOCP() ? <InstanceSelect disabled={isEdit} /> : renderConnectInfo()}
    </>
  );
};
export default AddressItems;
