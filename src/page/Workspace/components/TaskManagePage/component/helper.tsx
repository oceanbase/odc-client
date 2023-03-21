import { TaskPageType } from '@/d.ts';
import { SchemaStore } from '@/store/schema';
import { SettingStore } from '@/store/setting';
import { TaskStore } from '@/store/task';
import CycleTaskSvg from '@/svgr/cycle_task.svg';
import TaskSvg from '@/svgr/task.svg';
import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
export function getTaskTypeList(
  settingStore: SettingStore,
  schemaStore: SchemaStore,
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
      groupName: formatMessage({
        id: 'odc.TaskManagePage.component.helper.Task',
      }), //任务
      icon: TaskSvg,
      group: [
        {
          value: TaskPageType.IMPORT,
          label: formatMessage({ id: 'odc.components.TaskManagePage.Import' }), // 导入
          enabled: settingStore.enableDBImport,
        },

        {
          value: TaskPageType.EXPORT,
          label: formatMessage({ id: 'odc.components.TaskManagePage.Export' }), // 导出
          enabled: settingStore.enableDBExport,
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
          enabled: schemaStore.enableShadowSync || task?.showAllSchemaTaskType,
        },

        {
          value: TaskPageType.PARTITION_PLAN,
          label: formatMessage({
            id: 'odc.TaskManagePage.component.TaskTable.PartitionPlan',
          }),
          //分区计划
          enabled: schemaStore.enablePartitionPlan || task?.showAllSchemaTaskType,
        },

        {
          value: TaskPageType.PERMISSION_APPLY,
          label: formatMessage({
            id: 'odc.TaskManagePage.component.TaskTable.PermissionApplication',
          }),

          //权限申请
          enabled: !isClient() && !settingStore.serverSystemInfo.applyPermissionHidden,
        },
      ],
    },

    {
      groupName: formatMessage({
        id: 'odc.TaskManagePage.component.helper.AutomaticOperation',
      }), //自动运行
      icon: CycleTaskSvg,
      group: [
        {
          value: TaskPageType.SQL_PLAN,
          label: formatMessage({
            id: 'odc.TaskManagePage.component.helper.SqlPlan',
          }), //SQL 计划
          enabled: !isClient(),
        },
      ],
    },
  ];
}
