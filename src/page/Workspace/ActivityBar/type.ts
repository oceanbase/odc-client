import { formatMessage } from '@/util/intl';
export enum ActivityBarItemType {
  Database = 'database',
  Script = 'script',
  Task = 'Task',
  Manager = 'manager',
}

export const ActivityBarItemTypeText = {
  [ActivityBarItemType.Database]: formatMessage({ id: 'odc.Workspace.ActivityBar.type.Database' }), //数据库
  [ActivityBarItemType.Task]: formatMessage({ id: 'odc.Workspace.ActivityBar.type.Task' }), //任务
  [ActivityBarItemType.Script]: formatMessage({ id: 'odc.Workspace.ActivityBar.type.Script' }), //脚本
  [ActivityBarItemType.Manager]: formatMessage({
    id: 'odc.Workspace.ActivityBar.type.OMManagement',
  }), //运维管理
};
