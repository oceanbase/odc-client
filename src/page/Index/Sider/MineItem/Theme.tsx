import { SettingStore } from '@/store/setting';
import { formatMessage } from '@/util/intl';
import { Menu } from 'antd';
import { inject, observer } from 'mobx-react';
import React from 'react';
import DropMenu from '../DropMenu';
import MenuItem from '../DropMenu/MenuItem';

interface IProps {
  settingStore?: SettingStore;
}

const ThemeBtn: React.FC<IProps> = function ({ settingStore }) {
  const currentTheme = settingStore.theme?.key;
  function onClick(key) {
    if (key != currentTheme) {
      settingStore.setTheme(key);
    }
  }
  return (
    <DropMenu
      small
      menu={
        <Menu selectedKeys={[currentTheme]}>
          <Menu.Item onClick={() => onClick('odc-white')} key="odc-white">
            {
              formatMessage({
                id: 'odc.component.ThemeBtn.DefaultTheme',
              })
              /*默认主题*/
            }
          </Menu.Item>
          <Menu.Item onClick={() => onClick('odc-dark')} key="odc-dark">
            {
              formatMessage({
                id: 'odc.component.ThemeBtn.DarkTheme',
              })
              /*暗黑主题*/
            }
          </Menu.Item>
        </Menu>
      }
    >
      <MenuItem>{formatMessage({ id: 'odc.Sider.MineItem.Theme.Theme' }) /*主题*/}</MenuItem>
    </DropMenu>
  );
};

export default inject('settingStore')(observer(ThemeBtn));
