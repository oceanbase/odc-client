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
