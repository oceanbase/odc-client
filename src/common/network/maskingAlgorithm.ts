import { IMaskingAlgorithm, MaskingAlgorithmType } from '@/d.ts/maskingAlgorithm';
import request from '@/util/request';

export async function testMaskingAlgorithm(
  maskingAlgorithm: IMaskingAlgorithm,
): Promise<IMaskingAlgorithm> {
  const ret = await request.post(`/api/v2/datasecurity/maskingAlgorithms/test`, {
    data: {
      ...maskingAlgorithm,
    },
  });
  return ret?.data;
}

export async function listMaskingAlgorithm(
  params?: Partial<{
    name: string;
    type: MaskingAlgorithmType;
  }>,
): Promise<IMaskingAlgorithm[]> {
  const ret = await request.get(`/api/v2/datasecurity/maskingAlgorithms/`, {}, params);
  return ret?.data?.contents;
}

export async function detailMaskingAlgorithm(id: number): Promise<IMaskingAlgorithm> {
  const ret = await request.get(`/api/v2/datasecurity/maskingAlgorithms/${id}`);
  return ret?.data;
}
