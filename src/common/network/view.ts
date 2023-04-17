import { IView } from '@/d.ts';
import request from '@/util/request';
import { sortString } from '@/util/utils';
import { generateDatabaseSid, generateViewSid } from './pathUtil';

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

export async function getView(viewName: string, sessionId: string, dbName: string): Promise<IView> {
  const sid = generateViewSid(viewName, dbName, sessionId);
  const res = await request.get(`/api/v1/view/${sid}`);
  return res?.data;
}

export async function deleteView(viewName: string, sessionId: string, dbName: string) {
  const sid = generateViewSid(viewName, dbName, sessionId);
  const res = await request.delete(`/api/v1/view/${sid}`);
  return !res?.isError;
}
