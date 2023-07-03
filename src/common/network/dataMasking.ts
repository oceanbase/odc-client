import { IMaskingAlgorithm } from '@/d.ts/maskingAlgorithm';
import { MaskingPolicy } from '@/d.ts/maskingPolicy';
import { IMaskingPolicy, IMaskingRule, MaskingRule, MaskingRuleType } from '@/d.ts/maskRule';
import request from '@/util/request';

export async function updateMaskRule(id: number, maskRule: IMaskingRule): Promise<boolean> {
  const ret = await request.put(`/api/v2/mask/rules/${id}`, maskRule);
  return ret?.successful;
}
export async function updateMaskPolicy(
  id: number,
  maskingPolicy: IMaskingPolicy,
): Promise<boolean> {
  const ret = await request.put(`/api/v2/mask/policies/${id}`, maskingPolicy);
  return ret?.successful;
}

export async function test(maskingRule: IMaskingRule): Promise<boolean> {
  const ret = await request.post(`/api/v2/mask/rules/test`, maskingRule);
  return ret?.successful;
}

export async function setMaskRuleEnabled(id: number, enabled: boolean): Promise<boolean> {
  const ret = await request.post(`/api/v2/mask/rules/${id}/setEnabled`, {
    data: {
      enabled,
    },
  });
  return ret?.succesful;
}

export async function listMaskRules(
  params?: Partial<{
    name: string;
    enabled: boolean;
    ruleTypes: MaskingRuleType;
  }>,
) {
  const ret = await request.get(`/api/v2/mask/rules`, {}, params);
  return ret?.data?.contents;
}

export async function listMaskPolicies(): Promise<IMaskingPolicy> {
  const ret = await request.get(`/api/v2/mask/policies`);
  return ret?.data?.contents;
}

export async function exists(maskingPolicy: IMaskingPolicy): Promise<boolean> {
  const ret = await request.post(`/api/v2/mask/policies/exists`, maskingPolicy);
  return ret?.successful;
}

export async function detailMaskRule(id: number): Promise<MaskingRule> {
  const ret = await request.get(`/api/v2/mask/rules/${id}`);
  return ret?.data?.contents;
}

export async function detailMaskPolicy(id: number): Promise<MaskingPolicy> {
  const ret = await request.get(`/api/v2/mask/policies/${id}`);
  return ret?.data?.contents;
}

export async function deleteMaskRule(id: number): Promise<boolean> {
  const ret = await request.delete(`/api/v2/mask/rules/${id}`);
  return ret?.successful;
}

export async function deleteMaskPolicy(id: number): Promise<boolean> {
  const ret = await request.delete(`/api/v2/mask/policies/${id}`);
  return ret?.successful;
}

export async function createMaskRule(maskingAlgorithm: IMaskingAlgorithm): Promise<boolean> {
  const ret = await request.post(`/api/v2/sensitive/algorithms/`, maskingAlgorithm);
  return ret?.successful;
}

export async function createMaskPolicy(maskingAlgorithm: IMaskingAlgorithm): Promise<boolean> {
  const ret = await request.post(`/api/v2/sensitive/algorithms/`, maskingAlgorithm);
  return ret?.successful;
}
