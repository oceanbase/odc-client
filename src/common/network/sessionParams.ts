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

import { IConnectionProperty, IDatabaseSession } from '@/d.ts';
import { ConnectionPropertyType } from '@/d.ts/datasource';
import request from '@/util/request';
import { generateVarSid } from './pathUtil';

/**
 * 根据函数获取ddl sql
 */
export async function updateVariable(
  newData: IConnectionProperty,
  type: ConnectionPropertyType,
  sessionId?: string,
): Promise<boolean> {
  const sid = generateVarSid(type, sessionId);
  const { key, value } = newData;
  const url = `/api/v2/variables/update/${sid}`;

  const result = await request.post(url, {
    data: {
      changed: true,
      key,
      value,
    },
  });

  return result?.data;
}

export async function fetchVariableList(type: ConnectionPropertyType, sessionId: string) {
  const sid = generateVarSid(type, sessionId);
  const res = await request.get(`/api/v2/variables/list/${sid}`);
  return (
    res?.data?.contents?.map((p: IConnectionProperty) => {
      return {
        ...p,
        initialValue: p.value,
        modified: false,
      };
    }) || []
  );
}

export async function getDatabaseSessionList(sessionId: string): Promise<IDatabaseSession[]> {
  const res = await request.get(
    `/api/v1/dbsession/list/${generateVarSid(ConnectionPropertyType.GLOBAL, sessionId)}`,
  );
  return res?.data || [];
}

export async function killSessions(
  sessionIds: string[],
  datasourceId: number,
  killType: 'session' | 'query',
): Promise<
  {
    sessionId: number;
    killed: boolean;
    errorMessage?: string;
  }[]
> {
  const res = await request.post(`/api/v2/datasource/sessions/killSession`, {
    data: {
      sessionIds,
      datasourceId,
      killType,
    },
  });
  return res?.data;
}
