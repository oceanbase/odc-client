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
