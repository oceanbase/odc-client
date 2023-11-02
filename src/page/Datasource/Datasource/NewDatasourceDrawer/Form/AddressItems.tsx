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

import { isConnectTypeBeShardingType } from '@/util/connection';
import { haveOCP } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { checkNumberRange, validTrimEmptyWithWarn } from '@/util/valid';
import { Col, Form, Input, Row } from 'antd';
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
                    id:
                      'odc.src.page.Datasource.Datasource.NewDatasourceDrawer.Form.HostIPDomainName',
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
