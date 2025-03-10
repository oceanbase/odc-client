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

import { DbObjectType, IResponseData, IManagerResourceType, ConnectType } from '@/d.ts';
import { DBType, IDatabase, IDatabaseObject } from '@/d.ts/database';
import sessionManager from '@/store/sessionManager';
import notification from '@/util/notification';
import request from '@/util/request';
import { getDropSQL } from '@/util/sql';
import { executeSQL } from './sql';

export async function listDatabases(
  projectId?: number,
  dataSourceId?: number,
  page?: number,
  size?: number,
  name?: string,
  environmentId?: number[],
  /**
   * 是否包含未分配项目的数据库
   */
  containsUnassigned?: boolean,
  existed?: boolean,
  includesPermittedAction?: boolean,
  type?: DBType[],
  connectType?: ConnectType[],
  dataSourceName?: string,
  cluster?: string,
  host?: string,
  tenant?: string,
): Promise<IResponseData<IDatabase>> {
  const res = await request.get(`/api/v2/database/databases`, {
    params: {
      projectId,
      dataSourceId,
      name,
      page,
      size,
      environmentId,
      containsUnassigned,
      existed,
      includesPermittedAction,
      type: type,
      connectType: connectType,
      dataSourceName,
      cluster,
      host,
      tenant,
    },
  });

  return res?.data;
}

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export async function createDataBase(database: DeepPartial<IDatabase>): Promise<Boolean> {
  const res = await request.post(`/api/v2/database/databases`, {
    data: {
      ...database,
      projectId: database?.project?.id,
      dataSourceId: database?.dataSource?.id,
    },
  });
  return res?.data;
}

export async function updateDataBase(
  databaseIds: number[],
  projectId: number,
  ownerIds: number[],
): Promise<Boolean> {
  const res = await request.post(`/api/v2/database/databases/transfer`, {
    data: {
      databaseIds,
      projectId,
      ownerIds,
    },
  });
  return res?.data;
}

export async function updateDataBaseOwner(
  databaseIds: number[],
  projectId: number,
  ownerIds: number[],
): Promise<Boolean> {
  const res = await request.put(`/api/v2/database/databases/owner/${projectId}`, {
    data: {
      databaseIds,
      ownerIds,
    },
  });
  return res?.data;
}

export async function getDatabase(
  databaseId: number,
  ignoreError?: boolean,
): Promise<{ data?: IDatabase; errCode: string; errMsg: string }> {
  const res = await request.get(`/api/v2/database/databases/${databaseId}`, {
    params: {
      ignoreError,
    },
  });
  return res;
}

export async function deleteDatabase(databaseIds: number[]): Promise<boolean> {
  const res = await request.delete(`/api/v2/database/databases`, {
    data: {
      databaseIds,
    },
  });
  return res?.data;
}

export async function dropObject(objName: string, objType: DbObjectType, sessionId: string) {
  const schemaName = sessionManager.sessionMap.get(sessionId)?.database?.dbName;
  const result = await executeSQL(
    getDropSQL(
      objName,
      objType,
      schemaName,
      sessionManager.sessionMap.get(sessionId)?.connection?.dialectType,
    ),
    sessionId,
    schemaName,
  );
  const error = result?.executeResult?.find((item) => item.track);
  if (error) {
    notification.error(error);
  }
  return result?.executeSuccess;
}

export async function getDatabaseObject(
  projectId?: number,
  datasourceId?: number,
  databaseIds?: string | number,
  types?: string | string[],
  searchKey?: string,
): Promise<{ data?: IDatabaseObject; errCode: string; errMsg: string }> {
  if (searchKey) {
    const res = await request.get(`api/v2/database/object/objects`, {
      params: {
        projectId: projectId || null,
        datasourceId: datasourceId || null,
        databaseIds: databaseIds || null,
        types: types || null,
        searchKey: searchKey,
      },
    });
    return res;
  }
}

export async function syncObject(
  resourceType?: IManagerResourceType,
  resourceId?: number,
): Promise<{ data?: boolean; errCode: string; errMsg: string }> {
  const res = await request.post(`api/v2/database/object/sync`, {
    data: {
      resourceType,
      resourceId,
    },
  });
  return res;
}

export async function syncAll(): Promise<{
  data?: boolean;
  errCode: string;
  errMsg: string;
}> {
  const res = await request.post(`api/v2/database/object/syncAll`);
  return res;
}
