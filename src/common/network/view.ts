import request from '@/util/request';
import { sortString } from '@/util/utils';
import { generateDatabaseSid } from './pathUtil';

export async function getViewListByDatabaseName(databaseName?: string) {
  const sid = generateDatabaseSid(databaseName);
  const { data: views } = await request.get(`/api/v1/view/list/${sid}`);
  const sortedViews = (views || []).sort((a: any, b: any) => sortString(a.viewName, b.viewName));
  return sortedViews;
}

export async function getSystemViews(databaseName: string) {
  const sid = generateDatabaseSid(databaseName);
  const res = await request.get(
    `/api/v2/connect/sessions/${sid}/databases/${databaseName}/systemViews`,
  );
  return res?.data?.contents;
}
