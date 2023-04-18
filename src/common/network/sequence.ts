import { ISequence } from '@/d.ts';
import request from '@/util/request';
import { generateSequenceSid } from './pathUtil';

export async function getSequenceCreateSQL(sequenceName: string, sequence: Partial<ISequence>) {
  const sid = generateSequenceSid(sequenceName);
  const ret = await request.patch(`/api/v1/sequence/getCreateSql/${sid}`, {
    data: sequence,
  });
  return ret?.data?.sql;
}

export async function getSequenceUpdateSQL(sequenceName: string, sequence: Partial<ISequence>) {
  const sid = generateSequenceSid(sequenceName);
  const ret = await request.patch(`/api/v1/sequence/getUpdateSql/${sid}`, {
    data: { ...sequence, name: sequenceName },
  });
  return ret?.data?.sql;
}

export async function getSequence(sequenceName: string, sessionId: string, dbName: string) {
  const sid = generateSequenceSid(sequenceName, sessionId, dbName);
  const res = await request.get(`/api/v1/sequence/${sid}`);
  return res?.data;
}

export async function deleteSequence(sequenceName: string, sessionId: string, dbName: string) {
  const sid = generateSequenceSid(sequenceName, sessionId, dbName);
  const res = await request.delete(`/api/v1/sequence/${sid}`);
  return !res?.isError;
}
