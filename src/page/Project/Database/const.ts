/**
 * 数据库管理员的最大个数
 */
export const DB_OWNER_MAX_COUNT = 3;

export enum DatabaseGroup {
  /** 不分组 */
  none = 'NONE',
  /** 按类型 */
  type = 'TYPE',
  /** 按环境 */
  environment = 'ENVIRONMENT',
  /** 按数据源 */
  dataSource = 'DATASOURCE',
  /** 按集群 */
  cluster = 'CLUSTER',
}
