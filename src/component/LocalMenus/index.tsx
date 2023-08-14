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

import DropdownMenu from '@/component/DropdownMenu';
import { localeList } from '@/constant';
import { defaultLocale } from '@/util/intl';
import { GlobalOutlined } from '@ant-design/icons';
import { Menu, Space } from 'antd';
import React from 'react';
import { getLocale, setLocale } from '@umijs/max';

interface IProos {
  showIcon?: boolean;
  className?: string;
}

const LocalMenus: React.FC<IProos> = (props) => {
  const { showIcon, className } = props;
  const locale = getLocale();
  const localeObj =
    localeList.find((item) => item.value.toLowerCase() === locale?.toLowerCase()) ||
    localeList.find((item) => item.value?.toLowerCase() === defaultLocale?.toLowerCase());
  const localeMenu = (
    <Menu
      onClick={({ key }) => {
        window._forceRefresh = true;
        setLocale(key as string);
        window._forceRefresh = false;
      }}
    >
      {localeList.map((item) => (
        <Menu.Item key={item.value}>{item.label}</Menu.Item>
      ))}
    </Menu>
  );
  return (
    <DropdownMenu overlay={localeMenu} className={className}>
      <Space>
        {showIcon ? <GlobalOutlined /> : null}
        <span>{localeObj?.label}</span>
      </Space>
    </DropdownMenu>
  );
};

export default LocalMenus;
