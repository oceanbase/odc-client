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
import login from '@/store/login';
import settingStore from '@/store/setting';
import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { flatten } from 'lodash';
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
            id: 'odc.component.TaskPopover.IInitiated',
          }),
          value: TaskPageType.CREATED_BY_CURRENT_USER,
          enabled: !isClient(),
        },
        {
          label: formatMessage({
            id: 'odc.component.TaskPopover.PendingMyApproval',
          }),
          value: TaskPageType.APPROVE_BY_CURRENT_USER,
          enabled: !isClient() && !isPersonal,
        },
      ],
    },
    {
      groupName: formatMessage({
        id: 'odc.component.Task.helper.DataExport',
      }),
      //数据导出
      group: [
        {
          value: TaskPageType.EXPORT,
          label: formatMessage({
            id: 'odc.components.TaskManagePage.Export',
          }),
          // 导出
          enabled: settingStore.enableDBExport,
        },
        {
          value: TaskPageType.EXPORT_RESULT_SET,
          label: formatMessage({
            id: 'odc.src.component.Task.ExportResultSet',
          }), //'导出结果集'
          enabled: settingStore.enableDBExport,
        },
      ],
    },
    {
      groupName: formatMessage({
        id: 'odc.component.Task.helper.DataChanges',
      }),
      //数据变更
      group: [
        {
          value: TaskPageType.IMPORT,
          label: formatMessage({
            id: 'odc.components.TaskManagePage.Import',
          }),
          // 导入
          enabled: settingStore.enableDBImport,
        },
        {
          value: TaskPageType.DATAMOCK,
          label: formatMessage({
            id: 'odc.components.TaskManagePage.AnalogData',
          }),
          // 模拟数据
          enabled: settingStore.enableMockdata,
        },
        {
          value: TaskPageType.ASYNC,
          label: formatMessage({
            id: 'odc.components.TaskManagePage.DatabaseChanges',
          }),
          enabled: settingStore.enableAsyncTask,
          // 数据库变更
        },
        {
          value: TaskPageType.SHADOW,
          label: formatMessage({
            id: 'odc.TaskManagePage.component.TaskTable.ShadowTableSynchronization',
          }),
          //影子表同步
          enabled: true,
        },
        {
          value: TaskPageType.ONLINE_SCHEMA_CHANGE,
          label: formatMessage({
            id: 'odc.component.Task.helper.LockFreeStructureChange',
          }),
          //无锁结构变更
          enabled: settingStore.enableOSC,
        },
      ],
    },
    {
      groupName: formatMessage({
        id: 'odc.component.Task.helper.ScheduledTasks',
      }),
      //定时任务
      group: [
        {
          value: TaskPageType.SQL_PLAN,
          label: formatMessage({
            id: 'odc.TaskManagePage.component.helper.SqlPlan',
          }),
          //SQL 计划
          enabled: !isClient(),
        },
        {
          value: TaskPageType.PARTITION_PLAN,
          label: formatMessage({
            id: 'odc.TaskManagePage.component.TaskTable.PartitionPlan',
          }),
          enabled: true,
        },
        {
          value: TaskPageType.DATA_ARCHIVE,
          label: formatMessage({
            id: 'odc.component.Task.helper.DataArchiving',
          }),
          //数据归档
          enabled: !isClient(),
        },
        {
          value: TaskPageType.DATA_DELETE,
          label: formatMessage({
            id: 'odc.component.Task.helper.DataCleansing',
          }),
          //数据清理
          enabled: !isClient(),
        },
      ],
    },
    // {
    //   groupName: '权限申请',
    //   group: [
    //     {
    //       value: TaskPageType.SENSITIVE_COLUMN,
    //       label: '敏感列',
    //       enabled: true,
    //     },
    //   ],
    // },
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
