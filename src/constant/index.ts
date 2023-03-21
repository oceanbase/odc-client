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

export const PASSWORD_REGEX =
  /^(?=(.*[a-z]){2,})(?=(.*[A-Z]){2,})(?=(.*\d){2,})(?=(.*[ !"#\$%&'\(\)\*\+,-\./:;<=>\?@\[\\\]\^_`\{\|\}~]){2,})[A-Za-z\d !"#\$%&'\(\)\*\+,-\./:;<=>\?@\[\\\]\^_`\{\|\}~]{8,32}$/; // 工作区头部高度

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

export const labelColorsMap = {
  color1: {
    bgColor: 'var(--odc-color1-bgcolor)',
    color: 'var(--odc-color1-color)',
  },
  color2: {
    bgColor: 'var(--odc-color2-bgcolor)',
    color: 'var(--odc-color2-color)',
  },
  color3: {
    bgColor: 'var(--odc-color3-bgcolor)',
    color: 'var(--odc-color3-color)',
  },
  color4: {
    bgColor: 'var(--odc-color4-bgcolor)',
    color: 'var(--odc-color4-color)',
  },
  color5: {
    bgColor: 'var(--odc-color5-bgcolor)',
    color: 'var(--odc-color5-color)',
  },
};

export const tabExpiredTime = 48 * 3600 * 1000;

/**
 * v2版本升级中，部分高频次使用的字段名称变更，为了降低该场景导致的前端code需要做大量同步调整，采用常量的方式进行迭代维护，明细如下：
 * 说明：如下字段，V2版本在后端均已废弃，对应V2版本字段见Map => [v1_key, v2_key]
 * */
export const Revise_Field_Map_V1_To_V2 = new Map([
  ['sid', 'id'],
  ['sessionName', 'name'],
  ['dbMode', 'dialectType'],
  ['defaultDBName', 'defaultSchema'],
  ['copyFromSid', 'copyFromId'],
  ['dbUser', 'username'],
  ['sysUser', 'sysTenantUsername'],
  ['sysUserPassword', 'sysTenantPassword'],
]);

// 管控台-权限功能开关
export const EnablePermission = true;

// 管控台-角色管理-系统权限入口
export const EnableRoleSystemPermission = true;

// 导入导出-保存账号信息至连接属性开关
export const EnableOverwriteSysConfig = false;

// 公共连接入口开关，当前场景：Web端开放，桌面端关闭
export const EnabledPublicConnection = !isClient();

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
