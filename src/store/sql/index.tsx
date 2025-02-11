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
import { executePL } from '@/common/network/sql/executePL';
import { PLType } from '@/constant/plType';
import {
  ConnectionMode,
  IExecutingInfo,
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
import setting from '../setting';

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
    defaultMessage: '编译',
  }),
  // @ts-ignore
  EXEC = formatMessage({
    id: 'odc.src.store.sql.Run',
    defaultMessage: '运行',
  }),
  // @ts-ignore
  DEBUG = formatMessage({
    id: 'odc.src.store.sql.Debugging',
    defaultMessage: '调试',
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

  /** 当前激活的tab key */
  @observable
  public activeTab: Record<string, string> = {};

  @observable
  public uniqLogKey: string = null;

  @observable
  public logLoading: boolean = false;

  public debugLogs: ILogItem[] = [];

  @action
  public deleteRecords(keys: string[]) {
    this.records = this.records.filter((record) => {
      return !keys.includes(record.id);
    });
  }

  @action
  public setActiveTab(pageKey, key: string) {
    this.activeTab[pageKey] = key;
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
      const data = await executeSQL('commit;', sessionId, dbName, false);
      sessionManager.sessionMap.get(sessionId)?.initSessionStatus();
      if (data?.executeResult?.[0].status === ISqlExecuteResultStatus.SUCCESS) {
        message.success(
          formatMessage({
            id: 'odc.src.store.sql.SubmittedSuccessfully',
            defaultMessage: '提交成功',
          }), //提交成功
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
      const data = await executeSQL('rollback;', sessionId, dbName, false);
      sessionManager.sessionMap.get(sessionId)?.initSessionStatus();
      if (data?.executeResult?.[0].status === ISqlExecuteResultStatus.SUCCESS) {
        message.success(
          formatMessage({ id: 'odc.src.store.sql.RollbackSucceeded', defaultMessage: '回滚成功' }), //回滚成功
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
          formatMessage({
            id: 'odc.src.store.sql.StoppedSuccessfully',
            defaultMessage: '停止成功',
          }), //停止成功
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
    needModal: boolean = true,
  ): Promise<any> {
    if (!this.resultSets.has(pageKey)) {
      this.resultSets.set(pageKey, []);
    }
    const session = sessionManager.sessionMap.get(sessionId);
    this.logLoading = true;
    try {
      this.runningPageKey.add(pageKey);
      !!isSection && this.isRunningSection.add(pageKey);
      const showTableColumnInfo = session?.params?.tableColumnInfoVisible;
      const fullLinkTraceEnabled = session?.params?.fullLinkTraceEnabled;
      const continueExecutionOnError = session?.params?.continueExecutionOnError;
      const isSupportProfile = session?.supportFeature.enableProfile;
      const handleResult = (info: IExecutingInfo) => {
        // 兼容后端不按约定返回的情况
        if (!info) {
          return;
        }
        /**
         * 刷新一下delimiter
         */
        this.logLoading = false;
        if (info.finished) {
          session.initSessionStatus();
        }
        runInAction(() => {
          const finishedSQLResult: Record<string, ISqlExecuteResult> = info.results?.reduce(
            (prev, cur) => {
              prev[cur.sqlId] = cur;
              const otherSQLId = cur.sqlId?.split('-')[0];
              otherSQLId && (prev[otherSQLId] = cur);
              return prev;
            },
            {},
          );
          this.records = this.records?.map((i) => {
            const result = finishedSQLResult[i.sqlId];
            const isExecutingSQLId = i?.sqlId === info?.executingSQLId;
            if (result) {
              /* 已返回的结果 */
              return {
                ...i,
                ...result,
                isSupportProfile: isSupportProfile && result?.withQueryProfile,
                sessionId,
              };
            } else if (isExecutingSQLId) {
              /* 执行中 */
              return {
                ...i,
                status: ISqlExecuteResultStatus.RUNNING,
              };
            } else {
              /* 未执行 */
              return i;
            }
          });
          const resultSet = this.resultSets.get(pageKey);
          if (resultSet) {
            const lockedResultSets = resultSet.filter((r) => r.locked); // @ts-ignore
            this.resultSets.set(pageKey, [
              ...lockedResultSets,
              this.getLogTab(info),
              ...generateResultSetColumns(info.results, session?.connection?.dialectType),
            ]);
          }
        });
      };
      const handleFirstExecute = (info: IExecutingInfo) => {
        /**
         * 设置record记录
         */
        const recordAll: ISqlExecuteResult[] = info?.task?.sqls.map((i) => {
          // 初始化为等待状态
          return {
            originSql: i.sqlTuple.originalSql,
            executeSql: i.sqlTuple.executedSql,
            sqlId: i.sqlTuple.sqlId,
            status: ISqlExecuteResultStatus.CREATED,
            timer: null,
            track: null,
            total: null,
            traceId: null,
            elapsedTime: null,
            id: generateUniqKey(),
            sessionId,
            isSupportProfile: isSupportProfile,
            allowExport: false,
            columnLabels: [],
            errorCode: null,
            existSensitiveData: null,
            existWarnings: false,
            resultSetMetaData: null,
            statementWarnings: null,
            sqlType: null,
            connectionReset: false,
            checkViolations: [],
            withFullLinkTrace: false,
            withQueryProfile: false,
          };
        });
        this.records = [
          ...recordAll?.reverse()?.map((r, index) => {
            return { ...r };
          }),
          ...this.records,
        ];

        this.initLog(pageKey, info);
      };

      let isFirstTime = true;

      const res = await executeSQL(
        {
          sql,
          queryLimit: session?.params.queryLimit || undefined,
          showTableColumnInfo,
          continueExecutionOnError,
          fullLinkTraceEnabled,
          addROWID:
            setting.configurations?.['odc.sqlexecute.default.addInternalRowId'] === 'true' &&
            session.supportFeature?.enableRowId,
        },
        sessionId,
        dbName,
        needModal,
        (info) => {
          if (isFirstTime) {
            isFirstTime = false;
            handleFirstExecute(info);
          } else {
            handleResult(info);
          }
        },
      );
      return res;
    } catch (e) {
      throw e;
    } finally {
      this.logLoading = false;
      this.runningPageKey.delete(pageKey);
      this.isRunningSection.delete(pageKey);
    }
  }

  private initLog(pageKey: string, info: IExecutingInfo) {
    const resultSet = this.resultSets.get(pageKey);
    const lockedResultSets = resultSet.filter((r) => r.locked);
    this.resultSets.set(pageKey, [...lockedResultSets, this.getLogTab(info)]);
    this.setActiveTab(pageKey, this.resultSets.get(pageKey)?.find((i) => i.type == 'LOG')?.uniqKey);
  }

  public getLogTab(record?: IExecutingInfo): IResultSet {
    const uniqKey = this.uniqLogKey || generateUniqKey();
    this.uniqLogKey = uniqKey;
    const { results, task } = record;
    return {
      type: 'LOG',
      uniqKey: uniqKey,
      columns: [],
      rows: [],
      initialSql: '',
      locked: false,
      // 是否支持编辑
      editable: false,
      isQueriedEditable: false,
      currentExecuteInfo: record,
      logTypeData: results?.map((item) => {
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
      total: task?.sqls?.length || 0,
    };
  }

  // 解析 PL
  @action
  public async parsePL(sql: string, sessionId, dbName) {
    const sid = generateDatabaseSid(dbName, sessionId);
    const res = await request.post(`/api/v2/pl/parsePLNameType/${sid}`, {
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
    const res = await request.post(`/api/v2/pl/compile/${sid}`, {
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
      res = await executePL(
        {
          type: PLType.PROCEDURE,
          procedure: { ...plSchema?.procedure, params: plSchema?.params },
          anonymousBlockDdl,
        },
        sessionId,
        ignoreError,
      );
    } else if (plSchema.plType === PLType.FUNCTION) {
      res = await await executePL(
        {
          type: PLType.FUNCTION,
          function: { ...plSchema?.function, params: plSchema?.params },
          anonymousBlockDdl,
        },
        sessionId,
        ignoreError,
      );
    } else {
      const data = await executeSQL({ sql: plSchema.ddl, split: false }, sessionId, dbName); // 数据格式兼容
      if (data?.invalid) {
        return {
          status: 'FAIL',
          errorMessage: 'Request Abort',
          unauthorizedDBResources: data?.unauthorizedDBResources,
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
    const res = await request.get(`/api/v2/pl/getLine/${sid}`);
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
            defaultMessage: '无法获得 SQL 执行记录',
          }),
        );
        return;
      } // 加入历史记录

      this.records = [
        ...record?.executeResult?.reverse().map((result) => {
          return {
            ...result,
          };
        }),
        ...this.records,
      ];
      // 在结果集中重新执行 SQL 肯定只有一条

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
    delete this.activeTab[pageKey];
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

  public getLogKey(pageKey: string) {
    return this.resultSets.get(pageKey)?.find((i) => i.type == 'LOG')?.uniqKey;
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
