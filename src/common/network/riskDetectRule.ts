import { IRiskDetectRule, RiskDetectRuleCondition, RootNode } from '@/d.ts/riskDetectRule';
import { IRiskLevel } from '@/d.ts/riskLevel';
import request from '@/util/request';

export async function updateRiskDetectRule(
  id: number,
  data: {
  riskLevelId: number,
  riskLevel: IRiskLevel,
  rootNode: RootNode
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

export async function detailRiskDetectRule(id: number): Promise<IRiskDetectRule> {
  const ret = await request.get(`/api/v2/regulation/riskDetectRules/${id}`);
  return ret?.data;
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
