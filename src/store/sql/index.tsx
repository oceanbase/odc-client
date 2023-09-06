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

import { generateDatabaseSid } from '@/common/network/pathUtil';
import { executeSQL, stopExec } from '@/common/network/sql';
import { IExecuteTaskResult } from '@/common/network/sql/executeSQL';
import { PLType } from '@/constant/plType';
import {
  ConnectionMode,
  IFormatPLSchema,
  ILogItem,
  IPLCompileResult,
  IPLExecResult,
  IResultSet,
  ISqlExecuteResult,
  ISqlExecuteResultStatus,
  ISQLExplainTreeNode,
} from '@/d.ts';
import { formatMessage } from '@/util/intl';
import request from '@/util/request';
import { generateUniqKey } from '@/util/utils';
import { message } from 'antd';
import { clone, isNil } from 'lodash';
import { action, observable, runInAction } from 'mobx';
import { generateResultSetColumns } from '../helper';
import sessionManager from '../sessionManager';
export enum ExcecuteSQLMode {
  PL = 'PL',
  TABLE = 'TABLE',
  SQL = 'SQL',
  TRIGGER = 'TRIGGER',
  SYNONYM = 'SYNONYM',
  TYPE = 'TYPE',
}
export enum PL_RUNNING_STATUS {
  // @ts-ignore
  COMPILE = formatMessage({
    id: 'odc.src.store.sql.Compile',
  }),
  // @ts-ignore
  EXEC = formatMessage({
    id: 'odc.src.store.sql.Run',
  }),
  // @ts-ignore
  DEBUG = formatMessage({
    id: 'odc.src.store.sql.Debugging',
  }),
}
export class SQLStore {
  @observable.shallow
  public records: ISqlExecuteResult[] = [];
  @observable.shallow
  public resultSets: Map<string, IResultSet[]> = new Map();
  @observable.shallow
  public lockedResultSets: IResultSet[] = []; // 编译|运行|调试中的 PL 对象 name, state

  /** 正在执行提交的Page */
  @observable
  public commitingPageKey: Set<string> = new Set();

  /** 正在执行回滚的Page */
  @observable
  public rollbackPageKey: Set<string> = new Set();

  /** 停止中的page */
  @observable
  public stopingPageKey: Set<string> = new Set();

  /** 执行SQL中的page */
  @observable
  public runningPageKey: Set<string> = new Set();

  /** 是否正在执行SQL片段 */
  @observable
  public isRunningSection: Set<string> = new Set();

  /** 是否正在编译 */
  @observable
  public isCompiling: boolean = false;

  public debugLogs: ILogItem[] = [];

  @action
  public deleteRecords(keys: string[]) {
    this.records = this.records.filter((record) => {
      return !keys.includes(record.id);
    });
  }

  @action
  public async commit(pageKey: string, sessionId: string, dbName: string) {
    try {
      if (!sessionId) {
        return;
      }
      runInAction(() => {
        this.commitingPageKey.add(pageKey);
      });
      const data = await executeSQL('commit;', sessionId, dbName);
      sessionManager.sessionMap.get(sessionId)?.initSessionStatus();
      if (data?.executeResult?.[0].status === ISqlExecuteResultStatus.SUCCESS) {
        message.success(
          formatMessage({ id: 'odc.src.store.sql.SubmittedSuccessfully' }), //提交成功
        );
      }
    } finally {
      this.commitingPageKey.delete(pageKey);
    }
  }

  @action
  public async rollback(pageKey: string, sessionId: string, dbName: string) {
    try {
      if (!sessionId) {
        return;
      }
      this.rollbackPageKey.add(pageKey);
      const data = await executeSQL('rollback;', sessionId, dbName);
      sessionManager.sessionMap.get(sessionId)?.initSessionStatus();
      if (data?.executeResult?.[0].status === ISqlExecuteResultStatus.SUCCESS) {
        message.success(
          formatMessage({ id: 'odc.src.store.sql.RollbackSucceeded' }), //回滚成功
        );
      }
    } finally {
      this.rollbackPageKey.delete(pageKey);
    }
  }

  @action
  public async stopExec(pageKey: string, sessionId: string) {
    try {
      this.stopingPageKey.add(pageKey);
      const data = await stopExec(sessionId);

      if (data) {
        message.success(
          formatMessage({ id: 'odc.src.store.sql.StoppedSuccessfully' }), //停止成功
        );
      }
    } finally {
      this.stopingPageKey.delete(pageKey);
    }
  }

  @action
  public async executeSQL(
    sql: string = '',
    pageKey: string,
    isSection: boolean,
    sessionId: string,
    dbName: string,
  ): Promise<IExecuteTaskResult> {
    if (!this.resultSets.has(pageKey)) {
      this.resultSets.set(pageKey, []);
    }

    let record: IExecuteTaskResult; // 需要忽略默认错误处理
    const session = sessionManager.sessionMap.get(sessionId);
    try {
      this.runningPageKey.add(pageKey);
      !!isSection && this.isRunningSection.add(pageKey);
      const showTableColumnInfo = session?.params?.tableColumnInfoVisible;
      record = await executeSQL(
        {
          sql,
          queryLimit: session?.params.queryLimit || undefined,
          showTableColumnInfo,
        },
        sessionId,
        dbName,
      );
    } catch (e) {
      throw e;
    } finally {
      this.runningPageKey.delete(pageKey);
      this.isRunningSection.delete(pageKey);
    }

    // 兼容后端不按约定返回的情况
    if (!record || record.invalid) {
      return record;
    }
    /**
     * 刷新一下delimiter
     */
    session.initSessionStatus();

    // 判断结果集是否支持编辑
    // TODO: 目前后端判断是否支持接口非常慢，因此只能在用户点击 “开启编辑” 时发起查询，理想状态肯定是在结果集返回结构中直接表示是否支持
    // const isEditable = await this.isResultSetEditable(sql);
    runInAction(() => {
      // 加入历史记录
      /** Record去除rows,性能优化 */
      const recordWithoutRows = record.executeResult.map((result) => {
        return {
          ...result,
          rows: [],
        };
      });
      this.records = [
        ...recordWithoutRows.reverse().map((r, index) => {
          return { ...r, id: generateUniqKey() };
        }),
        ...this.records,
      ]; // 处理结果集，需要保留已锁定的结果集

      const resultSet = this.resultSets.get(pageKey);

      if (resultSet) {
        const lockedResultSets = resultSet.filter((r) => r.locked); // @ts-ignore
        resultSet.forEach((r) => {
          if (!r.locked) {
            /**
             * chrome会缓存卸载后的含有react组件的dom，导致数据无法释放，这边手动清空，防止内存爆满
             */
            r.rows.splice(0);
          }
        });
        this.resultSets.set(pageKey, [
          ...lockedResultSets,
          this.getLogTab(record.executeResult),
          ...generateResultSetColumns(record.executeResult, session?.connection?.dialectType),
        ]);
      }
    });
    return record;
  }

  public getLogTab(record: ISqlExecuteResult[]): IResultSet {
    return {
      type: 'LOG',
      uniqKey: generateUniqKey(),
      columns: [],
      rows: [],
      initialSql: '',
      locked: false,
      // 是否支持编辑
      editable: false,
      isQueriedEditable: false,
      logTypeData: record?.map((item) => {
        return {
          status: item.status,
          total: item.columns?.length ? 0 : item.total,
          track: item.track,
          dbmsOutput: item.dbmsOutput,
          executeSql: item.executeSql,
          statementWarnings: item.statementWarnings,
          sqlType: item.sqlType,
          checkViolations: item.checkViolations,
        };
      }),
    };
  }

  // 解析 PL
  @action
  public async parsePL(sql: string, sessionId, dbName) {
    const sid = generateDatabaseSid(dbName, sessionId);
    const res = await request.put(`/api/v1/pl/parsePLNameType/${sid}`, {
      data: {
        sql,
      },
    });
    return res?.data;
  } // 编译 PL

  @action
  public async compilePL(
    plName: string,
    obDbObjectType: string,
    sessionId,
    dbName,
  ): Promise<IPLCompileResult> {
    const sid = generateDatabaseSid(dbName, sessionId);
    const res = await request.post(`/api/v1/pl/compile/${sid}`, {
      data: { obDbObjectType, plName },
    });
    return res && res.data;
  }

  @action
  public async batchCompilePL(params: {
    scope?: string;
    objectType?: string;
    PLIdentities?: {
      obDbObjectType: string;
      plName: string;
    }[];
    sessionId?: string;
    dbName: string;
  }) {
    const sid = generateDatabaseSid(params.dbName, params.sessionId);
    const res = await request.post(
      `/api/v2/connect/sessions/${sid}/currentDatabase/batchCompilations`,
      {
        data: params,
      },
    );
    return res?.data;
  }

  @action
  public async getBatchCompilePLResult(id: string, sessionId: string, dbName: string) {
    const sid = generateDatabaseSid(dbName, sessionId);
    const res = await request.get(
      `/api/v2/connect/sessions/${sid}/currentDatabase/batchCompilations/${id}`,
    );
    return res?.data;
  }

  @action
  public async deleteBatchCompilePL(id: string, sessionId: string, dbName: string) {
    const sid = generateDatabaseSid(dbName, sessionId);
    const res = await request.delete(
      `/api/v2/connect/sessions/${sid}/currentDatabase/batchCompilations/${id}`,
    );
    return res?.data;
  }

  // 运行 PL
  @action
  public async execPL(
    plSchema: IFormatPLSchema,
    anonymousBlockDdl?: string,
    ignoreError?: boolean,
    sessionId?: string,
    dbName?: string,
  ): Promise<IPLExecResult> {
    const sid = generateDatabaseSid(dbName, sessionId);
    const { plName } = plSchema;
    let res;
    let dbms;
    if (plSchema.plType === PLType.PROCEDURE) {
      res = await request.put(`/api/v1/pl/callProcedure/${sid}`, {
        data: {
          procedure: { ...plSchema?.procedure, params: plSchema?.params },
          anonymousBlockDdl,
        },
        params: {
          ignoreError,
        },
      });
    } else if (plSchema.plType === PLType.FUNCTION) {
      res = await request.put(`/api/v1/pl/callFunction/${sid}`, {
        data: {
          function: { ...plSchema?.function, params: plSchema?.params },
          anonymousBlockDdl,
        },
        params: {
          ignoreError,
        },
      });
    } else {
      const data = await executeSQL({ sql: plSchema.ddl, split: false }, sessionId, dbName); // 数据格式兼容
      if (data?.invalid) {
        return {
          status: 'FAIL',
          errorMessage: 'Request Abort',
        };
      } else if (
        data?.executeResult?.[0]?.status !== ISqlExecuteResultStatus.SUCCESS &&
        ignoreError
      ) {
        return {
          status: 'FAIL',
          errorMessage: data?.executeResult?.[0]?.track,
        };
      } else {
        dbms = { line: data?.executeResult?.[0]?.dbmsOutput };
        res = {
          data: { data: true },
        };
      }
    }
    // {"errCode":null,"errMsg":"ORA-00904: invalid identifier 'CHZ' in 'field list'","data":null,"importantMsg":false}
    // {"errCode":null,"errMsg":null,"data":{"funName":"F_ADD","ddl":"CREATE OR REPLACE function f_add(\np1 in integer, \np2 in integer) \nreturn integer as \nbegin \nreturn p1 + p2;\nend;","definer":"CHZ","status":null,"createTime":1606274473000,"modifyTime":1606274473000,"returnType":"integer","returnValue":"33","params":null,"varibales":[],"types":[]},"importantMsg":false}

    if (res.errMsg) {
      res.data = {
        status: 'FAIL',
        errorMessage: res.errMsg,
      };
    } // 追加 DBMS

    if (res?.data) {
      res.data = res.data === true ? {} : res.data;
      if (isNil(dbms)) {
        dbms = await this.getPLDBMS(sessionId, dbName);
      }
      res.data.dbms = dbms;
    }

    return res?.data;
  }

  @action
  public async getPLDBMS(sessionId, dbName) {
    /**
     * MySQL暂时不支持getLine
     */
    const session = sessionManager.sessionMap.get(sessionId);
    if (session?.connection.dialectType !== ConnectionMode.OB_ORACLE) {
      return null;
    }
    const sid = generateDatabaseSid(dbName, sessionId);
    const res = await request.get(`/api/v1/pl/getLine/${sid}`);
    return res && res.data;
  }

  @action
  public async refreshResultSet(pageKey: string, resultSetIndex: number, sessionId: string) {
    const resultSet = this.resultSets.get(pageKey);
    const session = sessionManager.sessionMap.get(sessionId);

    if (resultSet) {
      const target = resultSet[resultSetIndex];
      const record = await executeSQL(
        {
          sql: target.originSql,
          queryLimit: session?.params?.queryLimit,
        },
        session?.sessionId,
        session?.database?.dbName,
      );
      if (record?.invalid) {
        return;
      }
      if (!record?.executeResult?.length) {
        message.error(
          formatMessage({
            id: 'workspace.window.sql.record.empty',
          }),
        );
        return;
      } // 加入历史记录

      this.records = [
        ...record?.executeResult.reverse().map((result) => {
          return {
            ...result,
          };
        }),
        ...this.records,
      ]; // 在结果集中重新执行 SQL 肯定只有一条

      resultSet[resultSetIndex] = {
        ...generateResultSetColumns(
          record.executeResult,
          session?.connection?.dialectType,
          target.uniqKey,
        )[0],
      };
      this.resultSets.set(pageKey, clone(resultSet));
    }
  }

  @action
  public closeResultSet(pageKey: string, resultSetIdx: number) {
    const resultSet = this.resultSets.get(pageKey);

    if (resultSet) {
      /**
       * 手动去除rows的引用
       */
      resultSet[resultSetIdx]?.rows?.splice(0);
      resultSet.splice(resultSetIdx, 1);
      this.resultSets.set(pageKey, clone(resultSet));
    }
  }

  @action
  public lockResultSet(pageKey: string, key: string) {
    const resultSet = this.resultSets.get(pageKey);
    const resultSetIdx = resultSet?.findIndex?.((set) => set.uniqKey === key);

    if (resultSetIdx > -1) {
      resultSet[resultSetIdx].locked = true;
      this.resultSets.set(pageKey, clone(resultSet));
    }
  }

  @action
  public unlockResultSet(pageKey: string, key: string) {
    const resultSet = this.resultSets.get(pageKey);
    const resultSetIdx = resultSet?.findIndex?.((set) => set.uniqKey === key);

    if (resultSet) {
      resultSet[resultSetIdx].locked = false;
      this.resultSets.set(pageKey, clone(resultSet));
    }
  }

  public updateDataRow = (
    rows: any[],
    columnIdx: number,
    updated: {
      [key: string]: unknown;
    },
  ): boolean => {
    const columnKey = Object.keys(updated)[0];
    const modified = rows[columnIdx]?.[columnKey] !== updated[columnKey];

    if (modified) {
      rows[columnIdx][columnKey] = updated[columnKey];
    }

    return modified;
  };

  // 清空指定 SQL 页面包含的全部结果集
  @action
  public clear(pageKey: string) {
    this.resultSets.delete(pageKey);
  } // 清空所有历史记录

  @action
  public clearExecuteRecords() {
    this.records = [];
  }

  @action
  public reset() {
    this.resultSets = new Map();
    this.records = [];
    this.stopingPageKey = new Set();
    this.runningPageKey = new Set();
    this.rollbackPageKey = new Set();
    this.lockedResultSets = [];
    this.isRunningSection = new Set();
    this.isCompiling = false;
    this.debugLogs = [];
    this.commitingPageKey = new Set();
  }

  public getFirstUnlockedResultIndex(pageKey: string) {
    const resultSet = this.resultSets.get(pageKey);

    if (resultSet) {
      const lockedResultSets = resultSet.filter((r) => r.locked);
      return lockedResultSets.length;
    }

    return -1;
  }

  public getFirstUnlockedResultKey(pageKey: string) {
    const resultSet = this.resultSets.get(pageKey);
    return (
      resultSet?.find((r) => !r.locked && r.type !== 'LOG')?.uniqKey ||
      resultSet?.find((r) => !r.locked && r.type === 'LOG')?.uniqKey
    );
  }

  private formatSQLExplainTree(data: any): ISQLExplainTreeNode {
    const formatted: ISQLExplainTreeNode = {
      ...data,
      rowCount: Number(data.rowCount),
      cost: Number(data.cost),
    };
    const children: ISQLExplainTreeNode[] = [];

    if (data.children) {
      Object.keys(data.children).forEach((key) => {
        children.push(this.formatSQLExplainTree(data.children[key]));
      }); // @ts-ignore

      formatted.children = children.length && children;
    }

    return formatted;
  }
}

export default new SQLStore();
