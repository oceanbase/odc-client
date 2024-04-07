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

import { IEnvironment } from '@/d.ts/environment';
import request from '@/util/request';

export async function listEnvironments(
  params?: Partial<{
    enabled: boolean;
    sort: string;
    page: number;
    size: number;
  }>,
): Promise<IEnvironment[]> {
  const ret = await request.get(`/api/v2/collaboration/environments`, { params });
  return ret?.data?.contents || [];
}
/**
 * 新建自定义环境
 * @param data
 * @returns
 */
export async function createEnvironment(data: Partial<IEnvironment>): Promise<IEnvironment> {
  const res = await request.post(`/api/v2/collaboration/environments`, {
    data,
  });
  return res;
}
/**
 * 删除自定义环境
 * @param environmentId
 * @returns
 */
export async function deleteEnvironment(environmentId: number): Promise<boolean> {
  const res = await request.delete(`/api/v2/collaboration/environments/${environmentId}`);
  return res?.successful;
}
/**
 * 更新自定义环境
 * @param environmentId
 * @param data
 * @returns
 */
export async function updateEnvironment(
  environmentId: number,
  data: Pick<IEnvironment, 'description' | 'style'>,
): Promise<IEnvironment> {
  const res = await request.put(`/api/v2/collaboration/environments/${environmentId}`, {
    data,
  });
  return res;
}
/**
 * 修改环境的启用状态
 * @param environmentId
 * @param enabled
 * @returns
 */
export async function setEnabled(environmentId: number, enabled: boolean) {
  const res = await request.post(`/api/v2/collaboration/environments/${environmentId}/setEnabled`, {
    data: {
      enabled,
    },
  });
  return res?.successful;
}

/**
 * 环境名场重复校验接口
 * @param environmentName 环境名称
 * @returns
 */
export async function getEnvironmentExists(environmentName: string): Promise<{
  errorMessage: string;
  exists: boolean;
}> {
  const res = await request.post(`/api/v2/collaboration/environments/exists`, {
    params: {
      name: environmentName,
    },
  });
  return res?.data;
}
