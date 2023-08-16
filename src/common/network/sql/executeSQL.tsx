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

import RuleResult from '@/component/SQLLintResult/RuleResult';
import { ISqlExecuteResultStatus } from '@/d.ts';
import type { ISqlExecuteResult } from '@/d.ts';
import { IRule } from '@/d.ts/rule';
import modal from '@/store/modal';
import sessionManager from '@/store/sessionManager';
import { formatMessage } from '@/util/intl';
import request from '@/util/request';
import { Modal, message } from 'antd';
import { generateDatabaseSid, generateSessionSid } from '../pathUtil';
export interface IExecuteSQLParams {
  sql: string;
  queryLimit?: number;
  showTableColumnInfo?: boolean;
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
  unauthorizedDatabaseNames: string[];
}

/**
 * 包含拦截信息和执行结果
 */
export interface IExecuteTaskResult {
  invalid: boolean;
  executeSuccess: boolean;
  violatedRules: ISQLExecuteTaskSQL['violatedRules'];
  executeResult: ISqlExecuteResult[];
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
export default async function executeSQL(
  params: IExecuteSQLParams | string,
  sessionId: string,
  dbName: string,
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
  const rootViolatedRules = taskInfo?.violatedRules || [];
  const unauthorizedDatabaseNames = taskInfo?.unauthorizedDatabaseNames;
  const violatedRules = taskInfo?.sqls?.reduce((prev, current) => {
    return prev.concat(current?.violatedRules || []);
  }, rootViolatedRules);
  if (unauthorizedDatabaseNames?.length) {
    /**
     * 无权限库
     */
    const dbNames = unauthorizedDatabaseNames.join(', ');
    message.error(
      formatMessage(
        {
          id: 'odc.src.common.network.sql.UnprofessionalAccessDbnames',
        },
        {
          dbNames: dbNames,
        },
      ), //`无权限访问 ${dbNames} 数据库`
    );
    return {
      invalid: true,
      executeSuccess: false,
      executeResult: [],
      violatedRules: [],
    };
  }
  if (violatedRules?.length) {
    /**
     * 拦截
     * level = 1: 发起审批
     * level = 2: 拒绝执行
     */
    const session = sessionManager.sessionMap.get(sessionId);
    const isBan = violatedRules?.find((rule) => rule.level === 2);
    if (isBan) {
      Modal.error({
        title: formatMessage({
          id: 'odc.network.sql.executeSQL.ThisOperationHasBeenBlocked',
        }),
        //该操作已被以下规则拦截
        content: <RuleResult data={violatedRules} />,
      });
    }
    !isBan &&
      modal.changeCreateAsyncTaskModal(true, {
        sql: serverParams.sql,
        databaseId: session?.database?.databaseId,
        rules: violatedRules,
      });
    return {
      invalid: true,
      executeSuccess: false,
      executeResult: [],
      violatedRules: violatedRules,
    };
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
  };
}
