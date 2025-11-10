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
import { IResourceDependencyParams, IResourceDependency } from '@/d.ts/relativeResource';
import request from '@/util/request';

/**
 * 获取资源依赖信息
 * @param params 查询参数
 * @returns Promise<IResourceDependency>
 */
export async function getResourceDependencies(
  params: IResourceDependencyParams,
): Promise<IResourceDependency> {
  const result = await request.get('/api/v2/resourceDependency/', {
    params,
  });
  const data = result?.data || {
    scheduleDependencies: [],
    scheduleTaskDependencies: [],
    flowDependencies: [],
  };
  if (result.successful) {
    return {
      successful: result.successful,
      data,
    };
  }
  return result;
}
