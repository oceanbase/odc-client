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

import {
  ConnectType,
  DbObjectType,
  DragInsertType,
  SchemaComparingResult,
  SQLLintMode,
  SQLSessionMode,
} from '@/d.ts';
import { DBType, BooleanOptionType } from '@/d.ts/database';
import { ColumnStoreType } from '@/d.ts/table';
import { formatMessage } from '@/util/intl';

export const DbObjectTypeTextMap = {
  [DbObjectType.database]: formatMessage({
    id: 'odc.src.d.ts.Database',
    defaultMessage: '数据库',
  }),

  [DbObjectType.table]: formatMessage({
    id: 'odc.src.d.ts.Table',
    defaultMessage: '表',
  }),

  [DbObjectType.view]: formatMessage({
    id: 'odc.src.d.ts.View',
    defaultMessage: '视图',
  }),

  [DbObjectType.procedure]: formatMessage({
    id: 'odc.src.d.ts.StoredProcedure',
    defaultMessage: '存储过程',
  }),

  [DbObjectType.function]: formatMessage({
    id: 'odc.src.d.ts.Function',
    defaultMessage: '函数',
  }),

  [DbObjectType.sequence]: formatMessage({
    id: 'odc.src.d.ts.Sequence',
    defaultMessage: '序列',
  }),

  [DbObjectType.package]: formatMessage({
    id: 'odc.src.d.ts.Package',
    defaultMessage: '程序包',
  }),

  [DbObjectType.package_body]: formatMessage({
    id: 'odc.src.d.ts.PackageBody',
    defaultMessage: '程序包体',
  }),

  [DbObjectType.column]: formatMessage({ id: 'src.constant.8D87AF25', defaultMessage: '列' }),

  //程序包体
  [DbObjectType.trigger]: formatMessage({ id: 'odc.src.d.ts.Trigger', defaultMessage: '触发器' }), // 触发器
  [DbObjectType.synonym]: formatMessage({ id: 'odc.src.d.ts.Synonyms', defaultMessage: '同义词' }), // 同义词
  [DbObjectType.public_synonym]: formatMessage({
    id: 'odc.src.d.ts.CommonSynonyms',
    defaultMessage: '公共同义词',
  }),

  // 公共同义词
  [DbObjectType.table_group]: formatMessage({
    id: 'odc.src.d.ts.TableGroup',
    defaultMessage: '表组',
  }), //表组
  [DbObjectType.file]: formatMessage({ id: 'odc.src.constant.label.File', defaultMessage: '文件' }), //文件 //文件
  [DbObjectType.type]: formatMessage({ id: 'odc.src.constant.label.Type', defaultMessage: '类型' }), //类型

  [DbObjectType.external_table]: '外表',
};

export const ConnectTypeText = {
  [ConnectType.NONE]: formatMessage({
    id: 'odc.components.ConnectionCardList.AllModes',
    defaultMessage: '全部模式',
  }),

  [ConnectType.OB_MYSQL]: 'OceanBase MySQL',
  [ConnectType.OB_ORACLE]: 'OceanBase Oracle',
  [ConnectType.CLOUD_OB_MYSQL]: 'OB Cloud MySQL',
  [ConnectType.CLOUD_OB_ORACLE]: 'OB Cloud Oracle',
  [ConnectType.ODP_SHARDING_OB_MYSQL]: 'OB Sharding MySQL',
  [ConnectType.MYSQL]: 'MySQL',
  [ConnectType.DORIS]: 'Doris',
  [ConnectType.ORACLE]: 'Oracle',
  [ConnectType.PG]: 'PostgreSQL',
};

export const DBTypeText = {
  [DBType.LOGICAL]: formatMessage({ id: 'src.constant.D2F0EBE8', defaultMessage: '逻辑库' }),
  [DBType.PHYSICAL]: formatMessage({ id: 'src.constant.5363D697', defaultMessage: '物理库' }),
};

export const DatabaseAvailableTypeText = {
  [BooleanOptionType.TRUE]: formatMessage({ id: 'src.constant.AA47C15A', defaultMessage: '可用' }),
  [BooleanOptionType.FALSE]: formatMessage({
    id: 'src.constant.64EC9D59',
    defaultMessage: '不可用',
  }),
};

export const DatabaseBelongsToProjectTypeText = {
  [BooleanOptionType.TRUE]: formatMessage({
    id: 'src.constant.EF974350',
    defaultMessage: '已分配项目',
  }),
  [BooleanOptionType.FALSE]: formatMessage({
    id: 'src.constant.8641DB35',
    defaultMessage: '未分配项目',
  }),
};

export const DragInsertTypeText = {
  [DragInsertType.NAME]: formatMessage({
    id: 'odc.component.UserConfigForm.ObjectName',
    defaultMessage: '对象名',
  }),

  [DragInsertType.SELECT]: formatMessage({
    id: 'odc.component.UserConfigForm.SelectStatement',
    defaultMessage: 'Select 语句',
  }),

  [DragInsertType.INSERT]: formatMessage({
    id: 'odc.component.UserConfigForm.InsertStatement',
    defaultMessage: 'Insert 语句',
  }),

  [DragInsertType.UPDATE]: formatMessage({
    id: 'odc.component.UserConfigForm.UpdateStatement',
    defaultMessage: 'Update 语句',
  }),

  [DragInsertType.DELETE]: formatMessage({
    id: 'odc.component.UserConfigForm.DeleteStatement',
    defaultMessage: 'Delete 语句',
  }),
};

export const SQLLintModeText = {
  [SQLLintMode.AUTO]: formatMessage({ id: 'odc.src.d.ts.Automatic', defaultMessage: '自动' }), //自动
  [SQLLintMode.MANUAL]: formatMessage({ id: 'odc.src.d.ts.Manual', defaultMessage: '手动' }), //手动
};

export const SchemaComparingResultText = {
  [SchemaComparingResult.CREATE]: formatMessage({
    id: 'odc.src.d.ts.Create',
    defaultMessage: '新建',
  }), //新建
  [SchemaComparingResult.UPDATE]: formatMessage({
    id: 'odc.src.d.ts.Modify',
    defaultMessage: '修改',
  }), //修改
  [SchemaComparingResult.NO_ACTION]: formatMessage({
    id: 'odc.src.d.ts.Consistent',
    defaultMessage: '一致',
  }),
  //一致
  [SchemaComparingResult.WAITING]: formatMessage({
    id: 'odc.src.d.ts.ToBeAnalyzed',
    defaultMessage: '待分析',
  }),
  //待分析
  [SchemaComparingResult.COMPARING]: formatMessage({
    id: 'odc.src.d.ts.Analyzing',
    defaultMessage: '分析中',
  }),
  //分析中
  [SchemaComparingResult.SKIP]: formatMessage({ id: 'odc.src.d.ts.Skip', defaultMessage: '跳过' }), //跳过
};

export const SQLSessionModeText = {
  [SQLSessionMode.MultiSession]: formatMessage({
    id: 'odc.component.UserConfigForm.IndependentSession',
    defaultMessage: '独立 Session',
  }),

  [SQLSessionMode.SingleSession]: formatMessage({
    id: 'odc.component.UserConfigForm.SharedSession',
    defaultMessage: '共享 Session',
  }),
};
export const columnGroupsText = {
  [ColumnStoreType.COLUMN]: formatMessage({ id: 'src.constant.CE5A59D0', defaultMessage: '列存' }),
  [ColumnStoreType.ROW]: formatMessage({ id: 'src.constant.481BAC23', defaultMessage: '行存' }),
};
