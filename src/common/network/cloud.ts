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
