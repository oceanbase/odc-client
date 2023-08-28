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
import ChangeLockPwd from '@/component/LoginMenus/ChangeLockPwdModal';
import UserConfig from '@/component/LoginMenus/UserConfig';
import RecordPopover, { RecordRef } from '@/component/RecordPopover/index2';
import { UserStore } from '@/store/login';
import { SettingStore } from '@/store/setting';
import { haveOCP, isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { Menu, message, Tooltip } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useRef, useState } from 'react';
import DropMenu from '../DropMenu';

import { ModalStore } from '@/store/modal';
import styles from './index.less';
import Locale from './Locale';
import Theme from './Theme';
import tracert from '@/util/tracert';

interface IProps {
  userStore?: UserStore;
  settingStore?: SettingStore;
  modalStore?: ModalStore;
  enableTheme?: boolean;
}

const MineItem: React.FC<IProps> = function ({
  children,
  userStore,
  settingStore,
  modalStore,
  enableTheme,
}) {
  const { user } = userStore;
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [changeLockPwdModalVisible, setChangeLockPwdModalVisible] = useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const recordRef = useRef<RecordRef>();
  const havePasswordLogin = !!settingStore.serverSystemInfo?.passwordLoginEnabled;
  const hasUserInfo = !haveOCP() && !isClient();
  const RoleNames = user?.roles?.length
    ? user?.roles
        ?.filter((item) => item.enabled)
        ?.map((role) => role.name)
        ?.join(' | ')
    : '-';
  const userName = `${user?.name}(${user?.accountName})`;

  function onConfigClick() {
    tracert.click('a3112.b46782.c330850.d367365');
    modalStore.changeUserConfigModal(true);
  }

  const onChangePassword = async (data: { currentPassword: string; newPassword: string }) => {
    setChangePasswordLoading(true);

    const success = await userStore.changePassword(data);
    if (success) {
      setChangePasswordModalVisible(false);
      message.success(
        formatMessage({
          id: 'password.change.success',
        }),
      );
    }
    setChangePasswordLoading(true);
  };

  const handleLogout = async () => {
    try {
      await userStore.logout();
      message.success(formatMessage({ id: 'login.logout.success' }));
      // 专有云 - 重新获取登录定向地址
      userStore.gotoLogoutPage();
    } catch (e) {}
  };

  return (
    <>
      <DropMenu
        onOpenChange={(v) => {
          if (v) {
            tracert.expo('a3112.b46782.c330850');
          }
        }}
        menu={
          <Menu selectedKeys={null} key="user" className={!isClient() ? styles.userMenu : ''}>
            {hasUserInfo && (
              <>
                <Menu.Item key={'username'}>
                  <Tooltip placement="right" title={userName}>
                    <span className={styles.userName}>{userName}</span>
                  </Tooltip>
                </Menu.Item>
                <Menu.Item key={'user-role'}>
                  <Tooltip placement="right" title={RoleNames}>
                    <span className={styles.userRoles}>{RoleNames}</span>
                  </Tooltip>
                </Menu.Item>
                <Menu.Divider />
              </>
            )}

            {hasUserInfo && havePasswordLogin ? (
              <Menu.Item
                onClick={() => {
                  setChangePasswordModalVisible(true);
                }}
              >
                {
                  formatMessage({
                    id: 'odc.component.GlobalHeader.ChangePassword',
                  })
                  /* 修改密码 */
                }
              </Menu.Item>
            ) : null}
            {isClient() ? (
              <Menu.Item
                onClick={() => {
                  setChangeLockPwdModalVisible(true);
                }}
              >
                {
                  formatMessage({
                    id: 'odc.component.LoginMenus.ApplicationPassword',
                  })
                  /* 应用密码 */
                }
              </Menu.Item>
            ) : null}
            <Locale />
            {enableTheme ? <Theme /> : null}
            <Menu.Item key={'config'} onClick={onConfigClick}>
              {
                formatMessage({
                  id: 'odc.Sider.MineItem.Preferences',
                }) /*偏好设置*/
              }
            </Menu.Item>
            {settingStore.enablePersonalRecord && (
              <Menu.Item
                onClick={() => {
                  tracert.click('a3112.b46782.c330850.d367366');
                  recordRef.current?.handleOpenDrawer();
                }}
                key={'record'}
              >
                {
                  formatMessage({
                    id: 'odc.Sider.MineItem.OperationRecord',
                  }) /*操作记录*/
                }
              </Menu.Item>
            )}

            <Menu.Divider />
            {hasUserInfo && (
              <Menu.Item onClick={handleLogout} key={'exit'}>
                {formatMessage({ id: 'odc.Sider.MineItem.Exit' }) /*退出*/}
              </Menu.Item>
            )}
          </Menu>
        }
      >
        {children}
      </DropMenu>
      <UserConfig
        visible={modalStore?.userConfigModalVisible}
        onCloseModal={() => {
          modalStore.changeUserConfigModal(false);
        }}
      />

      {!isClient() && havePasswordLogin ? (
        <ChangePasswordModal
          visible={changePasswordModalVisible}
          onCancel={() => {
            setChangePasswordModalVisible(false);
          }}
          onSave={onChangePassword}
          confirmLoading={changePasswordLoading}
        />
      ) : null}
      {isClient() ? (
        <ChangeLockPwd
          visible={changeLockPwdModalVisible}
          onCloseModal={() => {
            setChangeLockPwdModalVisible(false);
          }}
        />
      ) : null}
      {settingStore.enablePersonalRecord && <RecordPopover ref={recordRef} />}
    </>
  );
};

export default inject('userStore', 'settingStore', 'modalStore')(observer(MineItem));
