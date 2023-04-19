import type { ISqlExecuteResult } from '@/d.ts';
import connection from '@/store/connection';
import request from '@/util/request';
import { message } from 'antd';
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

type TaskCallback = (result: ISqlExecuteResult[]) => void;

class Task {
  public result: ISqlExecuteResult[] = [];
  public isFinish: boolean;
  public taskLoopInterval = 200;
  private timer = null;
  private isStop = false;
  constructor(public requestId: string, public sessionId: string) {}

  private fetchData = async () => {
    const res = await request.get(
      `/api/v2/connect/sessions/${generateSessionSid(this.sessionId)}/sqls/getResult`,
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
  sessionId?: string,
  dbName?: string,
): Promise<ISqlExecuteResult[]> {
  if (connection.isDestroy) {
    message.error('Session is destroyed');
    return [];
  }
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

  const res = await request.post(`/api/v2/connect/sessions/${sid}/sqls/asyncExecute`, {
    data: serverParams,
  });

  const requestId = res?.data?.requestId;
  const sqls = res?.data?.sqls;
  if (!requestId || !sqls?.length) {
    return null;
  }
  let results = await executeTaskManager.addAndWaitTask(requestId, sessionId);
  results = results.map((result) => {
    if (!result.requestId) {
      result.requestId = requestId;
    }
    return result;
  });
  return results || [];
}
