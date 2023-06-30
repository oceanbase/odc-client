import { isConnectTypeBeShardingType } from '@/util/connection';
import { formatMessage } from '@/util/intl';
import { checkNumberRange, validTrimEmptyWithWarn } from '@/util/valid';
import { Col, Form, Input, Row } from 'antd';
import React from 'react';
import styles from './index.less';

interface IProps {}

const AddressItems: React.FC<IProps> = function (props) {
  const renderConnectInfo = () => {
    const baseFormItem = (
      <>
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
      </>
    );

    return (
      <div className={styles.inlineForm}>
        <div>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="host"
                style={{
                  marginBottom: 16,
                }}
                label={formatMessage({
                  id: 'odc.component.AddConnectionForm.AddressItems.HostIp',
                })}
                /*主机 IP*/
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
          </Row>
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const connectType = getFieldValue('type');
              return isConnectTypeBeShardingType(connectType) ? null : (
                <Row gutter={12}>{baseFormItem}</Row>
              );
            }}
          </Form.Item>
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
      {renderConnectInfo()}
    </>
  );
};

export default AddressItems;
