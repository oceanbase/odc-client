import { IRecycleConfig, IRecycleObject } from '@/d.ts';
import request from '@/util/request';
import { generateDatabaseSid, generateSessionSid } from './pathUtil';

/**
 * 获取回收站保留时间
 */
export async function getRecyleKeepTime() {
  const res = await request.get(`/api/v1/recyclebin/getExpireTime/${generateSessionSid()}`);
  return res?.data;
}

export async function getRecycleConfig(sessionId: string): Promise<IRecycleConfig> {
  const res = await request.get(`/api/v1/recyclebin/settings/${generateSessionSid(sessionId)}`);
  return res?.data;
}

export async function updateRecycleConfig(
  config: Partial<IRecycleConfig>,
  sessionId: string,
): Promise<boolean> {
  const res = await request.patch(`/api/v1/recyclebin/settings`, {
    data: {
      sessionIds: [sessionId],
      settings: config,
    },
  });
  return !!res?.data;
}

export async function getPurgeAllSQL(sessionId: string, dbName: string) {
  const result = await request.patch(
    `/api/v1/recyclebin/getPurgeAllSql/${generateDatabaseSid(dbName, sessionId)}`,
  );
  return result?.data?.sql;
}

export async function getDeleteSQL(
  recycleObjects: IRecycleObject[],
  sessionId: string,
  dbName: string,
) {
  const sid = generateDatabaseSid(dbName, sessionId);
  const result = await request.patch(`/api/v1/recyclebin/getDeleteSql/${sid}`, {
    data: recycleObjects,
  });
  return result?.data?.sql;
}

export async function getUpdateSQL(
  recycleObjects: IRecycleObject[],
  sessionId: string,
  dbName: string,
) {
  const sid = generateDatabaseSid(dbName, sessionId);
  const result = await request.patch(`/api/v1/recyclebin/getUpdateSql/${sid}`, {
    data: recycleObjects,
  });
  return result?.data?.sql;
}
