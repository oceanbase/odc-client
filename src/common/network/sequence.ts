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

import { ISequence } from '@/d.ts';
import request from '@/util/request';
import { generateSequenceSid } from './pathUtil';

export async function getSequenceCreateSQL(
  sequenceName: string,
  sequence: Partial<ISequence>,
  sessionId: string,
  dbName: string,
) {
  const sid = generateSequenceSid(sequenceName, sessionId, dbName);
  const ret = await request.patch(`/api/v1/sequence/getCreateSql/${sid}`, {
    data: sequence,
  });
  return ret?.data?.sql;
}

export async function getSequenceUpdateSQL(
  sequenceName: string,
  sequence: Partial<ISequence>,
  sessionId: string,
  dbName: string,
) {
  const sid = generateSequenceSid(sequenceName, sessionId, dbName);
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
