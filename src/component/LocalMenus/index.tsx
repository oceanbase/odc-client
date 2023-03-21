import DropdownMenu from '@/component/DropdownMenu';
import { localeList } from '@/constant';
import { defaultLocale } from '@/util/intl';
import { GlobalOutlined } from '@ant-design/icons';
import { Menu, Space } from 'antd';
import React from 'react';
import { getLocale, setLocale } from 'umi';

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
