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
import { IMaskingAlgorithm, MaskingAlgorithmType } from '@/d.ts/maskingAlgorithm';
import request from '@/util/request';

export async function testMaskingAlgorithm(
  maskingAlgorithmId: number,
  sample: string,
): Promise<IMaskingAlgorithm> {
  const ret = await request.post(
    `/api/v2/datasecurity/maskingAlgorithms/${maskingAlgorithmId}/test`,
    {
      params: {
        sample,
      },
    },
  );
  return ret?.data;
}

export async function listMaskingAlgorithm(
  params?: Partial<{
    name: string;
    type: MaskingAlgorithmType;
    sort: string;
    page: number;
    size: number;
  }>,
): Promise<IResponseData<IMaskingAlgorithm>> {
  const ret = await request.get(`/api/v2/datasecurity/maskingAlgorithms/`, { params });
  return ret?.data;
}

export async function detailMaskingAlgorithm(id: number): Promise<IMaskingAlgorithm> {
  const ret = await request.get(`/api/v2/datasecurity/maskingAlgorithms/${id}`);
  return ret?.data;
}
