import request from '@/util/request';

export async function switchCurrentOrganization(toOrganizationId: number): Promise<Boolean> {
  const res = await request.post(`/api/v2/iam/switchOrganization`, {
    data: {
      toOrganizationId: toOrganizationId,
    },
  });
  return !!res?.data;
}
