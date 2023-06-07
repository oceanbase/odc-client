import { IResponseData } from '@/d.ts';
import { IDatabase } from '@/d.ts/database';
import request from '@/util/request';

export async function listDatabases(
  projectId: number,
  dataSourceId: number,
  page: number,
  size: number,
  name?: string,
): Promise<IResponseData<IDatabase>> {
  const res = await request.get(`/api/v2/database/databases`, {
    params: {
      projectId,
      dataSourceId,
      name,
      page,
      size,
    },
  });

  return res?.data;
}

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export async function createDataBase(database: DeepPartial<IDatabase>): Promise<Boolean> {
  const res = await request.post(`/api/v2/database/databases`, {
    data: database,
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
