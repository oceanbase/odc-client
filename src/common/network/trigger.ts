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
