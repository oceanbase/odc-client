import { SettingStore } from '@/store/setting';
import { formatMessage } from '@/util/intl';
import { Menu } from 'antd';
import { inject, observer } from 'mobx-react';
import React from 'react';
import DropdownMenu from '../DropdownMenu';

interface IProps {
  settingStore?: SettingStore;
}

const ThemeBtn: React.FC<IProps> = function ({ settingStore }) {
  const currentTheme = settingStore.theme?.key;
  return (
    <DropdownMenu
      overlay={
        <Menu
          selectedKeys={[currentTheme]}
          onClick={({ key }) => {
            if (key != currentTheme) {
              settingStore.setTheme(key);
            }
          }}
        >
          <Menu.Item key="odc-white">
            {
              formatMessage({
                id: 'odc.component.ThemeBtn.DefaultTheme',
              }) /*默认主题*/
            }
          </Menu.Item>
          <Menu.Item key="odc-dark">
            {
              formatMessage({
                id: 'odc.component.ThemeBtn.DarkTheme',
              }) /*暗黑主题*/
            }
          </Menu.Item>
        </Menu>
      }
    >
      {formatMessage({ id: 'odc.component.ThemeBtn.Theme' }) /*主题*/}
    </DropdownMenu>
  );
};

export default inject('settingStore')(observer(ThemeBtn));
