/**
 * @desc 数据库连接相关
 */
import {
  changeDelimiter,
  getConnectionList,
  setTransactionInfo,
} from '@/common/network/connection';
import { generateSessionSid } from '@/common/network/pathUtil';
import type { ConnectionFilterStatus, IConnection, IConnectionType, ISessionStatus } from '@/d.ts';
import { ConnectionMode, ConnectType } from '@/d.ts';
import { reviseV2Field } from '@/util/connection';
import request from '@/util/request';
import { action, observable, runInAction } from 'mobx';
import authStore from './auth';
import userStore from './login';
import schemaStore from './schema';
import setting from './setting';

export interface ConnectionPlan {
  key: string | number;
  data: IConnection[];
  isRunning?: boolean;
}

export interface ISubSession {
  delimiter: string;
  delimiterLoading: boolean;
  queryLimit: number;
  tableColumnInfoVisible: boolean;
  sessionId: string;
  autoCommit: boolean;
  transState?: ISessionStatus;
}

/**
 * 数据库连接表单编辑模式
 */
export enum ConnectionEditMode {
  NEW = 'NEW',
  EDIT = 'EDIT',
}
const DEFAULT_QUERY_LIMIT = 1000;
const DEFAULT_DELIMITER = ';';
const DEFAULT_COLUMN_INFO_VISIBLE = true;

export class ConnectionStore {
  /**
   * 连接 sessionId
   */
  @observable
  public sessionId: string = '';

  @observable
  public isDestroy: boolean = false;

  @observable
  public lastSessionId: string = '';

  /**
   * 子连接
   */
  @observable
  public subSessions: Map<string, ISubSession> = new Map();

  /**
   * 当前数据库连接
   */
  @observable
  public connection: Partial<IConnection> = {
    dialectType: ConnectionMode.OB_ORACLE,
  };

  /**
   * session自动提交状态
   */
  @observable
  public autoCommit: boolean = true;

  /**
   * 分隔符
   */
  @observable
  public delimiter: string = DEFAULT_DELIMITER;

  /**
   * ob 版本
   */
  @observable
  public obVersion: string = '';

  @observable
  public delimiterLoading: boolean = false;

  /**
   * 查询条数限制
   */
  @observable
  public queryLimit: number = DEFAULT_QUERY_LIMIT;

  /**
   * 列信息开关
   */
  @observable
  public tableColumnInfoVisible: boolean = DEFAULT_COLUMN_INFO_VISIBLE;

  @observable
  public transState: ISessionStatus = null;
  /**
   * 标签列表
   */
  @observable
  public labels: any[] = [];

  @action
  public setSessionDestroy() {
    this.isDestroy = true;
  }

  /**
   * 创建子session。具备自己的会话属性
   */
  @action
  public createSubSessions = async (pageKey: string) => {};

  /**
   * 系统初始化
   */
  @action
  public async initConnect(params: any) {
    const { d: database, sid: sessionId } = params;
    /**
     * 这里url存在database先设置进去，后续重新连接依赖这个
     */
    if (database) {
      schemaStore.database = {
        name: database,
      };
    }
    try {
      /**
       * 初始化出错的话，直接显示重新连接
       */
      await this.get(sessionId);
      // 获取数据库列表
      await schemaStore.getDatabaseList();

      this.isDestroy = false;
      await this.initTransactionStatus();
      this.initSessionTransaction();
      // 获取用户保存的脚本
      userStore.scriptStore.getScriptList();
      /**
       * 和泛秋确认，不存在默认数据库取第一个作为默认的
       * 山露：MySQL默认为mysql库
       *
       */
      let firstDatabase =
        this.connection.dialectType === ConnectionMode.OB_MYSQL
          ? schemaStore.databases?.find((d) => d.name === 'information_schema')?.name
          : null;
      if (!firstDatabase) {
        firstDatabase = schemaStore.databases[0].name;
      }
      let selectDatabase = database || firstDatabase;
      if (selectDatabase) {
        // 选择当前数据库
        await schemaStore.selectDatabase(selectDatabase, true);
      }
    } catch (e) {
      console.error(e);
      return;
    }
  }

  @action
  public async getList(params: {
    clusterName?: string[];
    tenantName?: string[];
    dialectType?: ConnectionMode[] | ConnectionMode;
    type?: ConnectType[] | ConnectType;
    status?: ConnectionFilterStatus;
    permittedAction?: string | string[];
    fuzzySearchKeyword?: string;
    id?: number[];
    sort?: string;
    page?: number;
    size?: number;
    visibleScope?: IConnectionType;
    minPrivilege?: string;
    sessionLabelId?: string[];
    name?: string;
    host?: string;
    hostPort?: string;
  }) {
    const res = await getConnectionList(params);
    return res;
  }

  /**
   * 初始化连接信息
   */
  @action
  public async get(sid: string) {
    const connectionId = sid.split('-')[0];
    const results = await request.get(`/api/v2/connect/connections/${connectionId}`);
    this.setConnection(results && results.data);
    const permittedActions = new Set<string>();
    this.connection.supportedOperations.forEach((v) => {
      permittedActions.add(v);
    });
    authStore.appendConnectionPermissions(this.connection.id, [...permittedActions]);
    this.sessionId = sid;
    this.lastSessionId = sid;
    return !!results?.data;
  }

  // 通知后端建立数据库连接
  // @see yuque/afx-es/oceanbase/vbi4fv
  @action
  public async connect() {}

  public getAllSessionIds = () => {
    const sid = this.sessionId;
    const subSessions = [...this.subSessions.values()].map((session) => session.sessionId);
    const sessions = subSessions.concat(sid);
    return [...new Set(sessions)];
  };
  // 通知后端断开数据库连接
  @action
  public async disconnect(force: boolean = true) {
    const sessions = this.getAllSessionIds();
    if (!sessions?.length) {
      return;
    }
    await request.delete(`/api/v2/connect/sessions`, {
      data: {
        sessionIds: sessions.map((s) => generateSessionSid(s)),
        delay: force ? null : 60,
      },
    });
  }
  /**
   * 关闭子连接
   */
  @action
  public async closeSubSession(pageKey: string) {
    const subSession = this.subSessions.get(pageKey)?.sessionId;
    if (!subSession) {
      return;
    }
    this.subSessions.delete(pageKey);
    if (setting.enableMultiSession) {
      await request.delete(`/api/v2/connect/sessions`, {
        data: { sessionIds: [generateSessionSid(subSession)] },
      });
    }
  }

  @action
  public setConnection(connection: Partial<IConnection>) {
    this.connection = {
      ...this.connection,
      ...reviseV2Field(connection),
    };
  }

  @action
  public async initTransactionStatus() {}

  @action
  public async initSessionTransaction(sessionId?: string) {}

  public getSessionTransaction(sessionId?: string) {
    sessionId = sessionId || this.sessionId;
    if (!setting.enableMultiSession) {
      return this.transState;
    }
    const subSessions = [...this.subSessions.values()].find(
      (session) => session.sessionId === sessionId,
    );
    return subSessions?.transState;
  }

  /**
   * 处理子session的会话属性
   */
  @action
  public async initSubSessionTransactionStatus(sessionId?: string) {}

  @action
  public async syncSubSessionFromSession() {
    const sessions = this.subSessions.values();
    for (let session of sessions) {
      session.autoCommit = this.autoCommit;
      session.delimiter = this.delimiter;
      session.queryLimit = this.queryLimit;
      session.transState = this.transState;
      session.tableColumnInfoVisible = this.tableColumnInfoVisible;
    }
  }

  @action
  public clear() {
    this.sessionId = '';
    this.subSessions = new Map();
    this.connection = {
      dialectType: ConnectionMode.OB_ORACLE,
    };
  }

  /**
   * delimiter
   */
  @action
  public changeDelimiter = async (v: string, pageKey?: string) => {
    let session;
    if (setting.enableMultiSession && pageKey) {
      session = this.subSessions.get(pageKey);
    } else {
      session = this;
    }
    session.delimiterLoading = true;
    if (!setting.enableMultiSession) {
      this.syncSubSessionFromSession();
    }
    const isSuccess = await changeDelimiter(v, session?.sessionId, '');
    runInAction(() => {
      if (isSuccess) {
        session.delimiter = v;
      }
      session.delimiterLoading = false;
      if (!setting.enableMultiSession) {
        this.syncSubSessionFromSession();
      }
    });
    return isSuccess;
  };

  @action resetDelimiter = () => {
    this.delimiterLoading = false;
    this.delimiter = ';';
  };

  @action
  public setQueryLimit = async (num: number, pageKey?: string) => {
    let session;
    if (setting.enableMultiSession && pageKey) {
      session = this.subSessions.get(pageKey);
    } else {
      session = this;
    }
    if (!session.sessionId) {
      return;
    }
    const isSuccess = await setTransactionInfo(
      {
        queryLimit: num,
      },
      session?.sessionId,
    );
    if (isSuccess) {
      session.queryLimit = num;
    }
    if (!setting.enableMultiSession) {
      this.syncSubSessionFromSession();
    }
    return isSuccess;
  };

  @action
  public changeColumnInfoVisible = async (v: boolean, pageKey?: string) => {
    let session;

    if (setting.enableMultiSession && pageKey) {
      session = this.subSessions.get(pageKey);
    } else {
      session = this;
    }
    if (!session.sessionId) {
      return;
    }
    session.tableColumnInfoVisible = v;
    if (!setting.enableMultiSession) {
      this.syncSubSessionFromSession();
    }
  };
}

export default new ConnectionStore();
