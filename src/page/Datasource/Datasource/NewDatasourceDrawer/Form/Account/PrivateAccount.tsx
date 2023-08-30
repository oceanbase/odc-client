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

import Action from '@/component/Action';
import { IConnectionTestErrorType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { validTrimEmptyWithWarn } from '@/util/valid';
import { Col, Form, Input, Row, Space, Typography } from 'antd';
import React, { useContext, useMemo, useState } from 'react';
import DatasourceFormContext from '../context';
import FormItemGroup from '../FormItemGroup';
import UserInput from './UserInput';

interface IProps {
  isEdit: boolean;
}

export const ErrorTip: React.FC<{
  errorMessage: string;
}> = ({ errorMessage }) => {
  return (
    !!errorMessage && (
      <div>
        <Typography.Text type="danger">{errorMessage}</Typography.Text>
      </div>
    )
  );
};

const PrivateAccount: React.FC<IProps> = function (props) {
  const { isEdit } = props;
  const [passwordIsEditing, setPasswordIsEditing] = useState(false);

  const formContext = useContext(DatasourceFormContext);
  /**
   * 根据sid获取密码。
   */
  const isPwdCopyMode = isEdit;

  /**
   * 编辑模式下，没按编辑按钮或者sys模式下不可编辑
   */

  const passwordEditable = isPwdCopyMode ? passwordIsEditing : true;

  const passwordValidStatus = useMemo(() => {
    if (formContext?.testResult?.active) {
      return 'success';
    } else if (
      [
        IConnectionTestErrorType.OB_ACCESS_DENIED,
        IConnectionTestErrorType.OB_MYSQL_ACCESS_DENIED,
        IConnectionTestErrorType.UNKNOWN,
      ].includes(formContext?.testResult?.errorCode)
    ) {
      return 'error';
    }
  }, [formContext?.testResult]);
  if (!formContext?.dataSourceConfig?.account) {
    return null;
  }
  return (
    <>
      <FormItemGroup
        label={formatMessage({
          id: 'odc.AddConnectionForm.Account.PrivateAccount.DatabaseAccount',
        })}

        /*数据库账号*/
      >
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => {
                const clusterId = getFieldValue('clusterName');
                const tenantId = getFieldValue('tenantName');
                return (
                  <Form.Item
                    validateStatus={passwordValidStatus}
                    hasFeedback={!!passwordValidStatus}
                    label={
                      formatMessage({
                        id: 'odc.AddConnectionForm.Account.PrivateAccount.DatabaseUsername',
                      }) //数据库用户名
                    }
                    name="username"
                    rules={[
                      {
                        required: true,
                        message: formatMessage({
                          id: 'odc.AddConnectionForm.Account.PrivateAccount.EnterAnAccount',
                        }),
                        //请输入账号
                      },

                      {
                        validator: validTrimEmptyWithWarn(
                          formatMessage({
                            id: 'odc.AddConnectionForm.Account.PrivateAccount.TheEndOfTheAccount',
                          }),
                          //账号首尾包含空格
                        ),
                      },
                    ]}
                  >
                    <UserInput
                      clusterId={clusterId}
                      tenantId={tenantId}
                      placeholder={
                        formatMessage({
                          id: 'odc.AddConnectionForm.Account.PrivateAccount.EnterADatabaseUsername',
                        }) //请输入数据库用户名
                      }
                    />
                  </Form.Item>
                );
              }}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              validateStatus={passwordValidStatus}
              hasFeedback={!!passwordValidStatus}
              required
              label={
                formatMessage({
                  id: 'odc.AddConnectionForm.Account.PrivateAccount.DatabasePassword',
                }) //数据库密码
              }
              name={!isPwdCopyMode || passwordIsEditing ? 'password' : null}
            >
              {!isPwdCopyMode || passwordIsEditing ? (
                <Input.Password
                  autoComplete="new-password"
                  disabled={!passwordEditable}
                  defaultValue={''}
                  style={{
                    width: '100%',
                  }}
                  visibilityToggle={false}
                  placeholder={
                    formatMessage({
                      id: 'odc.AddConnectionForm.Account.PrivateAccount.EnterAPassword',
                    }) //请输入密码
                  }
                />
              ) : (
                <Input.Password
                  style={{
                    width: '100%',
                  }}
                  visibilityToggle={false}
                  value="******"
                  disabled
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <ErrorTip
          errorMessage={
            passwordValidStatus === 'error' ? formContext?.testResult?.errorMessage : null
          }
        />
        <Row>
          <Space size={12}>
            <Action.Link
              onClick={async () => {
                return formContext?.test();
              }}
            >
              {formatMessage({
                id: 'portal.connection.form.test',
              })}
            </Action.Link>
            {isPwdCopyMode &&
              (passwordIsEditing ? (
                <a
                  onClick={() => {
                    setPasswordIsEditing(false);
                    formContext.form?.setFieldsValue({
                      password: null,
                    });
                  }}
                >
                  {
                    formatMessage({
                      id: 'odc.AddConnectionDrawer.AddConnectionForm.CancelModification',
                    })

                    /* 取消修改 */
                  }
                </a>
              ) : (
                <a
                  onClick={() => {
                    setPasswordIsEditing(true);
                    formContext.form?.setFieldsValue({
                      password: '',
                    });
                  }}
                >
                  {
                    formatMessage({
                      id: 'odc.AddConnectionDrawer.AddConnectionForm.ChangePassword',
                    })

                    /* 修改密码 */
                  }
                </a>
              ))}
          </Space>
        </Row>
      </FormItemGroup>
    </>
  );
};

export default PrivateAccount;
