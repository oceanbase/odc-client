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

import {
  changeDelimiter,
  getSessionStatus,
  newSessionByDataBase,
  newSessionByDataSource,
  setTransactionInfo,
} from '@/common/network/connection';
import { generateDatabaseSid, generateSessionSid } from '@/common/network/pathUtil';
import { queryIdentities } from '@/common/network/table';
import { IDataType, IRecycleObject, ISessionStatus } from '@/d.ts';
import { IDatabase } from '@/d.ts/database';
import { IDatasource } from '@/d.ts/datasource';
import logger from '@/util/logger';
import request from '@/util/request';
import { isFunction } from 'lodash';
import { action, observable, runInAction } from 'mobx';
import settingStore from '../setting';
import DatabaseStore from './database';
import { ISupportFeature } from './type';
import setting from '../setting';
import { getBuiltinSnippets } from '@/common/network/snippet';
import { ISnippet } from '../snippet';
import { DBDefaultStoreType } from '@/d.ts/table';
import { isString } from 'lodash';
import { OBCompare, ODC_PROFILE_SUPPORT_VERSION } from '@/util/versionUtils';
import { ConnectionMode } from '@/d.ts';
import { isLogicalDatabase } from '@/util/database';

const DEFAULT_QUERY_LIMIT = 1000;
const DEFAULT_DELIMITER = ';';

class SessionStore {
  public createTime: number;
  /** 数据库元信息 */
  @observable
  public charsets: string[] = [];
  @observable
  public collations: string[] = [];
  @observable
  public dataTypes: IDataType[] = [];

  public snippets: ISnippet[] = [];

  @observable
  public odcDatabase: IDatabase;

  @observable
  public database: DatabaseStore;

  @observable
  public supportFeature: Partial<ISupportFeature> = {};

  @observable.shallow
  public allTableAndView: {
    [dbName: string]: {
      tables: string[];
      views: string[];
    };
  } = {};

  @observable.shallow
  public allTableAndMaterializedViews: {
    [dbName: string]: {
      tables: string[];
      mvs: string[];
    };
  } = {};

  /**
   * 这个里面包含系统视图，后续还有可能包含其余的对象
   */
  @observable.shallow
  public allIdentities: {
    [dbName: string]: {
      external_table: string[];
      materialized_view: string[];
      tables: string[];
      views: string[];
    };
  } = {};

  @observable
  public params: {
    autoCommit: boolean;
    maxQueryLimit: number;
    delimiter: string;
    queryLimit: number;
    delimiterLoading: boolean;
    obVersion: string;
    tableColumnInfoVisible: boolean;
    fullLinkTraceEnabled: boolean;
    continueExecutionOnError: boolean;
    defaultTableStoreFormat: DBDefaultStoreType;
    /**
     * 用于控制sql窗口的kill
     */
    killCurrentQuerySupported: boolean;
  } = {
    autoCommit: true,
    delimiter: DEFAULT_DELIMITER,
    maxQueryLimit: Number.MAX_SAFE_INTEGER,
    delimiterLoading: false,
    queryLimit: DEFAULT_QUERY_LIMIT,
    obVersion: '',
    tableColumnInfoVisible: true,
    fullLinkTraceEnabled: true,
    continueExecutionOnError: true,
    defaultTableStoreFormat: DBDefaultStoreType.ROW,
    killCurrentQuerySupported: false,
  };

  /**
   * 事务状态
   */
  @observable
  public transState: ISessionStatus = null;

  @observable
  public recycleObjects: IRecycleObject[] = [];

  public sessionId: string;

  @observable.shallow
  public connection: IDatasource = null;

  public isAlive: boolean = false;

  private lastTableAndViewLoadTime: number = 0;

  private lastIdentitiesLoadTime: Map<string, number> = new Map();

  constructor(connection: IDatasource, database: IDatabase) {
    this.connection = connection;
    this.odcDatabase = database;
    this.createTime = Date.now();
  }

  public updateConnectionAndDatabase(connection: IDatasource, database: IDatabase) {
    this.connection = connection || this.connection;
    this.odcDatabase = database || this.odcDatabase;
  }

  static async createInstance(
    datasource: IDatasource,
    database: IDatabase,
    recordDbAccessHistory?: boolean,
  ) {
    const session = new SessionStore(datasource, database);
    if (await session.init(recordDbAccessHistory)) {
      return session;
    }
    return null;
  }

  // static async recoverExistInstance(connection: IConnection, sessionId: string, dbName?: string) {
  //   const session = new SessionStore(connection);
  //   if (await session.initWithExistSessionId(sessionId, dbName)) {
  //     return session;
  //   }
  //   return null;
  // }

  /**
   * 创建一个 session
   * 数据源创建：不需要初始化 DB 与事务信息
   *
   * 数据库创建：需要初始化 DB 与事务信息。
   */
  async init(recordDbAccessHistory: boolean): Promise<boolean> {
    try {
      if (!this.odcDatabase) {
        /**
         * 数据源模式
         */
        const data = await newSessionByDataSource(this.connection?.id, true);
        if (!data) {
          return false;
        }
        this.sessionId = data.sessionId;
        this.dataTypes = data.dataTypeUnits;
        await this.initSupportFeature(data.supports);
        this.isAlive = true;
        return true;
      } else {
        /**
         * 数据库模式
         */
        const data = await newSessionByDataBase(this.odcDatabase?.id, true, recordDbAccessHistory);
        if (!data) {
          return false;
        }
        this.sessionId = data.sessionId;
        this.dataTypes = data.dataTypeUnits;
        this.charsets = data.charsets;
        this.collations = data.collations;
        await this.initSupportFeature(data.supports);
        this.isAlive = true;
        return await this.initSessionBaseInfo();
      }
    } catch (e) {
      logger.error('create session error', e);
      return false;
    }
  }

  // async initWithExistSessionId(sessionId: string, dbName?: string) {
  //   this.sessionId = sessionId;
  //   this.isAlive = true;
  //   if (await this.initSessionBaseInfo(dbName)) {
  //     return true;
  //   } else {
  //     showReConnectModal();
  //     return false;
  //   }
  // }

  async initSessionBaseInfo() {
    if (!this.odcDatabase) {
      return false;
    }

    try {
      await this.useDataBase(this.odcDatabase.name);
      if (!this.database) {
        return;
      }
      await this.initSessionStatus(true, isLogicalDatabase(this?.odcDatabase));
      if (!this.transState) {
        return false;
      }
      return true;
    } catch (e) {
      logger.error('initSessionBaseInfo error', e);
      return false;
    }
  }

  /**
   * 切换数据库
   */
  @action
  async useDataBase(dbName: string) {
    if (!dbName) {
      logger.error('getDefaultDBName error');
      return false;
    }
    this.database = await DatabaseStore.createInstance(
      this.sessionId,
      dbName,
      this.odcDatabase?.id,
      this.odcDatabase?.type,
    );
    if (!this.database) {
      return false;
    }
    return true;
  }

  @action
  public async initSupportFeature(data: any) {
    if (!data) {
      throw new Error('getSupportFeature error');
    }
    await this.initSessionStatus(true);
    const keyValueMap = {
      support_show_foreign_key: 'enableShowForeignKey',
      support_partition_modify: 'enableCreatePartition',
      support_procedure: 'enableProcedure',
      support_function: 'enableFunction',
      support_constraint_modify: 'enableConstraintModify',
      support_constraint: 'enableConstraint',
      support_view: 'enableView',
      support_sequence: 'enableSequence',
      support_package: 'enablePackage',
      support_rowid: 'enableRowId',
      support_trigger: 'enableTrigger',
      support_trigger_ddl: 'enableTriggerDDL',
      support_trigger_compile: 'enableTriggerCompile',
      support_trigger_alterstatus: 'enableTriggerAlterStatus',
      support_trigger_references: 'enableTriggerReferences',
      support_type: 'enableType',
      support_synonym: 'enableSynonym',
      support_recycle_bin: 'enableRecycleBin',
      support_shadowtable: 'enableShadowSync',
      support_partition_plan: (allConfig) => {
        this.supportFeature.enablePartitionPlan =
          settingStore.enablePartitionPlan && allConfig['support_partition_plan'];
      },
      support_column_group: 'enableColumnStore',
      support_async: (allConfig) => {
        this.supportFeature.enableAsync =
          settingStore.enableAsyncTask && allConfig['support_async'];
      },
      support_db_export: (allConfig) => {
        this.supportFeature.enableDBExport =
          settingStore.enableDBExport && allConfig['support_db_export'];
      },
      support_db_import: (allConfig) => {
        this.supportFeature.enableDBImport =
          settingStore.enableDBImport && allConfig['support_db_import'];
      },
      support_mock_data: (allConfig) => {
        this.supportFeature.enableMockData =
          settingStore.enableMockdata && allConfig['support_mock_data'];
      },
      support_obclient: (allConfig) => {
        this.supportFeature.enableObclient =
          settingStore.enableOBClient && allConfig['support_obclient'];
      },
      support_kill_session: (allConfig) => {
        this.supportFeature.enableKillSession = allConfig['support_kill_session'];
      },
      support_kill_query: (allConfig) => {
        this.supportFeature.enableKillQuery = allConfig['support_kill_query'];
      },
      support_sql_trace: 'enableSQLTrace',
      support_sql_explain: 'enableSQLExplain',
      support_pl_debug: (allConfig) => {
        this.supportFeature.enablePLDebug = allConfig['support_pl_debug'];
      },
      support_external_table: 'enableExternalTable',
      support_materialized_view: 'enableMaterializedView',
    };
    const allConfig = {};
    data?.forEach((item) => {
      allConfig[item.supportType] = !!item.support;
    });
    data?.forEach((feature) => {
      const { support, supportType } = feature;
      const value = keyValueMap[supportType];
      if (isFunction(value)) {
        value(allConfig);
      } else if (typeof value === 'string') {
        this.supportFeature[value] = support;
      }
      const obVersion = this?.params?.obVersion;
      this.supportFeature.enableProfile =
        [ConnectionMode.OB_MYSQL, ConnectionMode.OB_ORACLE].includes(
          this.connection?.dialectType,
        ) &&
        isString(obVersion) &&
        OBCompare(obVersion, ODC_PROFILE_SUPPORT_VERSION, '>=');
    });
  }

  @action
  public async queryTablesAndViews(name: string = '', force: boolean = false) {
    const sid = generateDatabaseSid(this.database?.dbName, this.sessionId);
    const now = Date.now();

    if (now - this.lastTableAndViewLoadTime < 15000 && !force) {
      return this.allTableAndView;
    }
    this.lastTableAndViewLoadTime = now;
    const res = await request.get(`/api/v1/view/listAll/${sid}`, {
      params: {
        name,
      },
    });
    if (!res || !res.data) {
      this.lastTableAndViewLoadTime = 0;
      return [];
    }
    const tables = {};
    const views = {};
    const { tables: srcTables = [], views: srcViews = [] } = res.data;
    return runInAction(() => {
      srcTables.forEach((item) => {
        tables[item.databaseName] = item.tables;
        const dbObj = this.allTableAndView[item.databaseName] || { tables: [], views: [] };
        dbObj.tables = item.tables;
        this.allTableAndView[item.databaseName] = { ...dbObj };
      });
      srcViews.forEach((item) => {
        views[item.databaseName] = item.views;
        const dbObj = this.allTableAndView[item.databaseName] || { tables: [], views: [] };
        dbObj.views = item.views;
        this.allTableAndView[item.databaseName] = { ...dbObj };
      });
      return this.allTableAndView;
    });
  }

  @action
  public async queryTablesAndMaterializedViews(name: string = '', force: boolean = false) {
    const res = await request.get(
      `/api/v2/connect/sessions/${this.sessionId}/listMaterializedViewBases`,
      {
        params: {
          name,
        },
      },
    );
    const tables = {};
    const mvs = {};
    const { tables: srcTables = [], mvs: srcMvs = [] } = res?.data;
    return runInAction(() => {
      srcTables.forEach((item) => {
        tables[item.databaseName] = item.tables;
        const dbObj = this.allTableAndMaterializedViews[item.databaseName] || {
          tables: [],
          mvs: [],
        };
        dbObj.tables = item.tables;
        this.allTableAndMaterializedViews[item.databaseName] = { ...dbObj };
      });
      srcMvs.forEach((item) => {
        mvs[item.databaseName] = item.mvs;
        const dbObj = this.allTableAndMaterializedViews[item.databaseName] || {
          tables: [],
          mvs: [],
        };
        dbObj.mvs = item.mvs;
        this.allTableAndMaterializedViews[item.databaseName] = { ...dbObj };
      });
      return this.allTableAndMaterializedViews;
    });
  }

  @action
  public async initSessionStatus(init: boolean = false, isLogicDbSessionInit: boolean = false) {
    try {
      const data = await getSessionStatus(this.sessionId);
      this.params.autoCommit = data?.settings?.autocommit;
      this.params.maxQueryLimit = data?.settings?.maxQueryLimit;
      this.params.delimiter = data?.settings?.delimiter || DEFAULT_DELIMITER;
      this.params.queryLimit = data?.settings?.queryLimit;
      this.params.obVersion = data?.settings?.obVersion;
      this.params.defaultTableStoreFormat = data?.session?.defaultTableStoreFormat;
      this.params.killCurrentQuerySupported = data?.session?.killCurrentQuerySupported;
      if (init) {
        this.params.tableColumnInfoVisible =
          setting.configurations['odc.sqlexecute.default.fetchColumnInfo'] === 'true';
        this.params.fullLinkTraceEnabled =
          setting.configurations['odc.sqlexecute.default.fullLinkTraceEnabled'] === 'true';
        this.params.continueExecutionOnError =
          setting.configurations['odc.sqlexecute.default.continueExecutionOnError'] === 'true';
      }
      if (data?.session) {
        this.transState = data?.session;
      }
      if (isLogicDbSessionInit) {
        /* TODO */
        this.transState = {
          sid: null,
          sessionId: null,
          state: null,
          transState: null,
          transId: null,
          sqlId: null,
          activeQueries: null,
          defaultTableStoreFormat: null,
          killCurrentQuerySupported: false,
        };
      }
    } catch (e) {
      console.error(e);
      this.params.autoCommit = true;
    }
  }

  @action
  public async getRecycleObjectList() {
    // ListRecycleObjects
    const res = await request.get(`/api/v2/recyclebin/list/${generateSessionSid(this.sessionId)}`);
    const recycleObjects = res?.data || [];
    this.recycleObjects = recycleObjects.map((r: IRecycleObject, i: number) => ({
      ...r,
      id: `${(r.schema && r.schema + '.') || ''}${r.originName}`,
      // 展示 id，可能重复
      uniqueId: `${(r.schema && r.schema + '.') || ''}${r.originName}.${i}`,
      // 生成唯一 id
      initialNewName: r.newName, // 保存原始重命名
    }));
  }

  @action
  public updateRecycleObjectName(obj) {
    this.recycleObjects = obj;
  }

  @action
  public resetNewNames() {
    this.recycleObjects = this.recycleObjects.map((r) => ({
      ...r,
      newName: r.initialNewName,
    }));
  }

  @action
  public async destory(force: boolean = false) {
    this.isAlive = false;
    console.log(generateSessionSid(this.sessionId));
    await request.delete(`/api/v2/datasource/sessions`, {
      data: { sessionIds: [generateSessionSid(this.sessionId)], delay: force ? null : 60 },
    });
  }

  static async batchDestory(sessions: SessionStore[], force: boolean = false) {
    const sessionIds = sessions?.map((session) => generateSessionSid(session.sessionId));
    if (!sessionIds?.length) {
      return;
    }
    await request.delete(`/api/v2/datasource/sessions`, {
      data: {
        sessionIds: sessions?.map((session) => generateSessionSid(session.sessionId)),
        delay: force ? null : 60,
      },
    });
    sessions.forEach((session) => {
      session.isAlive = false;
    });
  }

  @action
  public async queryIdentities(identityNameLike?: string) {
    const now = Date.now();
    if (now - this.lastIdentitiesLoadTime.get(identityNameLike || 'default') < 15000) {
      return;
    }
    this.lastIdentitiesLoadTime.set(identityNameLike || 'default', now);
    let supportType = ['TABLE', 'VIEW'];
    this.supportFeature.enableExternalTable && supportType.push('EXTERNAL_TABLE');
    this.supportFeature.enableMaterializedView && supportType.push('MATERIALIZED_VIEW');
    const data = await queryIdentities(
      supportType,
      this.sessionId,
      this.database?.dbName,
      identityNameLike,
    );
    if (!data) {
      this.lastTableAndViewLoadTime = 0;
    }
    runInAction(() => {
      data?.forEach((item) => {
        const { schemaName, identities } = item;
        this.allIdentities[schemaName] = {
          tables: [],
          views: [],
          external_table: [],
          materialized_view: [],
        };
        identities.forEach((identity) => {
          const { type, name } = identity;

          switch (type) {
            case 'TABLE': {
              this.allIdentities[schemaName].tables.push(name);
              return;
            }
            case 'VIEW': {
              this.allIdentities[schemaName].views.push(name);
              return;
            }
            case 'EXTERNAL_TABLE': {
              this.allIdentities[schemaName].external_table.push(name);
              return;
            }
            case 'MATERIALIZED_VIEW': {
              this.allIdentities[schemaName].materialized_view.push(name);
              return;
            }
          }
        });
      });
    });
  }

  /**
   * delimiter
   */
  @action
  public changeDelimiter = async (v: string) => {
    this.params.delimiterLoading = true;
    const isSuccess = await changeDelimiter(v, this.sessionId, this.database?.dbName);
    runInAction(() => {
      if (isSuccess) {
        this.params.delimiter = v;
      }
      this.params.delimiterLoading = false;
    });
    return isSuccess;
  };

  @action
  public setQueryLimit = async (num: number) => {
    const isSuccess = await setTransactionInfo(
      {
        queryLimit: num,
      },
      this.sessionId,
    );
    if (isSuccess) {
      this.params.queryLimit = num;
    }
    return isSuccess;
  };

  @action
  public addBuiltinSnippets = async () => {
    const data = await getBuiltinSnippets(this.sessionId);
    this.snippets = data;
  };

  @action
  public changeColumnInfoVisible = async (v: boolean) => {
    this.params.tableColumnInfoVisible = v;
  };
  @action
  public changeFullTraceDiagnosisEnabled = async (v: boolean) => {
    this.params.fullLinkTraceEnabled = v;
  };
  @action
  public changeContinueExecutionOnError = async (v: boolean) => {
    this.params.continueExecutionOnError = v;
  };
}

export default SessionStore;
