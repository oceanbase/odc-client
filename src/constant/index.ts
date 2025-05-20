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
import { FolderOpenFilled } from '@ant-design/icons';

import { ColumnShowType, DbObjectType } from '@/d.ts'; // @ts-ignore

import { formatMessage } from '@/util/intl';

import { ReactComponent as binarySvg } from '@/svgr/Field-Binary.svg'; // @ts-ignore

import { ReactComponent as numberSvg } from '@/svgr/Field-number.svg'; // @ts-ignore

import { ReactComponent as stringSvg } from '@/svgr/Field-String.svg'; // @ts-ignore

import { ReactComponent as TableOutlined } from '@/svgr/menuTable.svg';

import { ReactComponent as FunctionSvg } from '@/svgr/menuFunc.svg'; // @ts-ignore

import { ReactComponent as ViewSvg } from '@/svgr/menuView.svg'; // @ts-ignore

import { ReactComponent as ProcedureSvg } from '@/svgr/menuProcedure.svg'; // @ts-ignore

import { ReactComponent as SequenceSvg } from '@/svgr/menuSequence.svg'; // @ts-ignore

import { ReactComponent as PackageSvg } from '@/svgr/menuPkg.svg'; // @ts-ignore

import { ReactComponent as SynonymSvg } from '@/svgr/menuSynonym.svg'; // @ts-ignore

import { ReactComponent as TriggerSvg } from '@/svgr/menuTrigger.svg'; // @ts-ignore

import { ReactComponent as FileSvg } from '@/svgr/File.svg'; // @ts-ignore

import { ReactComponent as TypeSvg } from '@/svgr/menuType.svg';

import { ReactComponent as EnumSvg } from '@/svgr/Enum.svg'; // 枚举类型 icon

import { ReactComponent as SetSvg } from '@/svgr/Set.svg'; // 集合类型 icon

import { ReactComponent as timeSvg } from '@/svgr/Field-time.svg'; // 同步 OCP 等保三密码强度要求

export const PASSWORD_REGEX =
  /^(?:(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])|(?=.*[0-9])(?=.*[A-Z])(?=.*[^A-Za-z0-9])|(?=.*[0-9])(?=.*[a-z])(?=.*[^A-Za-z0-9])|(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9]))[A-Za-z0-9!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]{8,32}$/;

export const PASSWORD_VALIDATE_MESSAGE = formatMessage({
  id: 'src.constant.59F82FE0',
  defaultMessage:
    '密码为长度 8~32 位, 包含以下四种类型字符至少三种及以上：数字（0~9）、大写字母（A~Z）、小写字母(a~z)、特殊符号：全部的英文特殊字符',
});

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
  [ColumnShowType.ENUM]: EnumSvg,
  [ColumnShowType.SET]: SetSvg,
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
    label: formatMessage({ id: 'odc.src.constant.SimplifiedChinese', defaultMessage: '简体中文' }), //简体中文
    value: 'zh-CN',
  },
  {
    label: formatMessage({ id: 'odc.src.constant.TraditionalChinese', defaultMessage: '繁体中文' }), //繁体中文
    value: 'zh-TW',
  },
];

// 连接目前支持的颜色集

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
  [DbObjectType.column]: FolderOpenFilled,
  [DbObjectType.external_table]: TableOutlined,
  [DbObjectType.materialized_view]: ViewSvg,
};
/**
 * lineBackground: src/page/Workspace/components/SessionContextWrap/SessionSelect/index.tsx 中使用的背景，使用场景较为特殊，单独区分出来。
 */
export const EnvColorMap: Record<
  string,
  {
    textColor: string;
    background: string;
    tipColor: string;
    lineBackground: string;
    borderColor: string;
  }
> = {
  GRAY: {
    textColor: 'var(--text-color-secondary)',
    background: 'var(--hover-color)',
    tipColor: 'transparent',
    lineBackground: 'transparent',
    borderColor: 'var(--text-color-primary)',
  },
  GREEN: {
    textColor: 'var(--function-green6-color)',
    background: 'var(--function-green1-color)',
    lineBackground: 'var(--function-green1-color)',
    tipColor: 'var(--function-green6-color)',
    borderColor: 'var(--function-green6-color)',
  },
  ORANGE: {
    textColor: 'var(--function-gold6-color)',
    background: 'var(--function-gold1-color)',
    tipColor: 'var(--function-gold6-color)',
    lineBackground: 'var(--function-gold1-color)',
    borderColor: 'var(--function-gold6-color)',
  },
  RED: {
    textColor: 'var(--function-red6-color)',
    background: 'var(--function-red1-color)',
    tipColor: 'var(--function-red6-color)',
    lineBackground: 'var(--function-red1-color)',
    borderColor: 'var(--function-red6-color)',
  },
  BLUE: {
    textColor: 'var(--odc-color1-color)',
    background: 'var(--odc-color1-bgcolor)',
    tipColor: 'var(--odc-color1-color)',
    lineBackground: 'var(--odc-color1-bgcolor)',
    borderColor: 'var(--odc-color1-color)',
  },
  CYAN: {
    textColor: 'var(--odc-color2-color)',
    background: 'var(--odc-color2-bgcolor)',
    tipColor: 'var(--odc-color2-color)',
    lineBackground: 'var(--odc-color2-bgcolor)',
    borderColor: 'var(--odc-color2-color)',
  },
  GEEKBLUE: {
    textColor: 'var(--odc-color3-color)',
    background: 'var(--odc-color3-bgcolor)',
    tipColor: 'var(--odc-color3-color)',
    lineBackground: 'var(--odc-color3-bgcolor)',
    borderColor: 'var(--odc-color3-color)',
  },
  MAGENTA: {
    textColor: 'var(--odc-color4-color)',
    background: 'var(--odc-color4-bgcolor)',
    tipColor: 'var(--odc-color4-color)',
    lineBackground: 'var(--odc-color4-bgcolor)',
    borderColor: 'var(--odc-color4-color)',
  },
  PURPLE: {
    textColor: 'var(--odc-color5-color)',
    background: 'var(--odc-color5-bgcolor)',
    tipColor: 'var(--odc-color5-color)',
    lineBackground: 'var(--odc-color5-bgcolor)',
    borderColor: 'var(--odc-color5-color)',
  },
};

export enum PartitionBound {
  PARTITION_UPPER_BOUND = 'PARTITION_UPPER_BOUND',
  PARTITION_LOWER_BOUND = 'PARTITION_LOWER_BOUND',
}

export const taskSuccessHintInfo = {
  terminate: formatMessage({
    id: 'odc.components.TaskManagePage.TerminatedSuccessfully',
    defaultMessage: '终止成功',
  }),
  delete: formatMessage({
    id: 'src.component.Task.component.ActionBar.9EDD0936',
    defaultMessage: '删除成功',
  }),
  retry: formatMessage({
    id: 'odc.TaskManagePage.component.TaskTools.InitiatedAgain',
    defaultMessage: '再次发起成功',
  }),
  again: formatMessage({
    id: 'src.component.Task.component.ActionBar.15961986',
    defaultMessage: '发起重试成功',
  }),
  start: formatMessage({
    id: 'src.component.Task.component.ActionBar.10A4FEFD',
    defaultMessage: '开始执行',
  }),
};
