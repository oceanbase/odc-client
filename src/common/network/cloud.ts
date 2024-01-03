/*
 * Copyright 2024 OceanBase
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

export async function loadClusterList() {
  const getClusterList = window._odc_params?.service?.getClusterList;
  let res = null;
  if (typeof getClusterList === 'function') {
    res = await getClusterList({
      regionId: window._odc_params?.regionId,
    });
  }
  return res?.data?.instances;
}

export async function loadClusterTenants(clusterId: string) {
  const queryClusterTenantsAndZones = window._odc_params?.service?.queryClusterTenantsAndZones;
  let res = null;
  if (typeof queryClusterTenantsAndZones === 'function') {
    res = await queryClusterTenantsAndZones({
      regionId: window._odc_params?.regionId,
      clusterId,
    });
  }
  return res?.data?.tenants;
}

export async function loadTenantDBUsers(clusterId: string, tenantId: string) {
  const queryTenantUsers = window._odc_params?.service?.queryTenantUsers;
  let users = [];
  if (typeof queryTenantUsers === 'function') {
    users = await queryTenantUsers({
      regionId: window._odc_params?.regionId,
      clusterId,
      tenantId,
    });
  }
  return users;
}
