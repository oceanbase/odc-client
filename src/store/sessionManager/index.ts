import { getConnectionDetail } from '@/common/network/connection';
import { getDatabase } from '@/common/network/database';
import { IDatabase } from '@/d.ts/database';
import { IDatasource } from '@/d.ts/datasource';
import { toInteger } from 'lodash';
import { action, observable, runInAction } from 'mobx';
import SessionStore from './session';

type ConnectionId = number;

export class SessionManagerStore {
  @observable
  public sessionMap: Map<string, SessionStore> = new Map();

  @observable
  public connection: Map<number, IDatasource> = new Map();

  @observable
  public database: Map<number, IDatabase> = new Map();

  /**
   * 获取connection的信息
   */
  async initConnection(connectionId: ConnectionId, databaseId: number) {
    if (databaseId) {
      /**
       * 数据库模式
       */
      const database = await getDatabase(databaseId);
      if (!database) {
        return false;
      }
      this.database.set(databaseId, database);
      this.connection.set(database.dataSource?.id, database?.dataSource);
      return true;
    } else {
      const datasource = await getConnectionDetail(connectionId);
      if (!datasource) {
        return false;
      }
      this.connection.set(connectionId, datasource);
    }
  }

  /**
   * 创建一个新的 session
   * @param isMaster 是否为 master session
   * @param cid 要创建的 cid
   * @returns 创建的 session
   */
  @action
  async createSession(
    datasourceId: ConnectionId,
    databaseid: number,
  ): Promise<SessionStore | null> {
    if (!(await this.initConnection(datasourceId, databaseid))) {
      return null;
    }
    const database = this.database.get(databaseid);
    datasourceId = datasourceId || database?.dataSource?.id;
    const datasource = this.connection.get(toInteger(datasourceId));
    const session = await SessionStore.createInstance(datasource, database);
    runInAction(() => {
      if (session) {
        this.sessionMap.set(session.sessionId, session);
      }
    });

    return session;
  }

  // @action
  // async createExistSession(
  //   sessionId: string,
  //   cid: ConnectionId,
  //   isMaster?: boolean,
  // ): Promise<SessionStore | null> {
  //   if (!(await this.initConnection(cid))) {
  //     return null;
  //   }
  //   const connection = this.connection.get(toInteger(cid));
  //   const session = await SessionStore.recoverExistInstance(
  //     connection,
  //     sessionId,
  //     connection.defaultSchema,
  //   );
  //   if (session) {
  //     this.sessionMap.set(session.sessionId, session);
  //     if (isMaster) {
  //       this.masterSessionIdMap.set(toInteger(cid), session.sessionId);
  //     }
  //   }
  //   return session;
  // }

  @action
  destoryStore(force: boolean = false) {
    this.connection.clear();
    SessionStore.batchDestory(Array.from(this.sessionMap.values()), force);
    this.sessionMap.clear();
    this.database.clear();
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
