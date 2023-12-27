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

import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { inject, observer } from 'mobx-react';
import { Component } from 'react';
// compatible
import ChangePasswordModal from '@/component/ChangePasswordModal';
import { IUser } from '@/d.ts';
import { UserStore } from '@/store/login';
import { formatMessage, getLocalImg } from '@/util/intl';
import { Alert, Button, Form, Input, message } from 'antd';
import RegisterModal from '../RegisterModal';
import styles from './index.less';

interface IProps {
  userStore?: UserStore;
  errMsg: string;
  onSubmit: (username: string, password: string) => void;
}

@inject('userStore')
@observer
class LoginModal extends Component<
  IProps,
  {
    showChangePasswordModal: boolean;
    showRegisterModal: boolean;
    registerLoading: boolean;
    changePasswordLoading: boolean;
  }
> {
  public readonly state = {
    showChangePasswordModal: false,
    showRegisterModal: false,
    registerLoading: false,
    changePasswordLoading: false,
  };

  public handleSubmit = (values) => {
    this.props.onSubmit(values.email, values.password);
  };

  public handleChangePassword = async (data: { currentPassword: string; newPassword: string }) => {
    const { userStore } = this.props;
    this.setState({ changePasswordLoading: true });
    const success = await userStore.changePassword(data);
    if (success) {
      this.setState({
        showChangePasswordModal: false,
      });
      message.success(formatMessage({ id: 'password.change.success' }));
    }
    this.setState({ changePasswordLoading: false });
  };

  public handleRegister = async (user: Partial<IUser>) => {
    const { userStore } = this.props;
    this.setState({ registerLoading: true });
    const success = await userStore.createUser(user);
    if (success) {
      this.setState({
        showRegisterModal: false,
      });
      message.success(formatMessage({ id: 'register.success' }));
    }
    this.setState({ registerLoading: false });
  };

  public render() {
    const { errMsg } = this.props;
    const {
      showChangePasswordModal,
      showRegisterModal,
      registerLoading,
      changePasswordLoading,
    } = this.state;

    return (
      <Form onFinish={this.handleSubmit} className={styles.form} name="loginForm">
        <div className={styles.titleContainer}>
          <div className={styles.title}>
            <img src={getLocalImg('login_logo.png')} />
          </div>
          <div className={styles.subTitle}>{formatMessage({ id: 'login.subTitle' })}</div>
        </div>
        {errMsg && (
          <Alert
            style={{ marginBottom: 8 }}
            message={errMsg || formatMessage({ id: 'login.error' })}
            type="error"
            showIcon={true}
          />
        )}
        <Form.Item
          name="email"
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'login.username.validation.required',
              }),
            },
          ]}
        >
          <Input
            style={{
              height: 40,
            }}
            prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            placeholder={formatMessage({ id: 'login.username.placeholder' })}
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'login.password.validation.required',
              }),
            },
          ]}
        >
          <Input
            style={{
              height: 40,
            }}
            prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            type="password"
            placeholder={formatMessage({ id: 'login.password.placeholder' })}
            autoComplete="new-password"
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className={styles.submitButton}>
            {formatMessage({ id: 'login.button' })}
          </Button>
        </Form.Item>
        <div className={styles.bottomButtons}>
          <a
            className={styles.bottomButton}
            onClick={() => this.setState({ showChangePasswordModal: true })}
          >
            {formatMessage({ id: 'login.button.changePassword' })}
          </a>
          <span className={styles.divider} />
          <a
            className={styles.bottomButton}
            onClick={() => this.setState({ showRegisterModal: true })}
          >
            {formatMessage({ id: 'login.button.register' })}
          </a>
        </div>
        <ChangePasswordModal
          visible={showChangePasswordModal}
          onSave={this.handleChangePassword}
          onCancel={() => this.setState({ showChangePasswordModal: false })}
          confirmLoading={changePasswordLoading}
        />
        <RegisterModal
          visible={showRegisterModal}
          onSave={this.handleRegister}
          onCancel={() => this.setState({ showRegisterModal: false })}
          confirmLoading={registerLoading}
        />
      </Form>
    );
  }
}

export default LoginModal;
