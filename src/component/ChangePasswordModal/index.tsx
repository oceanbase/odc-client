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
import { PASSWORD_REGEX, SPACE_REGEX, PASSWORD_VALIDATE_MESSAGE } from '@/constant';
import { UserStore } from '@/store/login';
import { Form, Input, Modal } from 'antd';
import { FormInstance } from 'antd/lib/form';

interface IProps {
  confirmLoading: boolean;
  userStore?: UserStore;
  onSave: (
    values:
      | {
          currentPassword: string;
          newPassword: string;
        }
      | {
          password: string;
        },
  ) => void;
  visible: boolean;
  onCancel: () => void;
  title?: string;
  isExternal?: boolean; // 是否是外部场景（即：非站点header用户登录场景）
}

@inject('userStore')
@observer
class ChangePasswordModal extends Component<IProps> {
  private formRef = React.createRef<FormInstance>();

  public handleSubmit = async () => {
    try {
      const { isExternal } = this.props;
      const values = await this.formRef.current?.validateFields();
      if (!isExternal) {
        this.props.onSave({
          currentPassword: values.originPassword,
          newPassword: values.newPassword,
        });
      } else {
        this.props.onSave({
          password: values.newPassword,
        });
      }
    } catch (e) {}
  };

  public handleValidateConfirmPassword = async (rule: any, value: string, callback: any) => {
    if (!this.formRef.current) {
      return;
    }
    const { getFieldValue } = this.formRef.current;
    const newPassword = getFieldValue('newPassword');
    const valid = newPassword === value;
    if (!valid) {
      throw new Error();
    }
  };

  public clearValidateMessage = (name: string) => {
    this.formRef.current.setFields([
      {
        name: [name],
        errors: [],
      },
    ]);
  };

  public render() {
    const { visible, onCancel, confirmLoading, isExternal, title } = this.props;
    return (
      <Modal
        centered
        width={560}
        destroyOnClose
        title={
          title || formatMessage({ id: 'login.button.changePassword', defaultMessage: '修改密码' })
        }
        open={visible}
        onOk={this.handleSubmit}
        onCancel={onCancel}
        confirmLoading={confirmLoading}
      >
        <Form layout="vertical" hideRequiredMark colon={false} ref={this.formRef}>
          {!isExternal && (
            <Form.Item
              name="originPassword"
              label={formatMessage({ id: 'password.label.origin', defaultMessage: '原密码' })}
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'login.password.validation.required',
                    defaultMessage: '请输入密码',
                  }),
                },
              ]}
            >
              <Input.Password
                autoFocus
                placeholder={formatMessage({
                  id: 'login.common.placeholder',
                  defaultMessage: '请输入',
                })}
                autoComplete="new-password"
              />
            </Form.Item>
          )}

          <Form.Item noStyle shouldUpdate>
            {() => {
              return (
                <Form.Item
                  label={formatMessage({ id: 'password.label.new', defaultMessage: '新密码' })}
                  name="newPassword"
                  validateTrigger="onBlur"
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
                      message: PASSWORD_VALIDATE_MESSAGE,
                    },

                    {
                      pattern: SPACE_REGEX,
                      message: formatMessage({
                        id: 'odc.component.ChangePasswordModal.ThePasswordCannotContainSpaces',
                        defaultMessage: '密码不能包含空格',
                      }), //密码不能包含空格
                    },
                  ]}
                >
                  <Input.Password
                    placeholder={formatMessage({
                      id: 'login.common.placeholder',
                      defaultMessage: '请输入',
                    })}
                    onChange={() => {
                      this.clearValidateMessage('newPassword');
                    }}
                  />
                </Form.Item>
              );
            }}
          </Form.Item>
          <Form.Item
            label={formatMessage({ id: 'password.label.confirm1', defaultMessage: '确认密码' })}
            name="confirmPassword"
            validateTrigger="onBlur"
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
                  id: 'login.password.validation.strength',
                  defaultMessage: '密码强度不符合要求',
                }),
              },

              {
                validator: this.handleValidateConfirmPassword,
                message: formatMessage({
                  id: 'password.label.confirm.validation',
                  defaultMessage: '确认密码不一致',
                }),
              },
            ]}
          >
            <Input.Password
              placeholder={formatMessage({
                id: 'login.common.placeholder',
                defaultMessage: '请输入',
              })}
              onChange={() => {
                this.clearValidateMessage('confirmPassword');
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default ChangePasswordModal;
