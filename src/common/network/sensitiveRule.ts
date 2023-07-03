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
): Promise<ISensitiveRule[]> {
  const ret = await request.get(`/api/v2/collaboration/projects/${projectId}/sensitiveRules/`, {
    params,
  });
  return ret?.data?.contents;
}

export async function exists(
  projectId: number,
  params?: Partial<{
    name: string;
  }>,
): Promise<ISensitiveRule> {
  const ret = await request.post(
    `/api/v2/collaboration/projects/${projectId}/sensitiveRules/exists`,
    {},
    params,
  );
  return ret?.data?.contents;
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
