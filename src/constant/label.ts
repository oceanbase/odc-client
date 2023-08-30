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
import { formatMessage } from '@/util/intl';

export const DbObjectTypeTextMap = {
  [DbObjectType.database]: formatMessage({
    id: 'odc.src.d.ts.Database',
  }),

  [DbObjectType.table]: formatMessage({
    id: 'odc.src.d.ts.Table',
  }),

  [DbObjectType.view]: formatMessage({
    id: 'odc.src.d.ts.View',
  }),

  [DbObjectType.procedure]: formatMessage({
    id: 'odc.src.d.ts.StoredProcedure',
  }),

  [DbObjectType.function]: formatMessage({
    id: 'odc.src.d.ts.Function',
  }),

  [DbObjectType.sequence]: formatMessage({
    id: 'odc.src.d.ts.Sequence',
  }),

  [DbObjectType.package]: formatMessage({
    id: 'odc.src.d.ts.Package',
  }),

  [DbObjectType.package_body]: formatMessage({
    id: 'odc.src.d.ts.PackageBody',
  }),

  //程序包体
  [DbObjectType.trigger]: formatMessage({ id: 'odc.src.d.ts.Trigger' }), // 触发器
  [DbObjectType.synonym]: formatMessage({ id: 'odc.src.d.ts.Synonyms' }), // 同义词
  [DbObjectType.public_synonym]: formatMessage({
    id: 'odc.src.d.ts.CommonSynonyms',
  }),

  // 公共同义词
  [DbObjectType.table_group]: formatMessage({ id: 'odc.src.d.ts.TableGroup' }), //表组
  [DbObjectType.file]: formatMessage({ id: 'odc.src.constant.label.File' }), //文件 //文件
  [DbObjectType.type]: formatMessage({ id: 'odc.src.constant.label.Type' }), //类型
};

export const ConnectTypeText = {
  [ConnectType.NONE]: formatMessage({
    id: 'odc.components.ConnectionCardList.AllModes',
  }),

  [ConnectType.OB_MYSQL]: 'OceanBase MySQL',
  [ConnectType.OB_ORACLE]: 'OceanBase Oracle',
  [ConnectType.CLOUD_OB_MYSQL]: 'OceanBase MySQL Cloud',
  [ConnectType.CLOUD_OB_ORACLE]: 'OceanBase Oracle Cloud',
  [ConnectType.ODP_SHARDING_OB_MYSQL]: 'OceanBase MySQL Sharding',
  [ConnectType.MYSQL]: 'MySQL',
};

export const DragInsertTypeText = {
  [DragInsertType.NAME]: formatMessage({
    id: 'odc.component.UserConfigForm.ObjectName',
  }),

  [DragInsertType.SELECT]: formatMessage({
    id: 'odc.component.UserConfigForm.SelectStatement',
  }),

  [DragInsertType.INSERT]: formatMessage({
    id: 'odc.component.UserConfigForm.InsertStatement',
  }),

  [DragInsertType.UPDATE]: formatMessage({
    id: 'odc.component.UserConfigForm.UpdateStatement',
  }),

  [DragInsertType.DELETE]: formatMessage({
    id: 'odc.component.UserConfigForm.DeleteStatement',
  }),
};

export const SQLLintModeText = {
  [SQLLintMode.AUTO]: formatMessage({ id: 'odc.src.d.ts.Automatic' }), //自动
  [SQLLintMode.MANUAL]: formatMessage({ id: 'odc.src.d.ts.Manual' }), //手动
};

export const SchemaComparingResultText = {
  [SchemaComparingResult.CREATE]: formatMessage({ id: 'odc.src.d.ts.Create' }), //新建
  [SchemaComparingResult.UPDATE]: formatMessage({ id: 'odc.src.d.ts.Modify' }), //修改
  [SchemaComparingResult.NO_ACTION]: formatMessage({
    id: 'odc.src.d.ts.Consistent',
  }),
  //一致
  [SchemaComparingResult.WAITING]: formatMessage({
    id: 'odc.src.d.ts.ToBeAnalyzed',
  }),
  //待分析
  [SchemaComparingResult.COMPARING]: formatMessage({
    id: 'odc.src.d.ts.Analyzing',
  }),
  //分析中
  [SchemaComparingResult.SKIP]: formatMessage({ id: 'odc.src.d.ts.Skip' }), //跳过
};

export const SQLSessionModeText = {
  [SQLSessionMode.MultiSession]: formatMessage({
    id: 'odc.component.UserConfigForm.IndependentSession',
  }),

  [SQLSessionMode.SingleSession]: formatMessage({
    id: 'odc.component.UserConfigForm.SharedSession',
  }),
};
