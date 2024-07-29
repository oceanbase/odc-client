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

import { formatMessage } from '@/util/intl';
import { EComparisonScope, EOperationType } from '@/d.ts/task';
export const comparisonScopeMap = {
  [EComparisonScope.ALL]: formatMessage({
    id: 'src.component.Task.StructureComparisonTask.CreateModal.9C98407E',
    defaultMessage: '全部表',
  }), //'全部表'
  [EComparisonScope.PART]: formatMessage({
    id: 'src.component.Task.StructureComparisonTask.CreateModal.D2F4E132',
    defaultMessage: '部分表',
  }), //'部分表'
};
export const EOperationTypeMap = {
  [EOperationType.CREATE]: formatMessage({
    id: 'src.component.Task.StructureComparisonTask.CreateModal.604BD3CF',
    defaultMessage: '新建',
  }), //'新建'
  [EOperationType.UPDATE]: formatMessage({
    id: 'src.component.Task.StructureComparisonTask.CreateModal.8F395AFB',
    defaultMessage: '修改',
  }), //'修改'
  [EOperationType.DROP]: formatMessage({
    id: 'src.component.Task.StructureComparisonTask.CreateModal.4DAACA54',
    defaultMessage: '删除',
  }), //'删除'
  [EOperationType.NO_ACTION]: formatMessage({
    id: 'src.component.Task.StructureComparisonTask.CreateModal.32ECF203',
    defaultMessage: '一致',
  }), //'一致'
  [EOperationType.SKIP]: formatMessage({
    id: 'src.component.Task.StructureComparisonTask.CreateModal.E247086C',
    defaultMessage: '跳过',
  }), //'跳过'
  [EOperationType.UNSUPPORTED]: formatMessage({
    id: 'src.component.Task.StructureComparisonTask.CreateModal.F20205E5',
    defaultMessage: '不支持',
  }), //'不支持'
};
