import { ISynonym, SynonymType } from '@/d.ts';
import request from '@/util/request';
import { generateDatabaseSid, generateSynonymSid } from './pathUtil';

export async function getSynonymList(synonymType: SynonymType, dbName: string, sessionId: string) {
  const sid = generateDatabaseSid(dbName, sessionId);
  const res = await request.get(`/api/v1/synonym/list/${sid}`, {
    params: {
      synonymType,
    },
  });
  return res?.data;
}

export async function getSynonymCreateSQL(
  synonymName: string,
  synonym: Partial<ISynonym>,
  sessionId: string,
  dbName: string,
) {
  const sid = generateSynonymSid(synonymName, sessionId, dbName);

  const ret = await request.post(`/api/v1/synonym/getCreateSql/${sid}`, {
    data: synonym,
  });
  return ret?.data?.sql;
}

export async function getSynonym(
  synonymName: string,
  synonymType: SynonymType,
  sessionId: string,
  dbName: string,
) {
  const sid = generateSynonymSid(synonymName, sessionId, dbName);
  const ret = await request.get(`/api/v1/synonym/${sid}`, {
    params: {
      synonymType,
    },
  });
  return ret?.data;
}

export async function deleteSynonym(
  synonymName: string,
  synonymType: SynonymType,
  sessionId: string,
  dbName: string,
) {
  const sid = generateSynonymSid(synonymName, sessionId, dbName);
  const res = await request.delete(`/api/v1/synonym/${sid}`, {
    params: {
      synonymType: synonymType,
    },
  });

  return !!res?.data;
}
