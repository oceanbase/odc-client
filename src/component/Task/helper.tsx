import { SubTaskType, TaskExecStrategy, TaskPageType, TaskType } from '@/d.ts';
import { SettingStore } from '@/store/setting';
import { TaskStore } from '@/store/task';
import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';

export const isCycleTask = (type: TaskType) => {
  return [TaskType.SQL_PLAN, TaskType.DATA_ARCHIVE].includes(type);
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
    SubTaskType.DATA_CLEAR,
  ].includes(type);
};

export const isCycleTaskPage = (type: TaskPageType) => {
  return [TaskPageType.SQL_PLAN, TaskPageType.DATA_ARCHIVE].includes(type);
};

export function getTaskTypeList(
  settingStore: SettingStore,
  task?: TaskStore,
): {
  groupName: string;
  icon?: React.ReactNode;
  group: {
    value: TaskPageType;
    label: string;
    enabled: boolean;
  }[];
}[] {
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
          enabled: !isClient(),
        },
      ],
    },

    {
      groupName: '数据导出',
      group: [
        {
          value: TaskPageType.EXPORT,
          label: formatMessage({ id: 'odc.components.TaskManagePage.Export' }), // 导出
          enabled: settingStore.enableDBExport,
        },
      ],
    },

    {
      groupName: '数据变更',
      group: [
        {
          value: TaskPageType.IMPORT,
          label: formatMessage({ id: 'odc.components.TaskManagePage.Import' }), // 导入
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
          enabled: task?.showAllSchemaTaskType,
        },
        {
          value: TaskPageType.ONLINE_SCHEMA_CHANGE,
          label: '无锁结构变更',
          enabled: true,
        },
      ],
    },

    {
      groupName: '定时任务',
      group: [
        {
          value: TaskPageType.SQL_PLAN,
          label: formatMessage({
            id: 'odc.TaskManagePage.component.helper.SqlPlan',
          }), //SQL 计划
          enabled: !isClient(),
        },
        {
          value: TaskPageType.PARTITION_PLAN,
          label: formatMessage({
            id: 'odc.TaskManagePage.component.TaskTable.PartitionPlan',
          }),
          //分区计划
          enabled: task?.showAllSchemaTaskType,
        },
        {
          value: TaskPageType.DATA_ARCHIVE,
          label: '数据归档',
          enabled: true,
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
}
