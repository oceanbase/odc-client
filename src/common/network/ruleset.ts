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
import { IRule, IRuleSet, RuleType } from '@/d.ts/rule';
import request from '@/util/request';

export async function updateRule(rulesetId: number, ruleId: number, rule: IRule): Promise<boolean> {
  const ret = await request.put(`/api/v2/regulation/rulesets/${rulesetId}/rules/${ruleId}`, {
    data: rule,
  });
  return ret?.successful;
}

export async function listRules(rulesetId: number, params: any): Promise<IResponseData<IRule>> {
  const ret = await request.get(`/api/v2/regulation/rulesets/${rulesetId}/rules`, {
    params,
  });
  return ret?.data;
}

export async function getRule(rulesetId: number, ruleId: number): Promise<IRule> {
  const ret = await request.get(`/api/v2/regulation/rulesets/${rulesetId}/rules/${ruleId}`);
  return ret?.data;
}

export async function statsRules(rulesetId: number, type: RuleType) {
  const rawData = await request.get(`/api/v2/regulation/rulesets/${rulesetId}/rules/stats`, {
    params: {
      type: [type],
    },
  });
  return rawData?.data;
}
