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

import { ISQLLintReuslt } from '@/component/SQLLintResult/type';
import type { ISqlExecuteResult } from '@/d.ts';
import { EStatus, ISqlExecuteResultStatus } from '@/d.ts';
import { IUnauthorizedDatabase } from '@/d.ts/database';
import { IRule } from '@/d.ts/rule';
import modal from '@/store/modal';
import sessionManager from '@/store/sessionManager';
import request from '@/util/request';
import { generateDatabaseSid, generateSessionSid } from '../pathUtil';

export interface IExecuteSQLParams {
  sql: string;
  queryLimit?: number;
  showTableColumnInfo?: boolean;
  continueExecutionOnError?: boolean;
  fullLinkTraceEnabled?: boolean;
  tag?: string;
  /**
   * 是否拆分执行，传空的话像等于true
   */
  split?: boolean;
}
export interface ISQLExecuteTaskSQL {
  sqlTuple: {
    sqlId: string;
    originalSql: string;
    executedSql: string;
  };
  violatedRules: IRule[];
}
export interface ISQLExecuteTask {
  requestId: string;
  sqls: ISQLExecuteTaskSQL[];
  violatedRules: IRule[];
  unauthorizedDatabases: IUnauthorizedDatabase[];
}

/**
 * 包含拦截信息和执行结果
 */
export interface IExecuteTaskResult {
  hasLintResults?: boolean;
  invalid: boolean;
  executeSuccess: boolean;
  violatedRules: IRule[];
  executeResult: ISqlExecuteResult[];
  lintResultSet?: ISQLLintReuslt[];
  status?: EStatus;
  unauthorizedDatabases?: IUnauthorizedDatabase[];
  unauthorizedSql?: string;
}
class Task {
  public result: ISqlExecuteResult[] = [];
  public isFinish: boolean;
  public taskLoopInterval = 200;
  private timer = null;
  private isStop = false;
  constructor(public requestId: string, public sessionId: string) {}
  private fetchData = async () => {
    const res = await request.get(
      `/api/v2/datasource/sessions/${generateSessionSid(this.sessionId)}/sqls/getResult`,
      {
        params: {
          requestId: this.requestId,
        },
      },
    );
    if (res?.isError) {
      throw new Error(res?.errMsg);
    }
    return res?.data;
  };
  public getResult = async (): Promise<ISqlExecuteResult[]> => {
    return new Promise((resolve, reject) => {
      this._getResult(resolve);
    });
  };
  private _getResult = async (callback) => {
    if (this.isStop) {
      callback(null);
      return;
    }
    try {
      const data = await this.fetchData();
      if (data?.length) {
        callback(data);
      } else {
        this.timer = setTimeout(() => {
          this.taskLoopInterval = Math.min(3000, this.taskLoopInterval + 500);
          this._getResult(callback);
        }, this.taskLoopInterval);
      }
    } catch (e) {
      console.trace('get execute result fail', e);
      callback(null);
    }
  };
  public stopTask = () => {
    clearTimeout(this.timer);
    this.isStop = true;
  };
}
class TaskManager {
  public tasks: Task[] = [];
  public async stopAllTask() {
    this.tasks.forEach((task) => {
      task.stopTask();
    });
    this.tasks = [];
  }
  public async stopTask(sessionId: string) {
    this.tasks.forEach((task, index) => {
      if (task.sessionId === sessionId) {
        task.stopTask();
        this.tasks[index] = null;
      }
    });
    this.tasks = this.tasks.filter(Boolean);
  }
  public async addAndWaitTask(requestId: string, sessionId: string): Promise<ISqlExecuteResult[]> {
    const task = new Task(requestId, sessionId);
    this.tasks.push(task);
    try {
      const result = await task.getResult();
      this.tasks = this.tasks.filter((_task) => _task !== task);
      return result;
    } catch (e) {
      console.trace('sql task error', e);
    }
  }
}
export const executeTaskManager = new TaskManager();
/**
 *
 * @param params 要执行的SQL内容，可能为string或IExecuteSQLParams类型
 * @param sessionId 会话ID
 * @param dbName 数据库名称
 * @param needModal SQL确认弹窗，默认需要弹出
 * @returns
 */
export default async function executeSQL(
  params: IExecuteSQLParams | string,
  sessionId: string,
  dbName: string,
  needModal: boolean = true,
): Promise<IExecuteTaskResult> {
  const sid = generateDatabaseSid(dbName, sessionId);
  const serverParams =
    typeof params === 'string'
      ? {
          sid,
          sql: params,
        }
      : {
          sid,
          ...params,
        };
  const res = await request.post(`/api/v2/datasource/sessions/${sid}/sqls/asyncExecute`, {
    data: serverParams,
  });
  const taskInfo: ISQLExecuteTask = res?.data;
  const rootViolatedRules = taskInfo?.violatedRules?.reduce((pre, cur) => {
    if (cur?.violation) {
      return pre.concat({
        sqlTuple: {
          executedSql: cur?.violation?.text,
          offset: cur?.violation?.offset,
          originalSql: cur?.violation?.text,
        },
        violatedRules: [cur],
      });
    }
    return pre;
  }, []);
  const unauthorizedDatabases = taskInfo?.unauthorizedDatabases;
  const violatedRules = rootViolatedRules.concat(taskInfo?.sqls);
  if (unauthorizedDatabases?.length) {
    // 无权限库
    return {
      invalid: true,
      executeSuccess: false,
      executeResult: [],
      violatedRules: [],
      unauthorizedDatabases,
      unauthorizedSql: (params as IExecuteSQLParams)?.sql || (params as string),
    };
  }
  const lintResultSet = violatedRules?.reduce((pre, cur) => {
    if (Array.isArray(cur?.violatedRules) && cur?.violatedRules?.length > 0) {
      return pre.concat({
        sql: cur?.sqlTuple?.executedSql,
        violations: cur?.violatedRules?.map((item) => item?.violation),
      });
    } else {
      return pre;
    }
  }, []);
  /**
   * lintResultSet为空数组时，返回的status默认为submit
   */
  const status = getStatus(lintResultSet);
  // 没有requestId，即是被拦截了
  if (!taskInfo?.requestId) {
    // 一些场景下不需要弹出SQL确认弹窗
    if (!needModal) {
      return {
        hasLintResults: lintResultSet?.length > 0,
        invalid: true,
        executeSuccess: false,
        executeResult: [],
        violatedRules,
        lintResultSet,
        status,
      };
    }
    // 当status不为submit时
    if (status !== EStatus.SUBMIT) {
      modal.updateWorkSpaceExecuteSQLModalProps({
        sql: (params as IExecuteSQLParams)?.sql || (params as string),
        visible: true,
        sessionId,
        lintResultSet,
        status,
        onSave: () => {
          // 关闭SQL确认窗口打开新建数据库变更抽屉
          modal.updateWorkSpaceExecuteSQLModalProps();
          modal.changeCreateAsyncTaskModal(true, {
            sql: (params as IExecuteSQLParams)?.sql || (params as string),
            databaseId: sessionManager.sessionMap.get(sessionId).odcDatabase?.id,
            rules: lintResultSet,
          });
        },
        // 关闭SQL确认弹窗
        onCancel: () =>
          modal.updateWorkSpaceExecuteSQLModalProps({
            visible: false,
          }),
      });
    }
  }
  const requestId = taskInfo?.requestId;
  const sqls = taskInfo?.sqls;
  if (!requestId || !sqls?.length) {
    return null;
  }
  let results = await executeTaskManager.addAndWaitTask(requestId, sessionId);
  results = results?.map((result) => {
    if (!result.requestId) {
      result.requestId = requestId;
    }
    return result;
  });
  return {
    invalid: false,
    executeSuccess:
      !!results && !results?.find((result) => result.status !== ISqlExecuteResultStatus.SUCCESS),
    executeResult: results || [],
    violatedRules: [],
    lintResultSet,
    hasLintResults: lintResultSet?.length > 0,
    status,
  };
}

function getStatus(lintResultSet: ISQLLintReuslt[]) {
  if (Array.isArray(lintResultSet) && lintResultSet?.length) {
    const violations = lintResultSet.reduce((pre, cur) => {
      if (cur?.violations?.length === 0) {
        return pre;
      }
      return pre.concat(...cur?.violations);
    }, []);
    // 含有必须改进， 中断后续操作，禁止执行
    if (violations?.some((violation) => violation?.level === 2)) {
      return EStatus.DISABLED;
      //  全为无需改进，继续原有的后续操作
    } else if (violations?.every((violation) => violation?.level === 0)) {
      return EStatus.SUBMIT;
    } else {
      // 既不含必须改进，又不全是无需改进，需要发起审批
      return EStatus.APPROVAL;
    }
  }
  // 默认返回submit，不中断后续操作
  return EStatus.SUBMIT;
}
