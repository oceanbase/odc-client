export enum UserOperationKey {
  /** 管理权限 */
  MANAGE_PERMISSION = 'managePermission',
  /** 编辑角色 */
  EDIT_ROLES = 'editRole',
  /** 移除成员 */
  REMOVE_ROLES = 'removeRole',
}

export enum DataBaseOperationKey {
  /** 导出 */
  EXPORT = 'export',
  /** 导入 */
  IMPORT = 'import',
  /** 数据库变更 */
  DDL = 'ddl',
  /** 登录数据库 */
  LOGIN = 'login',
  /** 设置库管理员 */
  CHANGEOWNER = 'changeOwner',
  /** 修改所属项目 */
  TRANSFER = 'transfer',
  /** 逻辑表管理 */
  MANAGE_LOGIN_DATABASE = 'logicalDatabaseManage',
  /** 逻辑库变更 */
  UPDATE_LOGIN_DATABASE = 'logicalDatabaseUpdate',
  /** 登录数据库 */
  LOGICAL_DATABASE_LOGIN = 'logicalDatabaseLogin',
  /** 移除逻辑库 */
  DELETE_LOGIN_DATABASE = 'logicalDatabaseDelete',
}

export type IOperation = {
  key: UserOperationKey | DataBaseOperationKey;
  action: () => void;
  confirmText?: string;
  text: string;
  disable: boolean;
  visible?: boolean;
  disableTooltip: () => string;
};

export type getOperatioFunc<T> = (record: T) => IOperation[];
