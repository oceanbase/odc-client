import { actionTypes } from '@/component/Acess';
import { MenusType } from '@/d.ts';
import { ConnectionStore } from '@/store/connection';
import React from 'react';

export interface IMenuItemConfig {
  // 每一个菜单子项command的唯一标识符，最终用来触发对应的action
  key: string;
  // 主要用于文案“国际化”
  text: React.ReactNode;
  // 当前菜单项后面是否需要显示分割线
  hasDivider?: boolean;
  // 动态配置菜单子项的是否启用
  disabled?: (options: any) => boolean;
  // 动态配置菜单子项的显隐
  isHide?: (options: any) => boolean;
  actionType?: actionTypes;
  children: IMenuItemConfig[];
}

export interface IProps {
  type: MenusType;
  title: string;
  icon: any;
  disabled?: boolean;
  style?: any;
  onDoubleClick: () => void;
  onMenuClick: (e: any) => void;
  // 其他的可自定义的配置项, 如：子菜单项的显隐控制
  options?: IOptions;
  connectionStore?: ConnectionStore;
}

export interface IOptions {
  [key: string]: any;
}
