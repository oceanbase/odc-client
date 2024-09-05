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

import { SubTaskType, TaskExecStrategy, TaskPageType, TaskType } from '@/d.ts';
import { DatabasePermissionType } from '@/d.ts/database';
import login from '@/store/login';
import settingStore from '@/store/setting';
import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { flatten } from 'lodash';
export { TaskTypeMap } from '@/component/Task/component/TaskTable';

// 423 屏蔽 SysFormItem 配置
export const ENABLED_SYS_FROM_ITEM = false;

export const hasPermission = (taskType: TaskType, permissions: DatabasePermissionType[]) => {
  let _permissions = [];
  switch (taskType) {
    case TaskType.EXPORT:
      return permissions?.length > 0; // 考虑有表没有库权限的情况
    case TaskType.EXPORT_RESULT_SET:
      _permissions = [DatabasePermissionType.EXPORT, DatabasePermissionType.QUERY];
      break;
    default:
      _permissions = [DatabasePermissionType.CHANGE];
  }
  return _permissions.every((item) => permissions?.includes(item));
};

export const isCycleTask = (type: TaskType) => {
  return [TaskType.SQL_PLAN, TaskType.DATA_ARCHIVE, TaskType.DATA_DELETE].includes(type);
};
export const isCycleTriggerStrategy = (execStrategy: TaskExecStrategy) => {
  return [
    TaskExecStrategy.CRON,
    TaskExecStrategy.DAY,
    TaskExecStrategy.WEEK,
    TaskExecStrategy.MONTH,
    TaskExecStrategy.TIMER,
  ].includes(execStrategy);
};
export const isSubCycleTask = (type: SubTaskType) => {
  return [
    SubTaskType.DATA_ARCHIVE,
    SubTaskType.DATA_ARCHIVE_ROLLBACK,
    SubTaskType.DATA_DELETE,
  ].includes(type);
};
export const isCycleTaskPage = (type: TaskPageType) => {
  return [TaskPageType.SQL_PLAN, TaskPageType.DATA_ARCHIVE, TaskPageType.DATA_DELETE].includes(
    type,
  );
};
interface ITaskGroupLabel {
  groupName: string;
  icon?: React.ReactNode;
  group: {
    value: TaskPageType;
    label: string;
    enabled: boolean;
  }[];
}
export const getTaskGroupLabels: () => ITaskGroupLabel[] = () => {
  const isPersonal = login?.isPrivateSpace();
  return [
    {
      groupName: '',
      group: [
        {
          label: formatMessage({
            id: 'odc.src.component.Task.AllWorkOrders',
            defaultMessage: '所有工单',
          }), //'所有工单'
          value: TaskPageType.ALL,
          enabled: !isClient(),
        },
        {
          label: formatMessage({
            id: 'odc.component.TaskPopover.IInitiated',
            defaultMessage: '我发起的',
          }),
          value: TaskPageType.CREATED_BY_CURRENT_USER,
          enabled: !isClient(),
        },
        {
          label: formatMessage({
            id: 'odc.component.TaskPopover.PendingMyApproval',
            defaultMessage: '待我审批',
          }),
          value: TaskPageType.APPROVE_BY_CURRENT_USER,
          enabled: !isClient() && !isPersonal,
        },
      ],
    },
    {
      groupName: formatMessage({
        id: 'odc.component.Task.helper.DataExport',
        defaultMessage: '数据导出',
      }),
      //数据导出
      group: [
        {
          value: TaskPageType.EXPORT,
          label: formatMessage({
            id: 'odc.components.TaskManagePage.Export',
            defaultMessage: '导出',
          }),
          // 导出
          enabled: settingStore.enableDBExport,
        },
        {
          value: TaskPageType.EXPORT_RESULT_SET,
          label: formatMessage({
            id: 'odc.src.component.Task.ExportResultSet',
            defaultMessage: '导出结果集',
          }),
          //'导出结果集'
          enabled: settingStore.enableDBExport,
        },
      ],
    },
    {
      groupName: formatMessage({
        id: 'odc.component.Task.helper.DataChanges',
        defaultMessage: '数据变更',
      }),
      //数据变更
      group: [
        {
          value: TaskPageType.IMPORT,
          label: formatMessage({
            id: 'odc.components.TaskManagePage.Import',
            defaultMessage: '导入',
          }),
          // 导入
          enabled: settingStore.enableDBImport,
        },
        {
          value: TaskPageType.DATAMOCK,
          label: formatMessage({
            id: 'odc.components.TaskManagePage.AnalogData',
            defaultMessage: '模拟数据',
          }),
          // 模拟数据
          enabled: settingStore.enableMockdata,
        },
        {
          value: TaskPageType.ASYNC,
          label: formatMessage({
            id: 'odc.components.TaskManagePage.DatabaseChanges',
            defaultMessage: '数据库变更',
          }),
          enabled: settingStore.enableAsyncTask,
          // 数据库变更
        },
        {
          value: TaskPageType.MULTIPLE_ASYNC,
          label: formatMessage({ id: 'src.component.Task.1EDC83CC', defaultMessage: '多库变更' }),
          enabled: !login.isPrivateSpace(),
          // 数据库变更
        },
        {
          value: TaskPageType.LOGICAL_DATABASE_CHANGE,
          label: '逻辑库变更',
          enabled: true,
        },
        {
          value: TaskPageType.SHADOW,
          label: formatMessage({
            id: 'odc.TaskManagePage.component.TaskTable.ShadowTableSynchronization',
            defaultMessage: '影子表同步',
          }),
          //影子表同步
          enabled: true,
        },
        {
          value: TaskPageType.STRUCTURE_COMPARISON,
          label: formatMessage({ id: 'src.component.Task.223677D8', defaultMessage: '结构比对' }), //'结构比对'

          enabled: true,
        },
        {
          value: TaskPageType.ONLINE_SCHEMA_CHANGE,
          label: formatMessage({
            id: 'odc.component.Task.helper.LockFreeStructureChange',
            defaultMessage: '无锁结构变更',
          }),
          //无锁结构变更
          enabled: settingStore.enableOSC,
        },
      ],
    },
    {
      groupName: formatMessage({
        id: 'odc.component.Task.helper.ScheduledTasks',
        defaultMessage: '定时任务',
      }),
      //定时任务
      group: [
        {
          value: TaskPageType.SQL_PLAN,
          label: formatMessage({
            id: 'odc.TaskManagePage.component.helper.SqlPlan',
            defaultMessage: 'SQL 计划',
          }),
          //SQL 计划
          enabled: !isClient(),
        },
        {
          value: TaskPageType.PARTITION_PLAN,
          label: formatMessage({
            id: 'odc.TaskManagePage.component.TaskTable.PartitionPlan',
            defaultMessage: '分区计划',
          }),
          enabled: !isClient(),
        },
        {
          value: TaskPageType.DATA_ARCHIVE,
          label: formatMessage({
            id: 'odc.component.Task.helper.DataArchiving',
            defaultMessage: '数据归档',
          }),
          //数据归档
          enabled: !isClient(),
        },
        {
          value: TaskPageType.DATA_DELETE,
          label: formatMessage({
            id: 'odc.component.Task.helper.DataCleansing',
            defaultMessage: '数据清理',
          }),
          //数据清理
          enabled: !isClient(),
        },
      ],
    },
    {
      groupName: formatMessage({
        id: 'odc.src.component.Task.AccessRequest',
        defaultMessage: '权限申请',
      }), //'权限申请'
      group: [
        {
          value: TaskPageType.APPLY_DATABASE_PERMISSION,
          label: formatMessage({ id: 'src.component.Task.F2EE6904', defaultMessage: '申请库权限' }), //'申请库权限'
          enabled: !isClient() && !isPersonal,
        },
        {
          value: TaskPageType.APPLY_PROJECT_PERMISSION,
          label: formatMessage({
            id: 'odc.src.component.Task.ApplicationProjectPermissions',
            defaultMessage: '申请项目权限',
          }), //'申请项目权限'
          enabled: !isClient() && !isPersonal,
        },
        {
          value: TaskPageType.APPLY_TABLE_PERMISSION,
          label: formatMessage({ id: 'src.component.Task.D7396534', defaultMessage: '申请表权限' }),
          enabled: !isClient() && !isPersonal,
        },
      ],
    },
  ];
};

export function getTaskLabels() {
  return flatten(getTaskGroupLabels()?.map((item) => item?.group));
}
export function getFirstEnabledTask() {
  return getTaskLabels()?.find((item) => item?.enabled);
}
export function getTaskLabelByType(type: TaskPageType) {
  return getTaskLabels()?.find((item) => item.value === type)?.label;
}
