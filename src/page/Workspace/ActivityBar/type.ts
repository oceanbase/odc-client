export enum ActivityBarItemType {
  Database = 'database',
  Script = 'script',
  Job = 'job',
  Manager = 'manager',
}

export const ActivityBarItemTypeText = {
  [ActivityBarItemType.Database]: '数据库',
  [ActivityBarItemType.Job]: '任务',
  [ActivityBarItemType.Script]: '脚本',
  [ActivityBarItemType.Manager]: '运维管理',
};
