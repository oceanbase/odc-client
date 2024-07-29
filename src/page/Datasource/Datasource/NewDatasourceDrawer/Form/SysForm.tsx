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

import { testConnection } from '@/common/network/connection';
import FormItemPanel from '@/component/FormItemPanel';
import { AccountType } from '@/d.ts';
import { haveOCP } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { Checkbox, Col, Form, Input, InputRef, message, Row, Typography } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import { useContext, useEffect, useRef, useState } from 'react';
import DatasourceFormContext from './context';
import styles from './index.less';
import Password from './Password';

interface IProps {
  isEdit: boolean;
  sysAccountExist: boolean;
  formRef: FormInstance;
}

export default (props: IProps) => {
  const { formRef, isEdit, sysAccountExist } = props;
  const [sysPasswordIsEditing, setSysPasswordIsEditing] = useState(false);
  const sysInput = useRef<InputRef>();
  const formContext = useContext(DatasourceFormContext);
  const isSysPwdCopyMode = isEdit;

  useEffect(() => {
    formRef.setFieldsValue({
      useSys: sysAccountExist,
    });
  }, [sysAccountExist]);

  async function testSys() {
    let values;
    try {
      values = await formRef.validateFields([
        'type',
        'host',
        'port',
        'clusterName',
        'tenantName',
        'sysTenantUsername',
        'sysTenantPassword',
        'sslConfig',
      ]);
    } catch (e) {}
    if (!values) {
      return;
    }
    const params = isEdit ? { ...formContext.originDatasource, ...values } : values;
    params.username = params?.sysTenantUsername;
    params.password = params?.sysTenantPassword;
    const res = await testConnection(params, AccountType.SYS_READ, true);
    const error = res?.errMsg || res?.data?.errorMessage;
    !error
      ? message.success(
          formatMessage({
            id: 'odc.NewDatasourceDrawer.Form.SysForm.ConnectionSuccessful',
            defaultMessage: '连接成功',
          }), //连接成功
        )
      : message.error(error);
  }

  if (haveOCP()) {
    return null;
  }
  return (
    <>
      <Form.Item name="useSys" valuePropName="checked" style={{ marginBottom: 0 }}>
        <Checkbox>
          {
            formatMessage({
              id: 'odc.component.AddConnectionForm.SysForm.UseTheSysTenantAccount',
              defaultMessage: '使用 sys 租户账号查询租户视图',
            })
            /*使用 sys 租户账号查询租户视图*/
          }
        </Checkbox>
      </Form.Item>
      <Row>
        <Typography.Text type="secondary">
          {
            formatMessage({
              id: 'odc.component.AddConnectionForm.SysForm.TheExportAndDerivativeSpeed',
              defaultMessage: '部分对象的导出和导数速度提升均依赖该账号',
            }) /*部分对象的导出和导数速度提升均依赖该账号*/
          }
        </Typography.Text>
      </Row>

      <Form.Item noStyle shouldUpdate>
        {({ getFieldValue }) => {
          const useSys = getFieldValue('useSys');
          if (!useSys) {
            return null;
          }
          return (
            <FormItemPanel keepExpand>
              <div className={styles.inlineForm}>
                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item
                      label={formatMessage({
                        id: 'odc.AddConnectionDrawer.AddConnectionForm.Account',
                        defaultMessage: '账号',
                      })}
                      name="sysTenantUsername"
                    >
                      <Input
                        autoComplete="new-account"
                        ref={sysInput}
                        placeholder={formatMessage({
                          id: 'odc.AddConnectionDrawer.AddConnectionForm.Enter',
                          defaultMessage: '请输入',
                        })}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={formatMessage({
                        id: 'odc.AddConnectionDrawer.AddConnectionForm.Password',
                        defaultMessage: '密码',
                      })}
                      name="sysTenantPassword"
                    >
                      <Password
                        isEditing={!isSysPwdCopyMode || !sysAccountExist || sysPasswordIsEditing}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <a
                  style={{
                    marginRight: 8,
                  }}
                  onClick={async () => testSys()}
                >
                  {formatMessage({
                    id: 'portal.connection.form.test',
                    defaultMessage: '测试连接',
                  })}
                </a>
                {isSysPwdCopyMode &&
                  sysAccountExist &&
                  (sysPasswordIsEditing ? (
                    <a
                      onClick={() => {
                        setSysPasswordIsEditing(false);

                        formContext.form?.setFieldsValue({
                          sysTenantPassword: null,
                        });
                      }}
                    >
                      {
                        formatMessage({
                          id: 'odc.AddConnectionDrawer.AddConnectionForm.CancelModification',
                          defaultMessage: '取消修改',
                        })

                        /* 取消修改 */
                      }
                    </a>
                  ) : (
                    <a
                      onClick={() => {
                        setSysPasswordIsEditing(true);
                        formContext.form?.setFieldsValue({
                          sysTenantPassword: '',
                        });
                      }}
                    >
                      {
                        formatMessage({
                          id: 'odc.AddConnectionDrawer.AddConnectionForm.ChangePassword',
                          defaultMessage: '修改密码',
                        })

                        /* 修改密码 */
                      }
                    </a>
                  ))}
              </div>
            </FormItemPanel>
          );
        }}
      </Form.Item>
    </>
  );
};
