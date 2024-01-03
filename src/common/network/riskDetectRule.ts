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

import { IRiskDetectRule, RiskDetectRuleCondition, RootNode } from '@/d.ts/riskDetectRule';
import { IRiskLevel } from '@/d.ts/riskLevel';
import request from '@/util/request';

export async function updateRiskDetectRule(
  id: number,
  data: {
    riskLevelId: number;
    riskLevel: IRiskLevel;
    rootNode: RootNode;
  },
): Promise<boolean> {
  const res = await request.put(`/api/v2/regulation/riskDetectRules/${id}`, {
    data,
  });
  return res?.successful || false;
}

export async function listRiskDetectRules(
  params: Partial<{
    riskLevelId: number;
    name: string;
  }>,
): Promise<IRiskDetectRule> {
  const ret = await request.get(`/api/v2/regulation/riskDetectRules/`, {
    params,
  });
  return ret?.data?.contents?.[0];
}

export async function deleteRiskDetectRule(id: number): Promise<boolean> {
  const ret = await request.delete(`/api/v2/regulation/riskDetectRules/${id}`);
  return ret?.successful;
}

export async function createRiskDetectRules(
  data: Partial<{
    riskLevelId: number;
    riskLevel: IRiskLevel;
    rootNode: RootNode;
  }>,
): Promise<boolean> {
  const res = await request.post(`/api/v2/regulation/riskDetectRules`, {
    data,
  });
  return res?.successful || false;
}
