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

import { ColumnShowType, DbObjectType } from '@/d.ts'; // @ts-ignore
import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';

import binarySvg from '@/svgr/Field-Binary.svg'; // @ts-ignore

import numberSvg from '@/svgr/Field-number.svg'; // @ts-ignore

import stringSvg from '@/svgr/Field-String.svg'; // @ts-ignore

import TableOutlined from '@/svgr/menuTable.svg';

import FunctionSvg from '@/svgr/menuFunc.svg'; // @ts-ignore

import ViewSvg from '@/svgr/menuView.svg'; // @ts-ignore

import ProcedureSvg from '@/svgr/menuProcedure.svg'; // @ts-ignore

import SequenceSvg from '@/svgr/menuSequence.svg'; // @ts-ignore

import PackageSvg from '@/svgr/menuPkg.svg'; // @ts-ignore

import SynonymSvg from '@/svgr/menuSynonym.svg'; // @ts-ignore

import TriggerSvg from '@/svgr/menuTrigger.svg'; // @ts-ignore

import FileSvg from '@/svgr/File.svg'; // @ts-ignore

import TypeSvg from '@/svgr/menuType.svg';

import timeSvg from '@/svgr/Field-time.svg'; // 同步 OCP 等保三密码强度要求

export const PASSWORD_REGEX = /^(?=(.*[a-z]){2,})(?=(.*[A-Z]){2,})(?=(.*\d){2,})(?=(.*[ !"#\$%&'\(\)\*\+,-\./:;<=>\?@\[\\\]\^_`\{\|\}~]){2,})[A-Za-z\d !"#\$%&'\(\)\*\+,-\./:;<=>\?@\[\\\]\^_`\{\|\}~]{8,32}$/; // 工作区头部高度

export const SPACE_REGEX = /^[^\s]+$/;

export const WORKSPACE_HEADER_HEIGHT = 48; // Tab 头

export const TAB_HEADER_HEIGHT = 28; // 表格上方工具栏高度

export const TABLE_TOOLBAR_HEIGHT = 38; // SQL toolbar 高度

export const EDITOR_TOOLBAR_HEIGHT = 38; // 表格行高

export const TABLE_ROW_HEIGHT = 24; // 表格底部高度（分页器）

export const TABLE_FOOTER_HEIGHT = 40; // 固定结果集展示提醒

export const SQL_PAGE_RESULT_HEIGHT = 250;

export const LOCK_RESULT_SET_COOKIE_KEY = 'LOCK_RESULT_SET_COOKIE'; // TODO: 布尔值图标

export const fieldIconMap = {
  [ColumnShowType.BOOLEAN]: binarySvg,
  [ColumnShowType.NUMERIC]: numberSvg,
  [ColumnShowType.TEXT]: stringSvg,
  [ColumnShowType.OBJECT]: binarySvg,
  [ColumnShowType.DATE]: timeSvg,
  [ColumnShowType.DATETIME]: timeSvg,
  [ColumnShowType.TIME]: timeSvg,
  [ColumnShowType.TIMESTAMP]: timeSvg,
  [ColumnShowType.YEAR]: timeSvg,
};
/**
 * 程序包调试开关
 */

export const enablePackageDebug = true;
export const enableTypeEdit = false;
export const localeList = [
  {
    label: 'English',
    value: 'en-US',
  },
  {
    label: formatMessage({ id: 'odc.src.constant.SimplifiedChinese' }), //简体中文
    value: 'zh-CN',
  },
  {
    label: formatMessage({ id: 'odc.src.constant.TraditionalChinese' }), //繁体中文
    value: 'zh-TW',
  },
]; // 连接目前支持的颜色集

// 管控台-角色管理-系统权限入口
export const EnableRoleSystemPermission = true;

// 导入导出-保存账号信息至连接属性开关
export const EnableOverwriteSysConfig = false;

export const DbObjsIcon = {
  [DbObjectType.table]: TableOutlined,
  [DbObjectType.view]: ViewSvg,
  [DbObjectType.function]: FunctionSvg,
  [DbObjectType.procedure]: ProcedureSvg,
  [DbObjectType.trigger]: TriggerSvg,
  [DbObjectType.package]: PackageSvg,
  [DbObjectType.package_body]: PackageSvg,
  [DbObjectType.sequence]: SequenceSvg,
  [DbObjectType.type]: TypeSvg,
  [DbObjectType.synonym]: SynonymSvg,
  [DbObjectType.public_synonym]: SynonymSvg,
  [DbObjectType.file]: FileSvg,
};

export const EnvColorMap = {
  GREEN: {
    textColor: 'var(--function-green6-color)',
    background: 'var(--function-green1-color)',
  },
  GRAY: {
    textColor: 'var(--text-color-secondary)',
    background: 'var(--neutral-grey1-color)',
  },
  RED: {
    textColor: 'var(--function-red6-color)',
    background: 'var(--function-red1-color)',
  },
  ORANGE: {
    textColor: 'var(--function-gold6-color)',
    background: 'var(--function-gold1-color)',
  },
};
