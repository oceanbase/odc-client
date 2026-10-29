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

import { TablePermissionType } from '@/d.ts/table';
import { DatabasePermissionType } from './database';

export enum ProjectTabType {
  /** 全部项目 */
  ALL = 'all',
  /** 归档项目 */
  ARCHIVED = 'archived',
}
export enum ProjectRole {
  DEVELOPER = 'DEVELOPER',
  DBA = 'DBA',
  OWNER = 'OWNER',
  SECURITY_ADMINISTRATOR = 'SECURITY_ADMINISTRATOR',
  PARTICIPANT = 'PARTICIPANT',
}

export interface ProjectUser {
  id: number;
  name: string;
  accountName: string;
  roleNames: string[];
}

export interface IProject {
  id: number;
  name: string;
  description: string;
  archived: boolean;
  members: {
    id: number;
    accountName: string;
    name: string;
    role: ProjectRole;
    userEnabled: boolean;
    derivedFromGlobalProjectRole: boolean;
  }[];
  currentUserResourceRoles: ProjectRole[];
  builtin: boolean;
  organizationId: number;
  createTime: number;
  updateTime: number;
  creator: ProjectUser;
  lastModifier: ProjectUser;
}

export enum PermissionSourceType {
  // 用户授权
  USER_AUTHORIZATION = 'USER_AUTHORIZATION',
  // 工单申请
  TICKET_APPLICATION = 'TICKET_APPLICATION',
}

export enum DatabasePermissionStatus {
  EXPIRED = 'EXPIRED',
  EXPIRING = 'EXPIRING',
  NOT_EXPIRED = 'NOT_EXPIRED',
}

export enum TablePermissionStatus {
  EXPIRED = 'EXPIRED',
  EXPIRING = 'EXPIRING',
  NOT_EXPIRED = 'NOT_EXPIRED',
}

export interface IDatabasePermission {
  id: number;
  userId: number;
  permissionType: DatabasePermissionType;
  sourceType: PermissionSourceType;
  ticketId: number;
  createTime: number;
  expireTime: number;
  creatorId: number;
  organizationId: number;
  projectId: number;
  databaseId: number;
  databaseName: string;
  datasourceId: number;
  datasourceName: string;
  environmentId: number;
  environmentName: string;
  status: DatabasePermissionStatus;
}

export interface ITablePermission {
  id: number;
  userId: number;
  permissionType: TablePermissionType;
  sourceType: PermissionSourceType;
  ticketId: number;
  createTime: number;
  expireTime: number;
  creatorId: number;
  organizationId: number;
  projectId: number;
  databaseId: number;
  databaseName: string;
  datasourceId: number;
  datasourceName: string;
  environmentId: number;
  environmentName: string;
  status: TablePermissionStatus;
}
