import { IRecycleConfig } from '@/d.ts';
import connection from '@/store/connection';
import request from '@/util/request';
import { generateSessionSid } from './pathUtil';

/**
 * 获取回收站保留时间
 */
export async function getRecyleKeepTime() {
  const res = await request.get(`/api/v1/recyclebin/getExpireTime/${generateSessionSid()}`);
  return res?.data;
}

export async function getRecycleConfig(): Promise<IRecycleConfig> {
  const res = await request.get(`/api/v1/recyclebin/settings/${generateSessionSid()}`);
  return res?.data;
}

export async function updateRecycleConfig(config: Partial<IRecycleConfig>): Promise<boolean> {
  const res = await request.patch(`/api/v1/recyclebin/settings`, {
    data: {
      sessionIds: connection.getAllSessionIds(),
      settings: config,
    },
  });
  return !!res?.data;
}
