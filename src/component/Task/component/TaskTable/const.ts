import { TaskType } from '@/d.ts';
import { formatMessage } from '@/util/intl';

// dev_ing 工单类型对应工单名称
export const TaskTypeMap = {
  [TaskType.IMPORT]: formatMessage({
    id: 'odc.TaskManagePage.component.TaskTable.Import',
    defaultMessage: '导入',
  }),
  //导入
  [TaskType.EXPORT]: formatMessage({
    id: 'odc.TaskManagePage.component.TaskTable.Export',
    defaultMessage: '导出',
  }),
  //导出
  [TaskType.DATAMOCK]: formatMessage({
    id: 'odc.TaskManagePage.component.TaskTable.AnalogData',
    defaultMessage: '模拟数据',
  }),
  //模拟数据
  [TaskType.ASYNC]: formatMessage({
    id: 'odc.TaskManagePage.component.TaskTable.DatabaseChanges',
    defaultMessage: '数据库变更',
  }),
  // 数据库变更
  [TaskType.SHADOW]: formatMessage({
    id: 'odc.TaskManagePage.component.TaskTable.ShadowTableSynchronization',
    defaultMessage: '影子表同步',
  }),
  //影子表同步

  [TaskType.ALTER_SCHEDULE]: formatMessage({
    id: 'odc.TaskManagePage.component.TaskTable.PlannedChange',
    defaultMessage: '计划变更',
  }),
  //计划变更
  [TaskType.EXPORT_RESULT_SET]: formatMessage({
    id: 'odc.src.component.Task.component.TaskTable.ExportResultSet',
    defaultMessage: '导出结果集',
  }),
  //'导出结果集'
  [TaskType.ONLINE_SCHEMA_CHANGE]: formatMessage({
    id: 'odc.component.TaskTable.LockFreeStructureChange',
    defaultMessage: '无锁结构变更',
  }),
  //数据清理
  [TaskType.APPLY_PROJECT_PERMISSION]: formatMessage({
    id: 'odc.src.component.Task.component.TaskTable.ApplicationProjectPermissions',
    defaultMessage: '申请项目权限',
  }), //'申请项目权限'
  [TaskType.APPLY_DATABASE_PERMISSION]: formatMessage({
    id: 'src.component.Task.component.TaskTable.E1E161BA',
    defaultMessage: '申请库权限',
  }), //'申请库权限'
  [TaskType.APPLY_TABLE_PERMISSION]: formatMessage({
    id: 'src.component.Task.component.TaskTable.573E2A28',
    defaultMessage: '申请表/视图权限',
  }),
  [TaskType.STRUCTURE_COMPARISON]: formatMessage({
    id: 'src.component.Task.component.TaskTable.80E1D16A',
    defaultMessage: '结构比对',
  }), //'结构比对'
  [TaskType.MULTIPLE_ASYNC]: formatMessage({
    id: 'src.component.Task.component.TaskTable.A3CA13D5',
    defaultMessage: '多库变更',
  }),
  [TaskType.LOGICAL_DATABASE_CHANGE]: formatMessage({
    id: 'src.component.Task.component.TaskTable.4203E912',
    defaultMessage: '逻辑库变更',
  }),
};
