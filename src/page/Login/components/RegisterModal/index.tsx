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
        title={formatMessage({ id: 'login.button.register' })}
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
                  label={formatMessage({ id: 'password.label.account' })}
                  name="account"
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: formatMessage({
                        id: 'login.username.validation.required',
                      }),
                    },
                    {
                      min: 4,
                      max: 48,
                      message: formatMessage({
                        id: 'login.username.validation.length',
                      }),
                    },
                    {
                      pattern: /^[a-zA-Z0-9_\.\+\@\#\$\%]+$/,
                      message: formatMessage({ id: 'login.account.valid' }),
                    },
                    {
                      validator: this.handleValidateAccount,
                      message: formatMessage({
                        id: 'password.label.account.validation',
                      }),
                    },
                  ]}
                >
                  <Input
                    placeholder={formatMessage({
                      id: 'login.common.placeholder',
                    })}
                  />
                </Form.Item>
              );
            }}
          </Form.Item>
          <Form.Item
            label={formatMessage({ id: 'password.label' })}
            name="password"
            dependencies={['confirmPassword']}
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'login.password.validation.required',
                }),
              },
              {
                pattern: PASSWORD_REGEX,
                message: formatMessage({ id: 'login.password.valid' }),
              },
            ]}
          >
            <Input
              type="password"
              placeholder={formatMessage({ id: 'login.common.placeholder' })}
              autoComplete="new-password"
            />
          </Form.Item>
          <Form.Item
            label={formatMessage({ id: 'password.label.confirm1' })}
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'login.password.validation.required',
                }),
              },
              {
                validator: this.handleValidatePassword,
                message: formatMessage({
                  id: 'password.label.confirm.validation',
                }),
              },
              {
                pattern: PASSWORD_REGEX,
                message: formatMessage({
                  id: 'login.password.validation.strength',
                }),
              },
            ]}
          >
            <Input
              type="password"
              placeholder={formatMessage({ id: 'login.common.placeholder' })}
            />
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default RegisterModal;
