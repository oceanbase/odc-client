import { SynonymType } from '@/d.ts';
import request from '@/util/request';
import { generateDatabaseSid } from './pathUtil';

export async function getSynonymList(synonymType: SynonymType) {
  const sid = generateDatabaseSid();
  const res = await request.get(`/api/v1/synonym/list/${sid}`, {
    params: {
      synonymType,
    },
  });
  return res?.data;
}
