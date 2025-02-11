/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

export enum ArchivedProjectOperationKey {
  REMOVE = 'remove',
}

export type IOperation = {
  key: UserOperationKey | DataBaseOperationKey | ArchivedProjectOperationKey;
  action: () => void;
  confirmText?: string;
  text: string;
  disable: boolean;
  visible?: boolean;
  disableTooltip: () => string;
};

export type getOperatioFunc<T> = (record: T) => IOperation[];
