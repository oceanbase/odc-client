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

import { ITriggerForm, TriggerState } from '@/d.ts';
import request from '@/util/request';
import { generateTriggerSid } from './pathUtil';

export async function setTriggerStatus(
  triggerName: string,
  enableState: TriggerState,
  sessionId: string,
  dbName: string,
) {
  const sid = generateTriggerSid(triggerName, sessionId, dbName);
  const res = await request.patch(`/api/v1/trigger/${sid}`, {
    data: {
      triggerName,
      enableState,
    },
  });
  return res?.data;
}

// 获取触发器详情
export async function getTriggerByName(triggerName: string, sessionId: string, dbName: string) {
  const sid = generateTriggerSid(triggerName, sessionId, dbName);
  const res = await request.get(`/api/v1/trigger/${sid}`);

  return res?.data;
}

export async function deleteTrigger(triggerName: string, sessionId: string, dbName: string) {
  const sid = generateTriggerSid(triggerName, sessionId, dbName);
  const ret = await request.delete(`/api/v1/trigger/${sid}`);
  return !ret?.isError;
}

export async function getTriggerCreateSQL(
  triggerName: string,
  trigger: Partial<ITriggerForm>,
  sessionId: string,
  dbName: string,
) {
  const sid = generateTriggerSid(triggerName, sessionId, dbName);

  const ret = await request.post(`/api/v1/trigger/getCreateSql/${sid}`, {
    data: trigger,
  });
  return ret?.data?.sql;
}
