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

import { testExsitConnection } from '@/common/network/connection';
import Helpdoc from '@/component/helpDoc';
import { EnableOverwriteSysConfig } from '@/constant';
import { IConnection } from '@/d.ts';
import login from '@/store/login';
import { formatMessage } from '@/util/intl';
import notification from '@/util/notification';
import { useUpdate } from 'ahooks';
import { Checkbox, Col, Form, Input, message, Row, Space, Tooltip, Typography } from 'antd';
import { FormInstance } from 'antd/es/form';
import { ValidateStatus } from 'antd/es/form/FormItem';
import React, { useCallback, useEffect, useState } from 'react';
import FormItemPanel from '../FormItemPanel';
const { Text } = Typography;
interface IProps {
  form: FormInstance<any>;
  connection?: IConnection;
  /**
   * 是否强制要求配置
   */
  enforce?: boolean;
  /**
   * 保证每次渲染都可以更新
   */
  randomKey?: any;
  tip?: (useSys: boolean, existSys: boolean, enforce: boolean) => string;
}
const SysFormItem: React.FC<IProps> = function (props) {
  const { connection, form, enforce, tip } = props;
  const [existSys, setExistSys] = useState(null);
  const [pwdEdit, setPwdEdit] = useState(null);
  const [status, setStatus] = useState<ValidateStatus>('');
  const _forceUpdate = useUpdate();
  const sysUser = connection?.sysTenantUsername;
  const sid = connection?.id;
  const useSys = form.getFieldValue('useSys');
  const forceUpdate = useCallback(() => {
    _forceUpdate();
    setTimeout(() => {
      if (!form.getFieldValue('useSys')) {
        form.validateFields(['sysUser', 'sysUserPassword', 'sid']);
      }
    });
  }, []);
  useEffect(() => {
    /**
     * 已存在 sysUser 的处理逻辑
     */
    form.setFieldsValue({
      sysUser,
      sid,
      useSys: !!sysUser,
    });
    setExistSys(sysUser);
    if (!sysUser) {
      setPwdEdit(true);
    }
  }, [sysUser]);
  useEffect(() => {
    /**
     * 强制必填，则勾选
     */
    if (enforce) {
      form.setFieldsValue({
        useSys: true,
      });
    }
  }, [enforce]);
  useEffect(() => {
    /**
     * useSys 改变的时候，用户名没填，就自动展开
     */
    form.resetFields(['overwriteSysConfig']);
  }, [useSys]);
  async function testSys() {
    if (!connection) {
      form.setFields([
        {
          name: ['databaseId'],
          errors: [
            formatMessage({
              id: 'odc.src.component.SysFormItem.PleaseSelectTheDatabase',
              defaultMessage: '请选择数据库',
            }), //'请选择数据库'
          ],
        },
      ]);
      form?.scrollToField('databaseId');
      return;
    }
    const values = await form.validateFields(['sysUser', 'sysUserPassword', 'sid']);
    const res = await testExsitConnection(
      {
        creatorId: login.user?.id,
        type: connection.type,
        host: connection.host,
        port: connection.port,
        clusterName: connection.clusterName,
        tenantName: connection.tenantName,
        id: connection.id,
        username: values.sysUser,
        password: values.sysUserPassword,
        sslConfig: connection.sslConfig,
      },
      true,
    );
    if (!res?.data?.active) {
      setStatus('error');
      notification.error({
        track: res?.data?.errorMessage,
        requestId: null,
      });
    } else {
      setStatus('success');
      message.success(
        formatMessage({
          id: 'odc.component.SysFormItem.ConnectionSucceeded',
          defaultMessage: '连接成功',
        }), // 连接成功
      );
    }
  }

  function resetStatus() {
    setStatus('');
  }
  return (
    <FormItemPanel
      label={formatMessage({
        id: 'odc.component.SysFormItem.SysTenantAccountSettings',
        defaultMessage: 'sys 租户账号设置',
      })}
      /* sys 租户账号设置 */ expandText={formatMessage({
        id: 'odc.component.SysFormItem.Configuration',
        defaultMessage: '配置',
      })}
      /* 配置 */ keepExpand
      overview={
        <>
          <Form.Item
            name="useSys"
            valuePropName="checked"
            style={{
              marginBottom: 0,
            }}
          >
            <Checkbox disabled={enforce} onChange={forceUpdate}>
              <Tooltip
                title={
                  enforce
                    ? formatMessage({
                        id: 'odc.component.SysFormItem.ToExportObjectsOtherThan',
                        defaultMessage: '导出表/视图之外的对象需要开启配置',
                      })
                    : null
                }
              >
                {
                  formatMessage({
                    id: 'odc.component.SysFormItem.UseTheSysTenantAccount',
                    defaultMessage: '使用 sys 租户账号提升任务速度',
                  }) /* 使用 Sys 租户账号提升导出速度 */
                }
              </Tooltip>
              <Helpdoc isTip leftText doc="sysTransfer" />
            </Checkbox>
          </Form.Item>
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const tipMsg = tip?.(getFieldValue('useSys'), existSys, enforce);
              return !!tipMsg && <Text type="secondary">{tipMsg}</Text>;
            }}
          </Form.Item>
        </>
      }
    >
      <Form.Item noStyle shouldUpdate>
        {({ getFieldValue }) => {
          const useSys = getFieldValue('useSys');
          if (!useSys) {
            return null;
          }
          return (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    shouldUpdate
                    hasFeedback
                    validateStatus={status}
                    label={formatMessage({
                      id: 'odc.component.SysFormItem.Account',
                      defaultMessage: '账号',
                    })}
                    /* 账号 */ name="sysUser"
                    rules={[
                      {
                        required: !!useSys,
                        message: formatMessage({
                          id: 'odc.component.SysFormItem.EnterASysAccount',
                          defaultMessage: '请输入 sys 账号',
                        }), // 请输入 Sys 账号
                      },
                    ]}
                  >
                    <Input
                      onChange={resetStatus}
                      placeholder={formatMessage({
                        id: 'odc.component.SysFormItem.EnterTheSysAccount',
                        defaultMessage: '请填写 sys 账号',
                      })} /* 请填写 Sys 账号 */
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  {pwdEdit ? (
                    <Form.Item
                      shouldUpdate
                      hasFeedback
                      validateStatus={status}
                      label={formatMessage({
                        id: 'odc.component.SysFormItem.Password',
                        defaultMessage: '密码',
                      })}
                      /* 密码 */ name="sysUserPassword"
                      initialValue={''}
                    >
                      <Input.Password
                        onChange={resetStatus}
                        disabled={!pwdEdit}
                        visibilityToggle={false}
                        placeholder={formatMessage({
                          id: 'odc.component.SysFormItem.EnterTheSysPassword',
                          defaultMessage: '请填写 sys 密码',
                        })} /* 请填写 Sys 密码 */
                      />
                    </Form.Item>
                  ) : (
                    <Form.Item
                      label={formatMessage({
                        id: 'odc.component.SysFormItem.Password',
                        defaultMessage: '密码',
                      })}
                      /* 密码 */ hasFeedback
                      validateStatus={status}
                    >
                      <Input disabled value="******" />
                    </Form.Item>
                  )}

                  {!pwdEdit ? (
                    <Form.Item
                      name="sid"
                      style={{
                        display: 'none',
                      }}
                    >
                      <Input />
                    </Form.Item>
                  ) : null}
                </Col>
                <Col span={12}>
                  <Space>
                    <a onClick={testSys}>
                      {
                        formatMessage({
                          id: 'odc.component.SysFormItem.TestConnection',
                          defaultMessage: '测试连接',
                        }) /* 测试连接 */
                      }
                    </a>
                    {existSys ? (
                      <a
                        onClick={() => {
                          if (pwdEdit) {
                            /**
                             * 取消编辑
                             */
                            form.setFieldsValue({
                              sysUserPassword: null,
                              sid,
                            });
                          } else {
                            /**
                             * 开始编辑
                             */
                            form.setFieldsValue({
                              sysUserPassword: '',
                            });
                          }
                          setPwdEdit(!pwdEdit);
                        }}
                      >
                        {!pwdEdit
                          ? formatMessage({
                              id: 'odc.component.SysFormItem.ChangePassword',
                              defaultMessage: '修改密码',
                            }) /* 修改密码 */
                          : formatMessage({
                              id: 'odc.AddConnectionDrawer.AddConnectionForm.CancelModification',
                              defaultMessage: '取消修改',
                            })}
                      </a>
                    ) : null}
                  </Space>
                </Col>
              </Row>
              {EnableOverwriteSysConfig && (
                <Row>
                  <Form.Item shouldUpdate noStyle>
                    {({ getFieldValue }) => {
                      return (
                        <Form.Item valuePropName="checked" name="overwriteSysConfig">
                          <Checkbox disabled={!getFieldValue('useSys')}>
                            {
                              formatMessage({
                                id: 'odc.component.SysFormItem.SaveTheAccountInformationTo',
                                defaultMessage: '保存此账号信息至连接属性中',
                              }) /* 保存此账号信息至连接属性中 */
                            }
                          </Checkbox>
                        </Form.Item>
                      );
                    }}
                  </Form.Item>
                </Row>
              )}
            </>
          );
        }}
      </Form.Item>
    </FormItemPanel>
  );
};
export default SysFormItem;
