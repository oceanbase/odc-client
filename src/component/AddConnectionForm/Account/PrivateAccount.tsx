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

import { AccountType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { validTrimEmptyWithWarn } from '@/util/valid';
import { Checkbox, Col, Form, Input, Row, Space, Typography } from 'antd';
import React, { useState } from 'react';
import FormItemGroup from '../FormItemGroup';
import type { IConnectionTestResponseData } from '../index';
import { ErrorTip, IStatus } from './index';
import UserInput from './UserInput';

interface IProps {
  isEdit: boolean;
  isCopy: boolean;
  onlySys: boolean;
  isOldPasswordSaved: boolean;
  baseWidth: number;
  handleChangeFormData: (values: Record<string, any>) => void;
  handleConnectionTest: (
    nameKey: string,
    passwordKey: string,
    accountType: AccountType,
  ) => Promise<IConnectionTestResponseData>;
  getStatusByTestResult: (data: IConnectionTestResponseData) => IStatus;
}

const PrivateAccount: React.FC<IProps> = function (props) {
  const {
    isEdit,
    isCopy,
    isOldPasswordSaved,
    onlySys,
    baseWidth,
    handleConnectionTest,
    handleChangeFormData,
    getStatusByTestResult,
  } = props;
  const [passwordIsEditing, setPasswordIsEditing] = useState(false);
  const [status, setStatus] = useState<IStatus>(null);
  /**
   * 根据sid获取密码。
   */
  const isPwdCopyMode = (isEdit || isCopy) && isOldPasswordSaved;

  /**
   * 编辑模式下，没按编辑按钮或者sys模式下不可编辑
   */

  const passwordEditable = isPwdCopyMode ? passwordIsEditing && !onlySys : true;
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
                    hasFeedback={!!status?.status}
                    validateStatus={status?.status}
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
                      disabled={onlySys}
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
              required
              hasFeedback={!!status?.status}
              validateStatus={status?.status}
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
        <ErrorTip status={status} />
        <Row>
          <Space size={12}>
            <a
              style={{
                whiteSpace: 'nowrap',
              }}
              onClick={async () => {
                const res = await handleConnectionTest('username', 'password', AccountType.MAIN);
                const status = getStatusByTestResult(res);
                setStatus(status);
              }}
            >
              {formatMessage({
                id: 'portal.connection.form.test',
              })}
            </a>
            {isPwdCopyMode &&
              (passwordIsEditing ? (
                <a
                  onClick={() => {
                    setPasswordIsEditing(false);
                    handleChangeFormData({
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
                    handleChangeFormData({
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
        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) => {
            const passwordSaved = getFieldValue('passwordSaved');
            return (
              <Form.Item name="passwordSaved" valuePropName={'checked'}>
                <Checkbox>
                  <Space size={12}>
                    <Typography.Text>
                      {
                        formatMessage({
                          id: 'odc.AddConnectionForm.Account.PrivateAccount.SavePassword',
                        })

                        /*保存密码*/
                      }
                    </Typography.Text>
                    {!passwordSaved && (
                      <Typography.Text type="secondary">
                        {
                          formatMessage({
                            id: 'odc.AddConnectionForm.Account.PrivateAccount.ThePasswordIsNotSaved',
                          })

                          /*不保存密码，每次进入连接或测试连接时均需重新输入密码*/
                        }
                      </Typography.Text>
                    )}
                  </Space>
                </Checkbox>
              </Form.Item>
            );
          }}
        </Form.Item>
      </FormItemGroup>
    </>
  );
};

export default PrivateAccount;
