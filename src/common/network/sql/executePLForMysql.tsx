import type { IExecutingInfo } from '@/d.ts';
import request from '@/util/request';
import { generateDatabaseSid } from '../pathUtil';
import {
  executeSQLPreHandle,
  IExecutePLForMysqlParams,
  IExecuteTaskResult,
  ISQLExecuteTask,
} from './preHandle';

/**
 * Mysql 类型编辑 PL
 * @param params 要执行的SQL内容，IExecutePLForMysqlParams类型
 * @param sessionId 会话ID
 * @param dbName 数据库名称
 * @returns
 */
export default async function executePLForMysql(
  params: IExecutePLForMysqlParams,
  sessionId?: string,
  dbName?: string,
  onUpdate: (info: IExecutingInfo) => void = () => {},
): Promise<IExecuteTaskResult> {
  const sid = generateDatabaseSid(dbName, sessionId);
  const res = await request.post(`/api/v2/pl/editPL/${sid}`, {
    data: params,
  });
  const taskInfo: ISQLExecuteTask = res?.data;
  const { data } = res;
  const needModal = res?.successful && data?.errorMessage === null && data?.approvalRequired;
  const {
    pass,
    data: preHandleData,
    lintResultSet,
    status,
  } = executeSQLPreHandle(
    taskInfo,
    { ...params, wrappedSql: data?.wrappedSql },
    needModal,
    sessionId,
    true,
  );
  if (!pass) {
    return {
      errorMessage: res?.data?.errorMessage,
      approvalRequired: res?.data?.approvalRequired,
      ...preHandleData,
    };
  }
  return {
    invalid: false,
    errorMessage: res?.data?.errorMessage,
    approvalRequired: res?.data?.approvalRequired,
    executeSuccess: true,
    executeResult: [],
    violatedRules: [],
    lintResultSet,
    hasLintResults: lintResultSet?.length > 0,
    status,
  };
}
