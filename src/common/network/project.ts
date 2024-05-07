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

import { IResponseData, IUserSummary } from '@/d.ts';
import { IProject, ProjectRole, PermissionSourceType, IDatabasePermission } from '@/d.ts/project';
import { DatabasePermissionType } from '@/d.ts/database';
import request from '@/util/request';

export async function listProjects(
  name: string = '',
  page: number,
  size: number,
  archived: boolean = false,
  builtin: boolean = false,
): Promise<IResponseData<IProject>> {
  const res = await request.get(`/api/v2/collaboration/projects`, {
    params: {
      name,
      page,
      size,
      archived,
      builtin,
    },
  });

  return res?.data;
}

export async function getProject(id: number): Promise<IProject> {
  const res = await request.get(`/api/v2/collaboration/projects/${id}`);

  return res?.data;
}

export async function updateProject(id: number, project: IProject): Promise<IProject> {
  const res = await request.put(`/api/v2/collaboration/projects/${id}`, {
    data: project,
  });

  return res?.data;
}

export async function createProject(params: {
  name: string;
  description: string;
  members: {
    id: number;
    role: ProjectRole;
  }[];
}): Promise<IProject> {
  const res = await request.post(`/api/v2/collaboration/projects`, {
    data: params,
  });

  return res?.data;
}

export async function setProjectAchived(params: {
  projectId: number;
  archived: boolean;
}): Promise<boolean> {
  const res = await request.post(
    `/api/v2/collaboration/projects/${params?.projectId}/setArchived`,
    {
      data: {
        archived: params?.archived,
      },
    },
  );

  return !!res?.data;
}

export async function deleteProjectMember(params: {
  projectId: number;
  userId: number;
}): Promise<boolean> {
  const res = await request.delete(
    `/api/v2/collaboration/projects/${params?.projectId}/members/${params?.userId}`,
  );

  return !!res?.data;
}

export async function updateProjectMember(params: {
  projectId: number;
  userId: number;
  members: {
    id: number;
    role: ProjectRole;
  }[];
}): Promise<boolean> {
  const res = await request.put(
    `/api/v2/collaboration/projects/${params?.projectId}/members/${params?.userId}`,
    {
      data: params?.members,
    },
  );

  return !!res?.data;
}

export async function addProjectMember(params: {
  projectId: number;
  members: {
    id: number;
    role: ProjectRole;
  }[];
}): Promise<boolean> {
  const res = await request.post(`/api/v2/collaboration/projects/${params?.projectId}/members`, {
    data: params?.members,
  });

  return !!res?.data;
}

export async function getUserSummaryList(): Promise<IResponseData<IUserSummary>> {
  const res = await request.get(`/api/v2/iam/users`, {
    params: {
      basic: true,
      size: 9999,
      page: 1,
    },
  });

  return res?.data;
}

/**
 * 查询权限列表
 */
export async function getDatabasePermissions(params: {
  projectId?: number;
  userId?: number;
  fuzzyDatabaseName?: string;
  fuzzyDatasourceName?: string;
  environmentIds?: number[];
  permissionTypes?: DatabasePermissionType;
  authorizationType?: PermissionSourceType;
  expiredList?: boolean[];
  expireSoon?: boolean;
  endTime?: number;
  createdByCurrentUser?: boolean;
  approveByCurrentUser?: boolean;
  parentInstanceId?: number;
  connectionId?: string;
  schema?: string;
  creator?: string;
  sort?: string;
  page?: number;
  size?: number;
}): Promise<IResponseData<IDatabasePermission>> {
  const { projectId } = params;
  const res = await request.get(`api/v2/collaboration/projects/${projectId}/databasePermissions/`, {
    params,
  });
  return res?.data;
}

// 回收权限
export async function reclaimPermission(projectId: number, ids: number[]): Promise<boolean> {
  const res = await request.delete(
    `api/v2/collaboration/projects/${projectId}/databasePermissions/batchRevoke`,
    {
      data: ids,
    },
  );
  return !!res?.data;
}

export async function addDatabasePermissions(params: {
  projectId: number;
  databaseIds: number[];
  types: DatabasePermissionType[];
  expireTime: number;
  userId: number;
}): Promise<boolean> {
  const res = await request.post(
    `/api/v2/collaboration/projects/${params?.projectId}/databasePermissions/batchCreate`,
    {
      data: params,
    },
  );
  return !!res?.data;
}
