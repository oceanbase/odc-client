import { actionTypes } from '@/component/Acess';
import SessionStore from '@/store/sessionManager/session';
import React from 'react';
import { ResourceNodeType, TreeDataNode } from '../type';

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
  children?: IMenuItemConfig[];
  run?: (session: SessionStore, node: TreeDataNode) => void;
}

export interface IProps {
  type: ResourceNodeType;
  options?: IOptions;
  dbSession: SessionStore;
  node: TreeDataNode;
}

export interface IOptions {
  [key: string]: any;
}
