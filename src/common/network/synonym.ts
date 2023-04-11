import { SynonymType } from '@/d.ts';
import request from '@/util/request';
import { generateDatabaseSid } from './pathUtil';

export async function getSynonymList(synonymType: SynonymType, dbName: string, sessionId: string) {
  const sid = generateDatabaseSid(dbName, sessionId);
  const res = await request.get(`/api/v1/synonym/list/${sid}`, {
    params: {
      synonymType,
    },
  });
  return res?.data;
}
