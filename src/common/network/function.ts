import { IFunction } from '@/d.ts';
import request from '@/util/request';
import { generateFunctionSid } from './pathUtil';

/**
 * 根据函数获取ddl sql
 */
export async function getFunctionCreateSQL(
  funName: string,
  func: Partial<IFunction>,
  sessionId: string,
  dbName: string,
) {
  const sid = generateFunctionSid(funName, sessionId, dbName);
  const ret = await request.patch(`/api/v1/function/getCreateSql/${sid}`, {
    data: func,
  });
  return ret?.data?.sql;
}
