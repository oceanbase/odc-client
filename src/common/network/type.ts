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

import { ITypeForm } from '@/d.ts';
import request from '@/util/request';
import { generateDatabaseSid, generateTypeSid } from './pathUtil';

export async function getTypeList(dbName: string, sessionId: string) {
  const sid = generateDatabaseSid(dbName, sessionId);
  const res = await request.get(`/api/v1/type/list/${sid}`);
  return res?.data;
}

export async function getType(
  typeName: string,
  ignoreError?: boolean,
  dbName?: string,
  sessionId?: string,
) {
  const sid = generateTypeSid(typeName, sessionId, dbName);
  const res = await request.get(`/api/v1/type/${sid}`, {
    params: {
      ignoreError,
    },
  });
  return res?.data;
}

export async function getTypeCreateSQL(
  typeName: string,
  type: Partial<ITypeForm>,
  sessionId: string,
  dbName: string,
) {
  const sid = generateTypeSid(typeName, sessionId, dbName);
  const res = await request.post(`/api/v1/type/getCreateSql/${sid}`, {
    data: type,
  });
  return res?.data?.sql;
}
