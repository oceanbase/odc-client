import { localeList } from '@/constant';
import appConfig from '@/constant/appConfig';
import { defaultLocale, formatMessage } from '@/util/intl';
import { Menu } from 'antd';
import React from 'react';
import { getLocale, setLocale } from 'umi';
import DropMenu from '../DropMenu';
import MenuItem from '../DropMenu/MenuItem';

interface IProps {}

const Locale: React.FC<IProps> = function () {
  const locale = getLocale();
  const localeObj =
    localeList.find((item) => item.value.toLowerCase() === locale?.toLowerCase()) ||
    localeList.find((item) => item.value?.toLowerCase() === defaultLocale?.toLowerCase());
  if (!appConfig.locale.menu) {
    return null;
  }
  return (
    <DropMenu
      small
      menu={
        <Menu selectedKeys={[localeObj?.value]}>
          {localeList.map((item) => (
            <Menu.Item
              onClick={() => {
                if (localeObj?.value === item.value) {
                  return;
                }
                window._forceRefresh = true;
                setLocale(item.value);
                window._forceRefresh = false;
              }}
              key={item.value}
            >
              {item.label}
            </Menu.Item>
          ))}
        </Menu>
      }
    >
      <MenuItem>{formatMessage({ id: 'odc.Sider.MineItem.Locale.Language' }) /*语言*/}</MenuItem>
    </DropMenu>
  );
};

export default Locale;
