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
