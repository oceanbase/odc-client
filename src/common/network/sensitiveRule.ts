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

import { IResponseData } from '@/d.ts';
import { ISensitiveRule, SensitiveRuleType } from '@/d.ts/sensitiveRule';
import request from '@/util/request';

export async function updateSensitiveRule(
  projectId: number,
  id: number,
  sensitiveRule: ISensitiveRule,
): Promise<boolean> {
  const ret = await request.put(
    `/api/v2/collaboration/projects/${projectId}/sensitiveRules/${id}`,
    {
      data: sensitiveRule,
    },
  );
  return ret?.successful;
}

export async function setEnabled(
  projectId: number,
  id: number,
  enabled: boolean,
): Promise<boolean> {
  const ret = await request.post(
    `/api/v2/collaboration/projects/${projectId}/sensitiveRules/${id}/setEnabled`,
    {
      data: { enabled },
    },
  );
  return ret?.successful;
}

export async function listSensitiveRules(
  projectId: number,
  params?: Partial<{
    name: string;
    type: SensitiveRuleType;
    maskingAlgorith: number[];
    enabled: boolean[];
  }>,
): Promise<IResponseData<ISensitiveRule>> {
  const ret = await request.get(`/api/v2/collaboration/projects/${projectId}/sensitiveRules/`, {
    params,
  });
  return ret?.data;
}

export async function detailSensitiveRule(projectId: number, id: number): Promise<ISensitiveRule> {
  const ret = await request.get(`/api/v2/collaboration/projects/${projectId}/sensitiveRules/${id}`);
  return ret?.data;
}

export async function deleteSensitiveRule(projectId: number, id: number): Promise<boolean> {
  const ret = await request.delete(
    `/api/v2/collaboration/projects/${projectId}/sensitiveRules/${id}`,
  );
  return ret?.successful;
}

export async function createSensitiveRule(
  projectId: number,
  sensitiveRule: Partial<ISensitiveRule>,
): Promise<boolean> {
  const ret = await request.post(`/api/v2/collaboration/projects/${projectId}/sensitiveRules/`, {
    data: sensitiveRule,
  });
  return ret?.successful;
}
