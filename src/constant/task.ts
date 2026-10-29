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

import { ISqlExecuteResultStatus, TaskPageType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { TaskActionsEnum, TaskGroup } from '@/d.ts/task';

export const TaskPageTextMap = {
  [TaskPageType.ALL]: formatMessage({
    id: 'odc.src.component.Task.AllWorkOrders',
    defaultMessage: '所有工单',
  }),
  [TaskPageType.EXPORT]: formatMessage({
    id: 'odc.components.TaskManagePage.Export',
    defaultMessage: '导出',
  }),
  [TaskPageType.EXPORT_RESULT_SET]: formatMessage({
    id: 'odc.src.component.Task.ExportResultSet',
    defaultMessage: '导出结果集',
  }),
  [TaskPageType.IMPORT]: formatMessage({
    id: 'odc.components.TaskManagePage.Import',
    defaultMessage: '导入',
  }),
  [TaskPageType.DATAMOCK]: formatMessage({
    id: 'odc.components.TaskManagePage.AnalogData',
    defaultMessage: '模拟数据',
  }),
  [TaskPageType.ASYNC]: formatMessage({
    id: 'odc.components.TaskManagePage.DatabaseChanges',
    defaultMessage: '数据库变更',
  }),
  [TaskPageType.MULTIPLE_ASYNC]: formatMessage({
    id: 'src.component.Task.1EDC83CC',
    defaultMessage: '多库变更',
  }),
  [TaskPageType.LOGICAL_DATABASE_CHANGE]: formatMessage({
    id: 'src.component.Task.A7954C70',
    defaultMessage: '逻辑库变更',
  }),
  [TaskPageType.SHADOW]: formatMessage({
    id: 'odc.TaskManagePage.component.TaskTable.ShadowTableSynchronization',
    defaultMessage: '影子表同步',
  }),
  [TaskPageType.STRUCTURE_COMPARISON]: formatMessage({
    id: 'src.component.Task.223677D8',
    defaultMessage: '结构比对',
  }),
  [TaskPageType.ONLINE_SCHEMA_CHANGE]: formatMessage({
    id: 'odc.component.Task.helper.LockFreeStructureChange',
    defaultMessage: '无锁结构变更',
  }),
  [TaskPageType.APPLY_PROJECT_PERMISSION]: formatMessage({
    id: 'src.constant.B5C6130E',
    defaultMessage: '项目权限',
  }),
  [TaskPageType.APPLY_DATABASE_PERMISSION]: formatMessage({
    id: 'src.constant.43A587C8',
    defaultMessage: '库权限',
  }),
  [TaskPageType.APPLY_TABLE_PERMISSION]: formatMessage({
    id: 'src.constant.94307EDC',
    defaultMessage: '表/视图权限',
  }),
};

export const TaskGroupTextMap = {
  [TaskGroup.Other]: '',
  [TaskGroup.DataExport]: formatMessage({
    id: 'odc.component.Task.helper.DataExport',
    defaultMessage: '数据导出',
  }),
  [TaskGroup.DataChanges]: formatMessage({
    id: 'odc.component.Task.helper.DataChanges',
    defaultMessage: '数据变更',
  }),
  [TaskGroup.AccessRequest]: formatMessage({
    id: 'odc.src.component.Task.AccessRequest',
    defaultMessage: '权限申请',
  }),
};

export const TaskActionsTextMap = {
  [TaskActionsEnum.VIEW]: formatMessage({ id: 'src.constant.F2B0EACC', defaultMessage: '查看' }),
  [TaskActionsEnum.CLONE]: formatMessage({ id: 'src.constant.A10A0980', defaultMessage: '克隆' }),
  [TaskActionsEnum.SHARE]: formatMessage({ id: 'src.constant.10D30E47', defaultMessage: '分享' }),
  [TaskActionsEnum.STOP]: formatMessage({ id: 'src.constant.CCE9B75C', defaultMessage: '终止' }),
  [TaskActionsEnum.ROLLBACK]: formatMessage({
    id: 'src.constant.FB3B422B',
    defaultMessage: '回滚',
  }),
  [TaskActionsEnum.EXECUTE]: formatMessage({ id: 'src.constant.59F8EDCB', defaultMessage: '执行' }),
  [TaskActionsEnum.PASS]: formatMessage({ id: 'src.constant.CC13E5E8', defaultMessage: '同意' }),
  [TaskActionsEnum.AGAIN]: formatMessage({ id: 'src.constant.027E0B4B', defaultMessage: '重试' }),
  [TaskActionsEnum.DOWNLOAD]: formatMessage({
    id: 'src.constant.7ADCA81D',
    defaultMessage: '下载',
  }),
  [TaskActionsEnum.REJECT]: formatMessage({ id: 'src.constant.0F0EB956', defaultMessage: '拒绝' }),
  [TaskActionsEnum.DOWNLOAD_SQL]: formatMessage({
    id: 'src.constant.12185358',
    defaultMessage: '下载 SQL',
  }),
  [TaskActionsEnum.STRUCTURE_COMPARISON]: formatMessage({
    id: 'src.constant.5E9EED46',
    defaultMessage: '发起结构同步',
  }),
  [TaskActionsEnum.OPEN_LOCAL_FOLDER]: formatMessage({
    id: 'src.constant.CB4131C9',
    defaultMessage: '打开文件夹',
  }),
  [TaskActionsEnum.DOWNLOAD_VIEW_RESULT]: formatMessage({
    id: 'src.constant.59F0A267',
    defaultMessage: '下载查询结果',
  }),
  [TaskActionsEnum.VIEW_RESULT]: formatMessage({
    id: 'src.constant.019A300D',
    defaultMessage: '查询结果',
  }),
};

export const SchemaChangeRecordStatusTextMap = {
  [ISqlExecuteResultStatus.SUCCESS]: formatMessage({
    id: 'src.constant.F701F798',
    defaultMessage: '执行成功',
  }),
  [ISqlExecuteResultStatus.FAILED]: formatMessage({
    id: 'src.constant.A1A40D9A',
    defaultMessage: '执行失败',
  }),
  [ISqlExecuteResultStatus.CANCELED]: formatMessage({
    id: 'src.constant.91B648D4',
    defaultMessage: '执行取消',
  }),
  [ISqlExecuteResultStatus.RUNNING]: formatMessage({
    id: 'src.constant.7F8CDA3C',
    defaultMessage: '执行中',
  }),
  [ISqlExecuteResultStatus.CREATED]: formatMessage({
    id: 'src.constant.0E6D946F',
    defaultMessage: '待执行',
  }),
};
