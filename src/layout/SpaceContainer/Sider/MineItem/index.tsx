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
import tracert from '@/util/tracert';
import { ItemType } from 'antd/es/menu/hooks/useItems';

interface IProps {
  userStore?: UserStore;
  settingStore?: SettingStore;
  modalStore?: ModalStore;
}

const MineItem: React.FC<IProps> = function ({ children, userStore, settingStore, modalStore }) {
  const { user } = userStore;
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [changeLockPwdModalVisible, setChangeLockPwdModalVisible] = useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const recordRef = useRef<RecordRef>();
  const havePasswordLogin = !!settingStore.serverSystemInfo?.passwordLoginEnabled;
  const showUserInfo = !isClient();
  const allowEditUser = !haveOCP() && showUserInfo;
  const RoleNames = user?.roles?.length
    ? user?.roles
        ?.filter((item) => item.enabled)
        ?.map((role) => role.name)
        ?.join(' | ')
    : '-';
  const userName = `${user?.name}(${user?.accountName})`;

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
    setChangePasswordLoading(false);
  };

  const handleLogout = async () => {
    try {
      await userStore.logout();
      message.success(formatMessage({ id: 'login.logout.success' }));
      // 专有云 - 重新获取登录定向地址
      userStore.gotoLogoutPage();
    } catch (e) {}
  };
  function getMenu() {
    let menu: ItemType[] = [];
    if (showUserInfo) {
      menu = menu.concat([
        {
          label: (
            <Tooltip placement="right" title={userName}>
              <span className={styles.userName}>{userName}</span>
            </Tooltip>
          ),

          key: 'username',
        },
        {
          key: 'user-role',
          label: (
            <Tooltip placement="right" title={RoleNames}>
              <span className={styles.userRoles}>
                {formatMessage({
                  id: 'src.layout.SpaceContainer.Sider.MineItem.642BE38F' /*角色：*/,
                })}
                {RoleNames}
              </span>
            </Tooltip>
          ),
        },
        {
          type: 'divider',
        },
      ]);
    }
    if (allowEditUser && havePasswordLogin) {
      menu.push({
        key: 'change-password',
        label: formatMessage({
          id: 'odc.component.GlobalHeader.ChangePassword',
        }),
        onClick: () => {
          setChangePasswordModalVisible(true);
        },
      });
    }

    if (isClient()) {
      menu.push({
        key: 'change-lock-password',
        label: formatMessage({
          id: 'odc.component.LoginMenus.ApplicationPassword',
        }),
        onClick: () => {
          setChangeLockPwdModalVisible(true);
        },
      });
    }

    if (settingStore.enablePersonalRecord) {
      menu.push({
        key: 'record',
        label: formatMessage({
          id: 'odc.Sider.MineItem.OperationRecord',
        }),
        onClick: () => {
          tracert.click('a3112.b46782.c330850.d367366');
          recordRef.current?.handleOpenDrawer();
        },
      });
    }
    menu.push({
      type: 'divider',
    });
    if (allowEditUser) {
      menu.push({
        key: 'exit',
        label: formatMessage({
          id: 'odc.Sider.MineItem.Exit',
        }),
        onClick: handleLogout,
      });
    }
    return menu;
  }

  return (
    <>
      <DropMenu
        onOpenChange={(v) => {
          if (v) {
            tracert.expo('a3112.b46782.c330850');
          }
        }}
        menu={
          <Menu
            selectedKeys={null}
            key="user"
            className={!isClient() ? styles.userMenu : ''}
            items={getMenu()}
          />
        }
      >
        {children}
      </DropMenu>

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
