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

import { IFunction } from '@/d.ts';
import request from '@/util/request';
import { generateFunctionSid } from './pathUtil';

/**
 * 根据函数获取ddl sql
 */
export async function getFunctionCreateSQL(
  funName: string,
  func: Partial<IFunction>,
  sessionId: string,
  dbName: string,
) {
  const sid = generateFunctionSid(funName, sessionId, dbName);
  const ret = await request.patch(`/api/v1/function/getCreateSql/${sid}`, {
    data: func,
  });
  return ret?.data?.sql;
}
