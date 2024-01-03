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

import { IRiskLevel } from '@/d.ts/riskLevel';
import request from '@/util/request';

export async function updateRiskLevel(id: number, riskLevel: IRiskLevel): Promise<boolean> {
  const ret = await request.put(`/api/v2/regulation/risklevels/${id}`, {
    data: riskLevel,
  });
  return ret?.successful;
}

export async function listRiskLevels(): Promise<IRiskLevel[]> {
  const ret = await request.get(`/api/v2/regulation/risklevels`);
  return ret?.data?.contents;
}

export async function detailRiskLevel(id: number): Promise<IRiskLevel> {
  const ret = await request.get(`/api/v2/regulation/risklevels/${id}`);
  return ret?.data;
}
