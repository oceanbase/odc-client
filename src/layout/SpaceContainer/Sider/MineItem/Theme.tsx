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

import { EThemeConfigKey, SettingStore } from '@/store/setting';
import { formatMessage } from '@/util/intl';
import { Menu } from 'antd';
import { inject, observer } from 'mobx-react';
import React from 'react';
import DropMenu from '../DropMenu';

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
        <Menu
          selectedKeys={[currentTheme]}
          items={[
            {
              onClick: () => {
                onClick(EThemeConfigKey.ODC_WHITE);
              },
              key: EThemeConfigKey.ODC_WHITE,
              label: formatMessage({
                id: 'odc.component.ThemeBtn.DefaultTheme',
              }),
            },
            {
              onClick: () => {
                onClick(EThemeConfigKey.ODC_DARK);
              },
              key: EThemeConfigKey.ODC_DARK,
              label: formatMessage({
                id: 'odc.component.ThemeBtn.DarkTheme',
              }),
            },
          ]}
        />
      }
    >
      <div>{formatMessage({ id: 'odc.Sider.MineItem.Theme.Theme' }) /*主题*/}</div>
    </DropMenu>
  );
};

export default inject('settingStore')(observer(ThemeBtn));
