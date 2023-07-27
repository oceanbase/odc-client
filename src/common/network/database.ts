import { DbObjectType, IResponseData } from '@/d.ts';
import { IDatabase } from '@/d.ts/database';
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
  environmentId?: number,
): Promise<IResponseData<IDatabase>> {
  const res = await request.get(`/api/v2/database/databases`, {
    params: {
      projectId,
      dataSourceId,
      name,
      page,
      size,
      environmentId,
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

export async function updateDataBase(databaseIds: number[], projectId: number): Promise<Boolean> {
  const res = await request.post(`/api/v2/database/databases/transfer`, {
    data: {
      databaseIds,
      projectId,
    },
  });
  return res?.data;
}

export async function getDatabase(databaseId: number): Promise<IDatabase> {
  const res = await request.get(`/api/v2/database/databases/${databaseId}`);
  return res?.data;
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
