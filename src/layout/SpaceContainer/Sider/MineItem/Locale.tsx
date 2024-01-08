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

import { localeList } from '@/constant';
import odc from '@/plugins/odc';
import { defaultLocale, formatMessage } from '@/util/intl';
import { Menu } from 'antd';
import React from 'react';
import { getLocale, setLocale } from '@umijs/max';
import DropMenu from '../DropMenu';
import MenuItem from '../DropMenu/MenuItem';

interface IProps {}

const Locale: React.FC<IProps> = function () {
  const locale = getLocale();
  const localeObj =
    localeList.find((item) => item.value.toLowerCase() === locale?.toLowerCase()) ||
    localeList.find((item) => item.value?.toLowerCase() === defaultLocale?.toLowerCase());
  if (!odc.appConfig.locale.menu) {
    return null;
  }
  return (
    <DropMenu
      small
      menu={
        <Menu
          selectedKeys={[localeObj?.value]}
          items={localeList.map((item) => ({
            onClick: () => {
              if (localeObj?.value === item.value) {
                return;
              }
              window._forceRefresh = true;
              setLocale(item.value);
              window._forceRefresh = false;
            },
            key: item.value,
            label: item.label,
          }))}
        />
      }
    >
      <MenuItem>{formatMessage({ id: 'odc.Sider.MineItem.Locale.Language' }) /*语言*/}</MenuItem>
    </DropMenu>
  );
};

export default Locale;
