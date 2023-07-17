import { IOrganization } from '@/d.ts';
import request from '@/util/request';

export async function getOrganizationList(): Promise<IOrganization[]> {
  const res = await request.get('/api/v2/iam/users/me/organizations');
  return res?.data?.contents;
}
