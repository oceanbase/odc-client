export enum ActivityBarItemType {
  Database = 'database',
  Script = 'script',
  Task = 'Task',
  Manager = 'manager',
}

export const ActivityBarItemTypeText = {
  [ActivityBarItemType.Database]: '数据库',
  [ActivityBarItemType.Task]: '任务',
  [ActivityBarItemType.Script]: '脚本',
  [ActivityBarItemType.Manager]: '运维管理',
};
