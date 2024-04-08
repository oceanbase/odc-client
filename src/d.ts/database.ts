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

import { IDatasource } from './datasource';
import { IEnvironment } from './environment';
import { IProject } from './project';

export enum DatabaseSyncStatus {
  FAILED = 'FAILED',
  SUCCEEDED = 'SUCCEEDED',
  PENDING = 'PENDING',
}

export enum DatabasePermissionType {
  QUERY = 'QUERY',
  CHANGE = 'CHANGE',
  EXPORT = 'EXPORT',
}

export interface IDatabase {
  id: number;
  databaseId?: string;
  name: string;
  project: IProject;
  lockDatabaseUserRequired: boolean;
  dataSource: IDatasource;
  syncStatus: DatabaseSyncStatus;
  lastSyncTime: number;
  organizationId: number;
  charsetName: string;
  collationName: string;
  tableCount: number;
  environment: IEnvironment;
  existed: boolean;
  authorizedPermissionTypes?: DatabasePermissionType[];
  /**
   * 数据库管理员
   */
  owners: IDatabaseOwner[];
}

/**
 * 数据库管理员
 */
export interface IDatabaseOwner {
  accountName: string;
  id: number;
  name: string;
}

export interface IUnauthorizedDatabase {
  unauthorizedPermissionTypes: DatabasePermissionType[];
  // 数据库ID
  id: number;
  // 数据库名称
  name: string;
  project: IProject;
  dataSource: IDatasource;
  environment: IEnvironment;
}
