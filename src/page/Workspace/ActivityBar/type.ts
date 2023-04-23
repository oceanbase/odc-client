export enum ActivityBarItemType {
  Database,
  Script,
  Job,
  Manager,
}

export const ActivityBarItemTypeText = {
  [ActivityBarItemType.Database]: '数据库',
  [ActivityBarItemType.Job]: '任务',
  [ActivityBarItemType.Script]: '脚本',
  [ActivityBarItemType.Manager]: '运维管理',
};
