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

import { formatMessage } from '@/util/intl';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
// compatible
import { PASSWORD_REGEX } from '@/constant';
import { IUser } from '@/d.ts';
import { UserStore } from '@/store/login';
import { Form, Input, Modal } from 'antd';
import { FormInstance } from 'antd/lib/form';

interface IProps {
  confirmLoading: boolean;
  userStore?: UserStore;
  onSave: (values: Partial<IUser>) => void;
  visible: boolean;
  onCancel: () => void;
}

@inject('userStore')
@observer
class RegisterModal extends Component<IProps> {
  private formRef = React.createRef<FormInstance>();
  public handleSubmit = async () => {
    try {
      const values = await this.formRef.current?.validateFields();
      this.props.onSave({
        email: values.account,
        name: values.account, // 考虑兼容性
        password: values.password,
      });
    } catch (e) {}
  };

  public handleValidateAccount = async (rule: any, value: string, callback: any) => {
    const { userStore } = this.props;
    const isExist = await userStore?.isUserExists(value);
    if (isExist) {
      throw new Error();
    }
  };

  public handleValidatePassword = async (rule: any, value: string, callback: any) => {
    if (!this.formRef.current) {
      return;
    }
    const { getFieldValue } = this.formRef.current;
    const password = getFieldValue('password');
    const valid = password === value;
    if (!valid) {
      throw new Error();
    }
    callback();
  };

  public render() {
    const { visible, onCancel, confirmLoading } = this.props;
    return (
      <Modal
        centered={true}
        width={560}
        destroyOnClose={true}
        title={formatMessage({ id: 'login.button.register', defaultMessage: '注册账号' })}
        open={visible}
        onOk={this.handleSubmit}
        onCancel={onCancel}
        confirmLoading={confirmLoading}
      >
        <Form layout="vertical" hideRequiredMark={true} colon={false} ref={this.formRef}>
          <Form.Item noStyle shouldUpdate>
            {({ getFieldError }) => {
              console.log(getFieldError('account'));
              return (
                <Form.Item
                  label={formatMessage({ id: 'password.label.account', defaultMessage: '账号' })}
                  name="account"
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: formatMessage({
                        id: 'login.username.validation.required',
                        defaultMessage: '请输入账号',
                      }),
                    },
                    {
                      min: 4,
                      max: 48,
                      message: formatMessage({
                        id: 'login.username.validation.length',
                        defaultMessage: '不少于 4 个字符且不超过 14 个字符',
                      }),
                    },
                    {
                      pattern: /^[a-zA-Z0-9_\.\+\@\#\$\%]+$/,
                      message: formatMessage({
                        id: 'login.account.valid',
                        defaultMessage:
                          '支持英文、数字、下划线和特殊字符（._+@#$%）的组合，长度为 4~48 个字符',
                      }),
                    },
                    {
                      validator: this.handleValidateAccount,
                      message: formatMessage({
                        id: 'password.label.account.validation',
                        defaultMessage: '该账号已存在',
                      }),
                    },
                  ]}
                >
                  <Input
                    placeholder={formatMessage({
                      id: 'login.common.placeholder',
                      defaultMessage: '请输入',
                    })}
                  />
                </Form.Item>
              );
            }}
          </Form.Item>
          <Form.Item
            label={formatMessage({ id: 'password.label', defaultMessage: '密码' })}
            name="password"
            dependencies={['confirmPassword']}
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'login.password.validation.required',
                  defaultMessage: '请输入密码',
                }),
              },
              {
                pattern: PASSWORD_REGEX,
                message: formatMessage({
                  id: 'login.password.valid',
                  defaultMessage:
                    '至少包含 2 个数字、2 个大写字母、2 个小写字母和 2 个特殊字符（._+@#$%），长度为 8~32 个字符',
                }),
              },
            ]}
          >
            <Input
              type="password"
              placeholder={formatMessage({
                id: 'login.common.placeholder',
                defaultMessage: '请输入',
              })}
              autoComplete="new-password"
            />
          </Form.Item>
          <Form.Item
            label={formatMessage({ id: 'password.label.confirm1', defaultMessage: '确认密码' })}
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'login.password.validation.required',
                  defaultMessage: '请输入密码',
                }),
              },
              {
                validator: this.handleValidatePassword,
                message: formatMessage({
                  id: 'password.label.confirm.validation',
                  defaultMessage: '确认密码不一致',
                }),
              },
              {
                pattern: PASSWORD_REGEX,
                message: formatMessage({
                  id: 'login.password.validation.strength',
                  defaultMessage: '密码强度不符合要求',
                }),
              },
            ]}
          >
            <Input
              type="password"
              placeholder={formatMessage({
                id: 'login.common.placeholder',
                defaultMessage: '请输入',
              })}
            />
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default RegisterModal;
