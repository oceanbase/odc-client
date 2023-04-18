import { IFunction } from '@/d.ts';
import request from '@/util/request';
import { generateFunctionSid } from './pathUtil';

/**
 * 根据函数获取ddl sql
 */
export async function getFunctionCreateSQL(funName: string, func: Partial<IFunction>) {
  const sid = generateFunctionSid(funName);
  const ret = await request.patch(`/api/v1/function/getCreateSql/${sid}`, {
    data: func,
  });
  return ret?.data?.sql;
}

export async function deleteFunction(funName: string, sessionId: string, dbName: string) {
  const sid = generateFunctionSid(funName, sessionId, dbName);
  const res = await request.delete(`/api/v1/function/${sid}`);
  return !res?.isError;
}
