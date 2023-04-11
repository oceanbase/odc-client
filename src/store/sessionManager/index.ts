import { IConnection } from '@/d.ts';
import request from '@/util/request';
import { action, observable } from 'mobx';
import SessionStore from './session';

type ConnectionId = string | number;

export class SessionManagerStore {
  @observable
  public sessionMap: Map<string, SessionStore> = new Map();

  /**
   * 维护当前的database 的 master session。
   * master session 主要是提供数据库对象等比较耗时间的资源维护，保持全局共用一份资源
   * 同时，也可以让一些短耗时的操作直接走master Session，避免创建 Session 的成本
   */
  @observable
  public masterSessionIdMap: Map<ConnectionId, string> = new Map();

  @observable
  public connection: Map<ConnectionId, IConnection> = new Map();

  getMasterSession(cid?: ConnectionId) {
    if (!cid) {
      /**
       * 暂时兼容老的逻辑
       */
      cid = this.connection.keys()?.[0];
    }
    const sessionId = this.masterSessionIdMap.get(cid);
    if (!sessionId) {
      return null;
    }
    return this.sessionMap.get(sessionId);
  }

  /**
   * 获取connection的信息
   */
  async initConnection(connectionId: ConnectionId) {
    if (this.connection.get(connectionId)) {
      return true;
    }
    const results = await request.get(`/api/v2/connect/connections/${connectionId}`);
    let connection: IConnection = results?.data;
    if (!connection) {
      return false;
    }
    this.setConnection(connection);
    return true;
  }

  /**
   * 创建一个新的 session
   * @param isMaster 是否为 master session
   * @param cid 要创建的 cid
   * @returns 创建的 session
   */
  @action
  async createSession(isMaster?: boolean, cid?: ConnectionId): Promise<SessionStore | null> {
    if (!(await this.initConnection(cid))) {
      return null;
    }
    const connection = this.connection.get(cid);
    const session = await SessionStore.createInstance(connection, connection.defaultSchema);
    if (session) {
      this.sessionMap.set(session.sessionId, session);
      if (isMaster) {
        this.masterSessionIdMap.set(cid, session.sessionId);
      }
    }
    return session;
  }

  @action
  async createExistSession(
    sessionId: string,
    cid: ConnectionId,
    isMaster?: boolean,
  ): Promise<SessionStore | null> {
    if (!(await this.initConnection(cid))) {
      return null;
    }
    const connection = this.connection.get(cid);
    const session = await SessionStore.recoverExistInstance(
      connection,
      sessionId,
      connection.defaultSchema,
    );
    if (session) {
      this.sessionMap.set(session.sessionId, session);
      if (isMaster) {
        this.masterSessionIdMap.set(cid, session.sessionId);
      }
    }
    return session;
  }

  private setConnection(connection: IConnection) {
    this.connection.set(connection.id, connection);
  }

  @action
  destoryStore(force: boolean = false) {
    this.connection = new Map();
    SessionStore.batchDestory(Array.from(this.sessionMap.values()), force);
    this.sessionMap = new Map();
    this.masterSessionIdMap = new Map();
  }
  @action
  destorySession(sessionId: string, force: boolean = false) {
    const session = this.sessionMap.get(sessionId);
    if (session) {
      session.destory(force);
      this.sessionMap.delete(sessionId);
    }
  }
}
export default new SessionManagerStore();
