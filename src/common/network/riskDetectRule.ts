import { IRiskDetectRule } from '@/d.ts/riskDetectRule';
import { IRiskLevel } from '@/d.ts/riskLevel';
import { ICondition } from '@/page/Secure/components/Condition';
import request from '@/util/request';

export async function updateRiskDetectRule(
  id: number,
  riskDetectRule: IRiskDetectRule,
): Promise<boolean> {
  const ret = await request.put(`/api/v2/regulation/riskDetectRules/${id}`, {
    data: riskDetectRule,
  });
  return ret?.successful;
}

export async function listRiskDetectRules(
  params: Partial<{
    riskLevelId: number;
    name: string;
  }>,
): Promise<IRiskDetectRule[]> {
  const ret = await request.get(`/api/v2/regulation/riskDetectRules/`, {
    params,
  });
  return ret?.data?.contents;
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
  params: Partial<{
    name: string;
    organizationId: number;
    conditions: ICondition[];
    riskLevelId: number;
    risklLevel: IRiskLevel;
    buitin: boolean;
  }>,
): Promise<boolean> {
  const ret = await request.post(`/api/v2/regulation/riskDetectRules`, {
    data: {
      ...params,
    },
  });
  return ret?.successful;
}
