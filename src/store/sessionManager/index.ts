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

import { getConnectionDetailResponse } from '@/common/network/connection';
import { getDatabase } from '@/common/network/database';
import { IDatabase } from '@/d.ts/database';
import { IDatasource } from '@/d.ts/datasource';
import notification from '@/util/ui/notification';
import { toInteger } from 'lodash';
import { action, observable, runInAction } from 'mobx';
import SessionStore from './session';
import { ConnectType, ConnectionMode, IConnectionStatus } from '@/d.ts';

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
      this.connection.set(database.dataSource?.id || database?.id, database?.dataSource);
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
      this.connection.set(toInteger(connectionId), datasource);
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
    recordDbAccessHistory: boolean = false,
  ): Promise<SessionStore | null | 'NotFound'> {
    if (isMaster && databaseid) {
      const masterSession = this.sessionMap.get(this.masterSession.get(databaseid));
      if (masterSession) {
        /**
         * 判断是否超过了10s，超过10s则需要重新请求一下database
         */
        const now = Date.now();
        if (now - masterSession.createTime > 10 * 1000) {
          await this.initConnection(datasourceId, databaseid);
          const datasource = this.connection.get(toInteger(datasourceId));
          const database = this.database.get(databaseid);
          masterSession.updateConnectionAndDatabase(datasource, database);
        }
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
    const datasource = this.connection.get(toInteger(datasourceId)) || {
      id: 1,
      ownerId: 1,
      environmentId: 1,
      environmentName: 'test',
      environmentStyle: null,
      sslConfig: {
        enabled: null,
        clientCertObjectId: null,
        clientKeyObjectId: null,
        CACertObjectId: null,
      },
      organizationId: null,
      creatorId: null,
      creator: null,
      name: 'test',
      dialectType: ConnectionMode.OB_MYSQL,
      host: null,
      port: null,
      clusterName: null,
      tenantName: null,
      username: null,
      password: null,
      passwordEncrypted: null,
      sysTenantUsername: null,
      sysTenantPassword: null,
      queryTimeoutSeconds: null,
      createTime: null,
      updateTime: null,
      status: {
        status: IConnectionStatus.ACTIVE,
        errorMessage: null,
      },
      properties: null,
      copyFromId: null,
      lastAccessTime: null,
      enabled: null,
      passwordSaved: null,
      cipher: null,
      salt: null,
      configUrl: null,
      temp: null,
      cloudDBAddress: null,
      sessionTimeout: null,
      permittedActions: null,
      supportedOperations: null,
      type: ConnectType.OB_MYSQL,
      errorMessage: null,
      jdbcUrlParameters: null,
      sessionInitScript: null,
      defaultSchema: null,
      projectId: null,
      sid: null,
      serviceName: null,
      userRole: null,
    };
    // if(database.type === DBType.LOGICAL){
    //   return
    // }
    const session = await SessionStore.createInstance(datasource, database, recordDbAccessHistory);
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
  async destoryStore(force: boolean = false) {
    this.connection.clear();
    await SessionStore.batchDestory(Array.from(this.sessionMap.values()), force);
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
