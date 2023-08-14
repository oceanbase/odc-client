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

import request from '@/util/request';

export async function getOBCloudClusterList() {
  const ret = await request.get(`/api/v2/cloud/metadata/clusters`);
  return ret?.data?.contents;
}

export async function getOBCloudTenantListByCluster(clusterId: string) {
  const ret = await request.get(`/api/v2/cloud/metadata/clusters/${clusterId}/tenants`);
  return ret?.data?.contents;
}

export async function getOBCloudUserListByTenant(clusterId: string, tenantId: string) {
  const ret = await request.get(
    `/api/v2/cloud/metadata/clusters/${clusterId}/tenants/${tenantId}/users`,
  );
  return ret?.data?.contents;
}
