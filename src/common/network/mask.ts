import { IMaskPolicy, IResponseData } from '@/d.ts';
import request from '@/util/request';

/**
 * 新建脱敏策略
 */
export async function createMaskPolicy(data: Partial<IMaskPolicy>): Promise<IMaskPolicy> {
  const result = await request.post('/api/v2/mask/policies', {
    data,
  });
  return result?.data;
}

/**
 * 删除脱敏策略
 */
export async function deleteMaskPolicy(id: number): Promise<IMaskPolicy> {
  const result = await request.delete(`/api/v2/mask/policies/${id}`);
  return result?.data;
}

/**
 * 更新脱敏策略
 */
export async function updateMaskPolicy(data: Partial<IMaskPolicy>): Promise<IMaskPolicy> {
  const result = await request.put(`/api/v2/mask/policies/${data.id}`, {
    data,
  });
  return result?.data;
}

/**
 * 获取脱敏策略详情
 */
export async function getMaskPolicy(id: number): Promise<IMaskPolicy> {
  const result = await request.get(`/api/v2/mask/policies/${id}`);
  return result?.data;
}

/**
 * 获取脱敏策略列表
 */
export async function getMaskPolicyList(params?: {
  nameLike?: string;
  status?: boolean[];
  sort?: string;
  page?: number;
  size?: number;
}): Promise<IResponseData<IMaskPolicy>> {
  const result = await request.get('/api/v2/mask/policies', {
    params,
  });
  return result?.data;
}

/**
 * 获取脱敏策略名称是否重复
 */
export async function getMaskPolicyExists(name: string): Promise<boolean> {
  const result = await request.post(`/api/v2/mask/policies/exists`, {
    data: {
      name,
    },
  });
  return result?.data;
}
