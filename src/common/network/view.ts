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

import { ICreateView, IView } from '@/d.ts';
import request from '@/util/request';
import { sortString } from '@/util/utils';
import { generateDatabaseSid, generateViewSid } from './pathUtil';

export async function getViewListByDatabaseName(databaseName?: string, sessionId?: string) {
  const sid = generateDatabaseSid(databaseName, sessionId);
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

export async function getViewCreateSQL(view: ICreateView, sessionId, dbName) {
  const { viewName } = view;
  const sid = generateViewSid(viewName, dbName, sessionId);
  const ret = await request.patch(`/api/v1/view/getCreateSql/${sid}`, {
    data: view,
  });
  return ret?.data?.sql;
}
