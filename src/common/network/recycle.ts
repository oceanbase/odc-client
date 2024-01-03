/*
 * Copyright 2024 OceanBase
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

import { IRecycleConfig, IRecycleObject } from '@/d.ts';
import request from '@/util/request';
import { generateDatabaseSid, generateSessionSid } from './pathUtil';

/**
 * 获取回收站保留时间
 */
export async function getRecyleKeepTime() {
  const res = await request.get(`/api/v2/recyclebin/getExpireTime/${generateSessionSid()}`);
  return res?.data;
}

export async function getRecycleConfig(sessionId: string): Promise<IRecycleConfig> {
  const res = await request.get(`/api/v2/recyclebin/settings/${generateSessionSid(sessionId)}`);
  return res?.data;
}

export async function updateRecycleConfig(
  config: Partial<IRecycleConfig>,
  sessionId: string,
): Promise<boolean> {
  const res = await request.patch(`/api/v2/recyclebin/settings`, {
    data: {
      sessionIds: [sessionId],
      settings: config,
    },
  });
  return !!res?.data;
}

export async function getPurgeAllSQL(sessionId: string, dbName: string) {
  const result = await request.post(
    `/api/v2/recyclebin/purgeAll/${generateDatabaseSid(dbName, sessionId)}`,
  );
  return !!result?.data;
}

export async function getDeleteSQL(
  recycleObjects: IRecycleObject[],
  sessionId: string,
  dbName: string,
) {
  const sid = generateDatabaseSid(dbName, sessionId);
  const result = await request.post(`/api/v2/recyclebin/purge/${sid}`, {
    data: recycleObjects,
  });
  return !!result?.data;
}

export async function getUpdateSQL(
  recycleObjects: IRecycleObject[],
  sessionId: string,
  dbName: string,
) {
  const sid = generateDatabaseSid(dbName, sessionId);
  const result = await request.post(`/api/v2/recyclebin/flashback/${sid}`, {
    data: recycleObjects,
  });
  return !!result?.data;
}
