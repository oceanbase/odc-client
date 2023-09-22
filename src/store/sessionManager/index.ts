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

import { getConnectionDetail, getConnectionDetailResponse } from '@/common/network/connection';
import { getDatabase } from '@/common/network/database';
import { IDatabase } from '@/d.ts/database';
import { IDatasource } from '@/d.ts/datasource';
import { toInteger } from 'lodash';
import { action, observable, runInAction } from 'mobx';
import SessionStore from './session';
import { message } from 'antd';
import notification from '@/util/notification';

type ConnectionId = number;

export class SessionManagerStore {
  @observable
  public sessionMap: Map<string, SessionStore> = new Map();

  @observable
  public connection: Map<number, IDatasource> = new Map();

  @observable
  public database: Map<number, IDatabase> = new Map();

  @observable
  public masterSession: Map<number, string> = new Map();

  /**
   * 获取connection的信息
   */
  async initConnection(
    connectionId: ConnectionId,
    databaseId: number,
  ): Promise<boolean | 'NotFound'> {
    if (databaseId) {
      /**
       * 数据库模式
       */
      const res = await getDatabase(databaseId, true);
      const database = res?.data;
      if (!database && res?.errCode !== 'NotFound') {
        notification.error({
          track: res?.errMsg,
        });
      }
      if (res?.errCode === 'NotFound') {
        return 'NotFound';
      }
      if (!database) {
        return false;
      }
      this.database.set(databaseId, database);
      this.connection.set(database.dataSource?.id, database?.dataSource);
      return true;
    } else {
      const res = await getConnectionDetailResponse(connectionId);
      const datasource = res?.data;
      if (!datasource && res?.errCode !== 'NotFound') {
        notification.error({
          track: res?.errMsg,
        });
      }
      if (res?.errCode === 'NotFound') {
        return 'NotFound';
      }
      if (!datasource) {
        return false;
      }
      this.connection.set(connectionId, datasource);
      return true;
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
    isMaster: boolean = false,
  ): Promise<SessionStore | null | 'NotFound'> {
    if (isMaster && databaseid) {
      const masterSession = this.sessionMap.get(this.masterSession.get(databaseid));
      if (masterSession) {
        return masterSession;
      }
    }
    const result = await this.initConnection(datasourceId, databaseid);
    if (result === 'NotFound') {
      return result;
    } else if (!result) {
      return null;
    }
    const database = this.database.get(databaseid);
    datasourceId = datasourceId || database?.dataSource?.id;
    const datasource = this.connection.get(toInteger(datasourceId));
    const session = await SessionStore.createInstance(datasource, database);
    runInAction(() => {
      if (session) {
        this.sessionMap.set(session.sessionId, session);
        if (isMaster && database) {
          this.masterSession.set(database?.id, session?.sessionId);
        }
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
    this.masterSession.clear();
  }
  @action
  destorySession(sessionId: string, force: boolean = false) {
    const session = this.sessionMap.get(sessionId);
    if (session) {
      const masterSessionId = this.masterSession.get(session?.database?.databaseId);
      if (session?.sessionId === masterSessionId && !force) {
        /**
         * do not destory master session
         */
        return;
      }
      session.destory(force);
      this.sessionMap.delete(sessionId);
    }
  }
}
export default new SessionManagerStore();
