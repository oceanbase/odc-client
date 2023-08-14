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
import { validTrimEmptyWithErrorWhenNeed, validTrimEmptyWithWarn } from '@/util/valid';
import { Col, Form, Input, Row, Space } from 'antd';
import React, { useState } from 'react';
import type { IConnectionTestResponseData } from '../index';
import styles from '../index.less';
import { ErrorTip, IStatus } from './index';
import UserInput from './UserInput';

interface IProps {
  isEdit: boolean;
  isCopy: boolean;
  isOldPasswordSaved: boolean;
  onlySys: boolean;
  handleChangeFormData: (values: Record<string, any>) => void;
  handleConnectionTest: (
    nameKey: string,
    passwordKey: string,
    accountType: AccountType,
  ) => Promise<IConnectionTestResponseData>;
  getStatusByTestResult: (data: IConnectionTestResponseData) => IStatus;
}

const PublicAccount: React.FC<IProps> = function (props) {
  const {
    isEdit,
    isCopy,
    isOldPasswordSaved,
    onlySys,
    handleChangeFormData,
    handleConnectionTest,
    getStatusByTestResult,
  } = props;
  const [passwordIsEditing, setPasswordIsEditing] = useState(false);
  const [readonlyPasswordIsEditing, setReadonlyPasswordIsEditing] = useState(false);
  const [validatingUsername, setValidatingUsername] = useState(true);
  const [validatingReadonlyUsername, setValidatingReadonlyUsername] = useState(true);
  const [readWriteAccountStatus, setReadWriteAccountStatus] = useState<IStatus>(null);
  const [readOnlyAccountStatus, setReadOnlyAccountStatus] = useState<IStatus>(null);

  /**
   * 根据sid获取密码。
   */
  const isPwdCopyMode = (isEdit || isCopy) && isOldPasswordSaved;

  /**
   * 编辑模式下，没按编辑按钮或者sys模式下不可编辑
   */

  const passwordEditable = isPwdCopyMode ? passwordIsEditing && !onlySys : true;
  const readonlyPasswordEditable = isPwdCopyMode ? readonlyPasswordIsEditing && !onlySys : true;
  return (
    <>
      <div className="ant-form-item-label">
        <label className={styles.labelTitle}>
          {
            formatMessage({
              id: 'odc.component.AddConnectionForm.ReadWriteAccounts',
            })

            /* 读写账号 */
          }
        </label>
        <div className={styles.labelDescription}>
          {
            formatMessage({
              id: 'odc.component.AddConnectionForm.UseThisAccountToLog',
            })

            /* 拥有读写权限的用户使用该账号登录数据库 */
          }
        </div>
      </div>
      <Form.Item>
        <div className={styles.inlineForm}>
          <Row gutter={12}>
            <Col span={12}>
              {
                // todo 采用name.xxx 层级数据 承载表单项
              }
              <Form.Item noStyle shouldUpdate>
                {({ getFieldValue }) => {
                  const clusterId = getFieldValue('clusterName');
                  const tenantId = getFieldValue('tenantName');
                  return (
                    <Form.Item
                      hasFeedback={!!readWriteAccountStatus?.status}
                      validateStatus={readWriteAccountStatus?.status}
                      label={formatMessage({
                        id: 'odc.AddConnectionForm.Account.PublicAccount.Account',
                      })} /*账号*/
                      name="username"
                      className={styles.noRequiredMark}
                      rules={[
                        {
                          validator: validTrimEmptyWithErrorWhenNeed(
                            formatMessage({
                              id: 'odc.AddConnectionForm.Account.PublicAccount.EnterAnAccount',
                            }), //请输入账号
                            () => {
                              return validatingUsername;
                            },
                          ),
                        },

                        {
                          validator: validTrimEmptyWithWarn(
                            formatMessage({
                              id: 'odc.AddConnectionForm.Account.PublicAccount.TheEndOfTheAccount',
                            }), //账号首尾包含空格
                          ),
                        },
                      ]}
                    >
                      <UserInput
                        clusterId={clusterId}
                        tenantId={tenantId}
                        disabled={onlySys}
                        placeholder={formatMessage({
                          id: 'odc.AddConnectionForm.Account.PublicAccount.EnterAnAccount',
                        })} /*请输入账号*/
                      />
                    </Form.Item>
                  );
                }}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                required
                hasFeedback={!!readWriteAccountStatus?.status}
                validateStatus={readWriteAccountStatus?.status}
                label={formatMessage({
                  id: 'odc.AddConnectionForm.Account.PublicAccount.Password',
                })} /*密码*/
                name={!isPwdCopyMode || passwordIsEditing ? 'password' : null}
              >
                {!isPwdCopyMode || passwordIsEditing ? (
                  <Input.Password
                    autoComplete="new-password"
                    disabled={!passwordEditable}
                    visibilityToggle={false}
                    placeholder={formatMessage({
                      id: 'odc.AddConnectionForm.Account.PublicAccount.EnterAPassword',
                    })} /*请输入密码*/
                  />
                ) : (
                  <Input.Password value="******" disabled />
                )}
              </Form.Item>
            </Col>
          </Row>
          <ErrorTip status={readWriteAccountStatus} />
          <Space size={12}>
            <a
              style={{
                whiteSpace: 'nowrap',
              }}
              onClick={async () => {
                setValidatingReadonlyUsername(false);
                const res = await handleConnectionTest('username', 'password', AccountType.MAIN);
                const status = getStatusByTestResult(res);
                setReadWriteAccountStatus(status);
                setValidatingReadonlyUsername(true);
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
        </div>
      </Form.Item>
      <div className="ant-form-item-label">
        <label className={styles.labelTitle}>
          {
            formatMessage({
              id: 'odc.component.AddConnectionForm.ReadOnlyAccount',
            })

            /* 只读账号 */
          }
        </label>
        <div className={styles.labelDescription}>
          {
            formatMessage({
              id: 'odc.component.AddConnectionForm.UsersWithReadOnlyPermissions',
            })

            /* 拥有只读权限的用户使用该账号登录数据库，为保障权限可控，请确账号对数据库仅具备只读权限 */
          }
        </div>
      </div>
      <Form.Item>
        <div className={styles.inlineForm}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item noStyle shouldUpdate>
                {({ getFieldValue }) => {
                  const clusterId = getFieldValue('clusterName');
                  const tenantId = getFieldValue('tenantName');
                  return (
                    <Form.Item
                      hasFeedback={!!readOnlyAccountStatus?.status}
                      validateStatus={readOnlyAccountStatus?.status}
                      label={formatMessage({
                        id: 'odc.AddConnectionForm.Account.PublicAccount.Account',
                      })} /*账号*/
                      name="readonlyUsername"
                      className={styles.noRequiredMark}
                      rules={[
                        {
                          validator: validTrimEmptyWithErrorWhenNeed(
                            formatMessage({
                              id: 'odc.AddConnectionForm.Account.PublicAccount.EnterAnAccount',
                            }), //请输入账号
                            () => {
                              return validatingReadonlyUsername;
                            },
                          ),
                        },

                        {
                          validator: validTrimEmptyWithWarn(
                            formatMessage({
                              id: 'odc.AddConnectionForm.Account.PublicAccount.TheEndOfTheAccount',
                            }), //账号首尾包含空格
                          ),
                        },
                      ]}
                    >
                      <UserInput
                        clusterId={clusterId}
                        tenantId={tenantId}
                        disabled={onlySys}
                        placeholder={formatMessage({
                          id: 'odc.AddConnectionForm.Account.PublicAccount.EnterAnAccount',
                        })} /*请输入账号*/
                      />
                    </Form.Item>
                  );
                }}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                required
                hasFeedback={!!readOnlyAccountStatus?.status}
                validateStatus={readOnlyAccountStatus?.status}
                label={formatMessage({
                  id: 'odc.AddConnectionForm.Account.PublicAccount.Password',
                })} /*密码*/
                name={!isPwdCopyMode || readonlyPasswordIsEditing ? 'readonlyPassword' : null}
              >
                {!isPwdCopyMode || readonlyPasswordIsEditing ? (
                  <Input.Password
                    autoComplete="new-password"
                    disabled={!readonlyPasswordEditable}
                    visibilityToggle={false}
                    placeholder={formatMessage({
                      id: 'odc.AddConnectionForm.Account.PublicAccount.EnterAPassword',
                    })} /*请输入密码*/
                  />
                ) : (
                  <Input.Password value="******" disabled />
                )}
              </Form.Item>
            </Col>
          </Row>
          <ErrorTip status={readOnlyAccountStatus} />
          <Space size={12}>
            <a
              style={{
                whiteSpace: 'nowrap',
              }}
              onClick={async () => {
                setValidatingUsername(false);
                const res = await handleConnectionTest(
                  'readonlyUsername',
                  'readonlyPassword',
                  AccountType.READONLY,
                );

                const status = getStatusByTestResult(res);
                setReadOnlyAccountStatus(status);
                setValidatingUsername(true);
              }}
            >
              {formatMessage({
                id: 'portal.connection.form.test',
              })}
            </a>
            {isPwdCopyMode &&
              (readonlyPasswordIsEditing ? (
                <a
                  onClick={() => {
                    setReadonlyPasswordIsEditing(false);
                    handleChangeFormData({
                      readonlyPassword: null,
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
                    setReadonlyPasswordIsEditing(true);
                    handleChangeFormData({
                      readonlyPassword: '',
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
        </div>
      </Form.Item>
    </>
  );
};

export default PublicAccount;
