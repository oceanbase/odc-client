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

import ChangePasswordModal from '@/component/ChangePasswordModal';
import DropdownMenu from '@/component/DropdownMenu';
import { IUser } from '@/d.ts';
import type { UserStore } from '@/store/login';
import type { ModalStore } from '@/store/modal';
import { SettingStore } from '@/store/setting';
import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { Divider, Menu, message, Tooltip } from 'antd';
import { inject, observer } from 'mobx-react';
import React from 'react';
import ChangeLockPwdModal from './ChangeLockPwdModal';
import styles from './index.less';
import UserConfig from './UserConfig';

interface IProps {
  userStore?: UserStore;
  settingStore?: SettingStore;
  modalStore?: ModalStore;
}

interface IState {
  changePasswordModalVisible: boolean;
  changeLockPwdModalVisible: boolean;
  changePasswordLoading: boolean;
}

@inject('userStore', 'settingStore', 'modalStore')
@observer
class LoginMenus extends React.PureComponent<IProps, IState> {
  public readonly state = {
    changePasswordModalVisible: false,
    changeLockPwdModalVisible: false,
    changePasswordLoading: false,
  };

  public handleLogout = async () => {
    const { userStore } = this.props;
    try {
      await userStore.logout();
      message.success(formatMessage({ id: 'login.logout.success' }));
      // 专有云 - 重新获取登录定向地址
      userStore.gotoLogoutPage();
    } catch (e) {}
  };

  public onChangePassword = async (data: { currentPassword: string; newPassword: string }) => {
    const { userStore } = this.props;
    this.setState({
      changePasswordLoading: true,
    });

    const success = await userStore.changePassword(data);
    if (success) {
      this.handleChangeModalState('changePasswordModalVisible');
      message.success(
        formatMessage({
          id: 'password.change.success',
        }),
      );
    }

    this.setState({
      changePasswordLoading: false,
    });
  };

  private handleChangeModalState = (type: keyof IState, visible?: boolean) => {
    this.setState({
      [type]: visible || false,
    } as Pick<IState, keyof IState>);
  };

  private getMenu = (user: Partial<IUser>) => {
    const isThridPartyLogin = !!this.props.settingStore.serverSystemInfo?.ssoLoginEnabled;
    const RoleNames = user?.roles?.length
      ? user?.roles
          ?.filter((item) => item.enabled)
          ?.map((role) => role.name)
          ?.join(' | ')
      : '-';
    const userName = `${user?.name}(${user?.accountName})`;
    return (
      <Menu className={!isClient() ? styles.userMenu : ''}>
        {!isClient() && (
          <>
            <Menu.Item className={styles.userName}>
              <Tooltip title={userName}>{userName}</Tooltip>
            </Menu.Item>
            <Menu.Item className={styles.userRoles}>
              <Tooltip title={RoleNames}>{RoleNames}</Tooltip>
            </Menu.Item>
            <Divider />
          </>
        )}
        <Menu.Item
          onClick={() => {
            this.props.modalStore.changeUserConfigModal(true);
          }}
        >
          {
            formatMessage({
              id: 'odc.component.LoginMenus.PersonalSettings',
            }) /* 个人设置 */
          }
        </Menu.Item>
        {!isClient() && !isThridPartyLogin ? (
          <Menu.Item
            onClick={() => {
              this.handleChangeModalState('changePasswordModalVisible', true);
            }}
          >
            {
              formatMessage({
                id: 'odc.component.GlobalHeader.ChangePassword',
              }) /* 修改密码 */
            }
          </Menu.Item>
        ) : null}
        {isClient() ? (
          <Menu.Item
            onClick={() => {
              this.handleChangeModalState('changeLockPwdModalVisible', true);
            }}
          >
            {
              formatMessage({
                id: 'odc.component.LoginMenus.ApplicationPassword',
              }) /* 应用密码 */
            }
          </Menu.Item>
        ) : null}
        {!isClient() ? (
          <Menu.Item onClick={this.handleLogout}>
            {
              formatMessage({
                id: 'odc.component.GlobalHeader.LogOut',
              }) /* 退出登录 */
            }
          </Menu.Item>
        ) : null}
      </Menu>
    );
  };

  render() {
    const {
      userStore: { user },
      settingStore,
      modalStore,
    } = this.props;
    const { changePasswordModalVisible, changeLockPwdModalVisible, changePasswordLoading } =
      this.state;
    const isThridPartyLogin = !!settingStore.serverSystemInfo?.ssoLoginEnabled;
    return (
      <>
        <DropdownMenu overlay={this.getMenu(user)}>
          {
            !isClient()
              ? user?.accountName
              : formatMessage({ id: 'odc.component.LoginMenus.Account' }) // 账户
          }
        </DropdownMenu>
        <UserConfig
          visible={modalStore.userConfigModalVisible}
          onCloseModal={() => {
            modalStore.changeUserConfigModal(false);
          }}
        />

        {!isClient() && !isThridPartyLogin ? (
          <ChangePasswordModal
            visible={changePasswordModalVisible}
            onCancel={() => {
              this.handleChangeModalState('changePasswordModalVisible');
            }}
            onSave={this.onChangePassword}
            confirmLoading={changePasswordLoading}
          />
        ) : null}
        {isClient() ? (
          <ChangeLockPwdModal
            visible={changeLockPwdModalVisible}
            onCloseModal={() => {
              this.handleChangeModalState('changeLockPwdModalVisible');
            }}
          />
        ) : null}
      </>
    );
  }
}

export default LoginMenus;
