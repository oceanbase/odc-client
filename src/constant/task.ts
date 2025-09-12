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
  [TaskPageType.APPLY_PROJECT_PERMISSION]: '项目权限',
  [TaskPageType.APPLY_DATABASE_PERMISSION]: '库权限',
  [TaskPageType.APPLY_TABLE_PERMISSION]: '表/视图权限',
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
  [TaskActionsEnum.VIEW]: '查看',
  [TaskActionsEnum.CLONE]: '克隆',
  [TaskActionsEnum.SHARE]: '分享',
  [TaskActionsEnum.STOP]: '终止',
  [TaskActionsEnum.ROLLBACK]: '回滚',
  [TaskActionsEnum.EXECUTE]: '执行',
  [TaskActionsEnum.PASS]: '同意',
  [TaskActionsEnum.AGAIN]: '重试',
  [TaskActionsEnum.DOWNLOAD]: '下载',
  [TaskActionsEnum.REJECT]: '拒绝',
  [TaskActionsEnum.DOWNLOAD_SQL]: '下载 SQL',
  [TaskActionsEnum.STRUCTURE_COMPARISON]: '发起结构同步',
  [TaskActionsEnum.OPEN_LOCAL_FOLDER]: '打开文件夹',
  [TaskActionsEnum.DOWNLOAD_VIEW_RESULT]: '下载查询结果',
  [TaskActionsEnum.VIEW_RESULT]: '查询结果',
};

export const SchemaChangeRecordStatusTextMap = {
  [ISqlExecuteResultStatus.SUCCESS]: '执行成功',
  [ISqlExecuteResultStatus.FAILED]: '执行失败',
  [ISqlExecuteResultStatus.CANCELED]: '执行取消',
  [ISqlExecuteResultStatus.RUNNING]: '执行中',
  [ISqlExecuteResultStatus.CREATED]: '待执行',
};
