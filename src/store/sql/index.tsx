import { executeSQL, stopExec } from '@/common/network/sql';
import { default as PLTYPE } from '@/constant/plType';
import {
  ConnectionMode,
  ILogItem,
  ILogType,
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
import connectionStore from '../connection';
import { generateResultSetColumns } from '../helper';
import schemaStore from '../schema';
import sessionManager from '../sessionManager';
import sqlStore from '../sql';
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

  @observable
  public runningPLMap: Map<string, string> = new Map();

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
  public getRunningPL(plName: string) {
    return this.runningPLMap.get(plName);
  }

  @action
  public setRunningPL(plName: string, status: string) {
    this.runningPLMap.set(plName, PL_RUNNING_STATUS[status]);
  }

  @action
  public removeRunningPL(plName: string) {
    this.runningPLMap.delete(plName);
  }

  @action
  public deleteRecords(keys: string[]) {
    this.records = this.records.filter((record) => {
      return !keys.includes(record.id);
    });
  }

  @action
  public async commit(pageKey: string, sessionId: string, dbName: string) {
    try {
      runInAction(() => {
        this.commitingPageKey.add(pageKey);
      });
      const data = await executeSQL('commit;', sessionId, dbName);
      sessionManager.sessionMap.get(sessionId)?.initSessionTransaction();
      if (data?.[0].status === ISqlExecuteResultStatus.SUCCESS) {
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
      this.rollbackPageKey.add(pageKey);
      const data = await executeSQL('rollback;', sessionId, dbName);
      sessionManager.sessionMap.get(sessionId)?.initSessionTransaction();
      if (data?.[0].status === ISqlExecuteResultStatus.SUCCESS) {
        message.success(
          formatMessage({ id: 'odc.src.store.sql.RollbackSucceeded' }), //回滚成功
        );
      }
    } finally {
      this.rollbackPageKey.delete(pageKey);
    }
  }

  @action
  public async stopExec(pageKey: string) {
    try {
      this.stopingPageKey.add(pageKey);
      const session = connectionStore.subSessions.get(pageKey);
      const data = await stopExec(session?.sessionId);

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
  ): Promise<ISqlExecuteResult[]> {
    if (!this.resultSets.has(pageKey)) {
      this.resultSets.set(pageKey, []);
    }

    let record; // 需要忽略默认错误处理
    try {
      this.runningPageKey.add(pageKey);
      !!isSection && this.isRunningSection.add(pageKey);
      const showTableColumnInfo = connectionStore.subSessions.get(pageKey)?.tableColumnInfoVisible;
      record = await executeSQL(
        {
          sql,
          queryLimit: connectionStore.subSessions.get(pageKey)?.queryLimit || undefined,
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
    if (!record) {
      return null;
    }
    /**
     * 刷新一下delimiter
     */
    sessionId
      ? connectionStore.initSubSessionTransactionStatus(sessionId)
      : connectionStore.initTransactionStatus();

    // 判断结果集是否支持编辑
    // TODO: 目前后端判断是否支持接口非常慢，因此只能在用户点击 “开启编辑” 时发起查询，理想状态肯定是在结果集返回结构中直接表示是否支持
    // const isEditable = await this.isResultSetEditable(sql);
    runInAction(() => {
      // 加入历史记录
      /** Record去除rows,性能优化 */
      const recordWithoutRows = record.map((result) => {
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
          this.getLogTab(record),
          ...generateResultSetColumns(record),
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

  public getSid() {
    const { sessionId } = connectionStore;
    const { database } = schemaStore;
    const dbName = database && database.name;
    return `sid:${sessionId}:d:${dbName}`;
  } // 获取 PL getPLSchema

  @action
  public async getPLSchema(plScriptText: string) {
    const resParse = await this.parsePL(plScriptText);
    const { plName, obDbObjectType } = resParse;
    const FUNCS = {
      PROCEDURE: 'getProcedure',
      FUNCTION: 'getFunction',
    };
    const res = await schemaStore[FUNCS[obDbObjectType]](plName); // 记录下来，便于后续流程使用

    return res;
  } // 解析 PL

  @action
  public async parsePL(sql: string) {
    const sid = this.getSid();
    const res = await request.put(`/api/v1/pl/parsePLNameType/${sid}`, {
      data: {
        sql,
      },
    });
    return res?.data;
  } // 编译 PL

  @action
  public async compilePL(plName: string, obDbObjectType: string) {
    const sid = this.getSid();
    this.setRunningPL(plName, 'COMPLIE');
    const res = await request.post(`/api/v1/pl/compile/${sid}`, {
      data: { obDbObjectType, plName },
    });
    this.removeRunningPL(plName);
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
  }) {
    const sid = this.getSid();
    const res = await request.post(
      `/api/v2/connect/sessions/${sid}/currentDatabase/batchCompilations`,
      {
        data: params,
      },
    );
    return res?.data;
  }

  @action
  public async getBatchCompilePLResult(id: string) {
    const sid = this.getSid();
    const res = await request.get(
      `/api/v2/connect/sessions/${sid}/currentDatabase/batchCompilations/${id}`,
    );
    return res?.data;
  }

  @action
  public async deleteBatchCompilePL(id: string) {
    const sid = this.getSid();
    const res = await request.delete(
      `/api/v2/connect/sessions/${sid}/currentDatabase/batchCompilations/${id}`,
    );
    return res?.data;
  }

  // 运行 PL
  @action
  public async execPL(plSchema: any, ignoreError?: boolean) {
    const sid = this.getSid();
    const { plName } = plSchema;
    this.setRunningPL(plName, 'EXEC');
    let res;
    let dbms;
    if (plSchema.proName) {
      res = await request.put(`/api/v1/pl/callProcedure/${sid}`, {
        data: plSchema,
        params: {
          ignoreError,
        },
      });
    } else if (plSchema.funName) {
      res = await request.put(`/api/v1/pl/callFunction/${sid}`, {
        data: plSchema,
        params: {
          ignoreError,
        },
      });
    } else {
      const data = await executeSQL({ sql: plSchema.ddl, split: false }); // 数据格式兼容
      if (data?.[0]?.status !== ISqlExecuteResultStatus.SUCCESS && ignoreError) {
        this.removeRunningPL(plName);
        return {
          status: 'FAIL',
          errorMessage: data?.[0]?.track,
        };
      } else {
        dbms = { line: data?.[0]?.dbmsOutput };
        res = {
          data: { data: true },
        };
      }
    }

    this.removeRunningPL(plName); // {"errCode":null,"errMsg":"ORA-00904: invalid identifier 'CHZ' in 'field list'","data":null,"importantMsg":false}
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
        dbms = await this.getPLDBMS();
      }
      res.data.dbms = dbms;
    }

    return res?.data;
  }

  @action
  public async startPLDebug(plSchema: any) {
    const sid = this.getSid();
    const { plName } = plSchema;
    this.setRunningPL(plName, 'DEBUG');
    this.debugLogs = [];
    let res;

    if (plSchema.proName) {
      res = await request.put(`/api/v1/pl/startDebugProcedure/${sid}`, {
        data: {
          ...plSchema,
          // 程序包内的存储过程名字需要加上程序包前缀
          proName: plSchema.proName,
        },
      });
    } else if (plSchema.funName) {
      res = await request.put(`/api/v1/pl/startDebugFunction/${sid}`, {
        data: {
          ...plSchema,
          // 程序包内的函数名字需要加上程序包前缀
          funName: plSchema.funName,
        },
      });
    } else {
      res = await request.put(`/api/v1/pl/startDebugAnonymousBlock/${sid}`, {
        data: {
          sql: plSchema.ddl,
        },
      });
    }

    return res && res.data;
  }

  @action
  public async endPLDebug(plSchema: any, asyncCallback: any) {
    const sid = this.getSid();
    const { plName } = plSchema;
    await request.put(`/api/v1/pl/endDebug/${sid}`);
    if (asyncCallback) {
      await asyncCallback();
    }

    this.removeRunningPL(plName);
  }

  @action
  public async getPLDebugResult(plSchema: any) {
    const sid = this.getSid();
    const { plType, plName, packageName } = plSchema;
    const runTimeInfo = await this.getPLDebugRuntimeInfo();
    const { terminated } = runTimeInfo;
    let r: any = {
      terminated,
    };

    if (terminated) {
      message.success(
        formatMessage({
          id: 'odc.EditorToolBar.actions.pl.ThisRoundOfDebuggingHas',
        }),
        2,
      );
      r.DBMS = await this.getPLDBMS();
      await this.getPLDebugLog(plName, plType, packageName);
      let debugResult; // 增加 OUT 参数

      r.PARAMS = plSchema.params || [];

      if (plType === PLTYPE.PROCEDURE) {
        debugResult = await request.get(`/api/v1/pl/getPLDebugRunResult/${sid}`);
        r.PARAMS = r.PARAMS.concat(debugResult.data);
      }

      if (plType === PLTYPE.FUNCTION) {
        debugResult = await request.get(`/api/v1/pl/getFuncDebugRunResult/${sid}`);
      }

      if (debugResult?.errMsg) {
        await sqlStore.addDebugLog({
          type: ILogType.ERROR,
          message: debugResult.errMsg,
        });
      }

      if (debugResult && debugResult.data) {
        const { returnType, returnValue } = debugResult.data;
        r.PARAMS = r.PARAMS.concat({
          paramName: formatMessage({
            id: 'odc.src.store.sql.ReturnValue',
          }),
          dataType: returnType,
          paramMode: 'OUT',
          defaultValue: returnValue,
        });
      }
    } else {
      r.VARIABLE = await this.getPLDebugVariables();
      r.TRACK = await this.getPLDebugTrack();
    }

    r.DEBUG_LOG = this.debugLogs;
    return r;
  }

  @action
  public async addBreakPoint(plName: string, lineNum: number, packageName?: string) {
    const sid = this.getSid();
    const res = await request.put(`/api/v1/pl/setBreakpoint/${sid}`, {
      data: {
        lineNum,
        plName,
        packageName,
      },
    });

    if (res && res.data) {
      await sqlStore.addDebugLog({
        type: ILogType.INFO,
        message: `Add breakpoint ${packageName ? packageName + '.' : ''}${
          plName || ''
        } [line ${lineNum}].`,
      });
    }

    return res && res.data;
  }

  @action
  public async deleteBreakpoint(
    plName: string,
    breakpoint: {
      breakPointNum: number;
      lineNum: number;
    },
    packageName?: string,
  ) {
    const sid = this.getSid();
    const { breakPointNum, lineNum } = breakpoint;
    const res = await request.put(`/api/v1/pl/deleteBreakpoint/${sid}`, {
      data: {
        lineNum,
        breakPointNum,
        plName,
        packageName,
      },
    });

    if (res && res.data) {
      await sqlStore.addDebugLog({
        type: ILogType.INFO,
        message: `Del breakpoint ${packageName ? packageName + '.' : ''}${
          plName || ''
        } [line ${lineNum}].`,
      });
    }

    return res && res.data;
  }

  @action
  public async continueNextBreakpoint() {
    const sid = this.getSid();
    const res = await request.put(`/api/v1/pl/continueNextBreakpoint/${sid}`);
    return res && res.data;
  }

  @action
  public async continueNextLine() {
    const sid = this.getSid();
    const res = await request.put(`/api/v1/pl/continueNextLine/${sid}`);
    return res && res.data;
  }

  @action
  public async getPLDebugTrack() {
    const sid = this.getSid();
    const res = await request.get(`/api/v1/pl/printBacktrace/${sid}`);
    return res && res.data;
  }

  @action
  public async getPLDebugRuntimeInfo() {
    const sid = this.getSid();
    const res = await request.get(`/api/v1/pl/getRuntimeInfo/${sid}`);
    return res && res.data;
  }

  @action
  public async getPLDebugVariables() {
    const sid = this.getSid();
    const res = await request.get(`/api/v1/pl/getValues/${sid}`);
    return res && res.data;
  }

  @action
  public async getPLDBMS() {
    /**
     * MySQL暂时不支持getLine
     */
    if (connectionStore.connection.dbMode !== ConnectionMode.OB_ORACLE) {
      return null;
    }
    const sid = this.getSid();
    const res = await request.get(`/api/v1/pl/getLine/${sid}`);
    return res && res.data;
  }

  @action
  public async getPLDebugBreakpoints() {
    const sid = this.getSid();
    const res = await request.get(`/api/v1/pl/showBreakpoints/${sid}`);
    return res?.data;
  }

  @action
  public async getPLDebugLog(plName: string, plType: string, packageName?: string) {
    const sid = this.getSid();
    plName = plName || '';
    if (packageName) {
      /**
       * aone/issue/33328989
       */
      plName = packageName;
      plType = PLTYPE.PKG_BODY;
    }
    const res = await request.get(`/api/v1/pl/getErrors/${sid}`, {
      params: {
        plName: plName || '',
        type: plType || '',
      },
    });
    const errorLogs = (res && res.data) || [];
    const batchs = errorLogs.map((logItem) => {
      return sqlStore.addDebugLog({
        type: ILogType.ERROR,
        message: logItem.text,
      });
    });
    await Promise.all(batchs);
  }

  @action
  public async continueStepIn() {
    const sid = this.getSid();
    const res = await request.put(`/api/v1/pl/continueStepIn/${sid}`);
    return res && res.data;
  }

  @action
  public async continueStepOut() {
    const sid = this.getSid();
    const res = await request.put(`/api/v1/pl/continueStepOut/${sid}`);
    return res && res.data;
  }

  @action
  public async continueToExit() {
    const sid = this.getSid();
    const res = await request.put(`/api/v1/pl/continueToExit/${sid}`);
    return res && res.data;
  }

  @action
  public async addDebugLog(logItem) {
    logItem.timestamp = logItem.timestamp || `${Date.now()}`;
    this.debugLogs.push(logItem);
  }

  @action
  public async clearDebugLogs() {
    this.debugLogs = [];
  }

  @action
  public async abort() {
    const sid = this.getSid();
    const res = await request.put(`/api/v1/pl/abort/${sid}`);
    return res && res.data;
  }

  @action
  public async exportData(
    sql: string,
    queryLimit: number,
    type: string,
    tag: string,
  ): Promise<string> {
    const sid = `sid:${connectionStore.sessionId}:d:${
      schemaStore.database && schemaStore.database.name
    }`;
    const params = {
      sid,
      sql,
      queryLimit,
      type,
      tag,
    };
    const { data: fileName } = await request.post(`/api/v1/file/startTask/${sid}`, {
      data: params,
    });
    return fileName;
  }

  @action
  public async getFileProcess(fileName: string): Promise<boolean> {
    const sid = `sid:${connectionStore.sessionId}:d:${
      schemaStore.database && schemaStore.database.name
    }`;
    const { data } = await request.get(`/api/v1/file/getProcess/${sid}?fileName=${fileName}`);
    return data === 100;
  }

  @action
  public async refreshResultSet(pageKey: string, resultSetIndex: number) {
    const resultSet = this.resultSets.get(pageKey);
    const subSession = connectionStore.subSessions.get(pageKey);

    if (resultSet) {
      const target = resultSet[resultSetIndex];
      const record = await executeSQL(
        {
          sql: target.originSql,
          queryLimit: connectionStore.subSessions.get(pageKey).queryLimit,
        },
        subSession?.sessionId,
      );

      if (!record?.length) {
        message.error(
          formatMessage({
            id: 'workspace.window.sql.record.empty',
          }),
        );
        return;
      } // 加入历史记录

      this.records = [
        ...record.reverse().map((result) => {
          return {
            ...result,
          };
        }),
        ...this.records,
      ]; // 在结果集中重新执行 SQL 肯定只有一条

      resultSet[resultSetIndex] = {
        ...generateResultSetColumns(record, target.uniqKey)[0],
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
    this.runningPLMap = new Map();
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
