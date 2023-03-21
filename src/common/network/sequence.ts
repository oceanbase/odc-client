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
