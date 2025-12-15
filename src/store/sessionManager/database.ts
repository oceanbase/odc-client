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
  removeExternalResource,
  downloadExternalResourceFile,
  getExternalResourceList,
  getFunctionByFuncName,
  getProcedureByProName,
  loadExternalResourceDetail,
} from '@/common/network';
import {
  generateDatabaseSid,
  generateDatabaseSidByDataBaseId,
  generatePackageSid,
  generateViewSid,
} from '@/common/network/pathUtil';
import { getSynonymList } from '@/common/network/synonym';
import { getTableInfo, getLogicTableInfo } from '@/common/network/table';
import { getType, getTypeList } from '@/common/network/type';
import {
  DbObjectType,
  IFunction,
  IPackage,
  IProcedure,
  ISequence,
  ISynonym,
  ITable,
  ITrigger,
  IType,
  IView,
  SynonymType,
  IMaterializedView,
} from '@/d.ts';
import { getMaterializedView } from '@/common/network/materializedView/index';
import { ITableModel, TableInfo } from '@/page/Workspace/components/CreateTable/interface';
import { formatMessage } from '@/util/intl';
import request from '@/util/request';
import { action, observable, runInAction } from 'mobx';
import { DBType } from '@/d.ts/database';
import { IExternalResource } from '@/d.ts/externalResoruce';

class DatabaseStore {
  static a() {
    throw new Error('Method not implemented.');
  }
  @observable.shallow
  public tables: Array<Partial<ITableModel>> = [];

  @observable public static refreshKey: string = undefined;

  @observable.shallow
  public externalTableTables: Array<Partial<ITableModel>> = [];

  @observable.shallow
  public views: Array<Partial<IView>> = [];

  @observable.shallow
  public materializedView: Array<Partial<IMaterializedView>> = [];

  @observable.shallow
  public functions: Array<Partial<IFunction>> = [];

  @observable.shallow
  public procedures: Array<Partial<IProcedure>> = [];

  @observable.shallow
  public sequences: Array<Partial<ISequence>> = [];

  @observable.shallow
  public packages: Array<Partial<IPackage>> = [];

  @observable.shallow
  public triggers: Array<Partial<ITrigger>> = [];

  @observable.shallow
  public synonyms: Array<Partial<ISynonym>> = [];

  @observable.shallow
  public publicSynonyms: Array<Partial<ISynonym>> = [];

  @observable.shallow
  public types: Array<Partial<IType>> = [];

  @observable.shallow
  public externalResources: Array<Partial<IExternalResource>> = [];

  private static setRefreshKey(key: string) {
    runInAction(() => {
      this.refreshKey = key;
    });
  }

  private static resetRefreshKey() {
    runInAction(() => {
      this.refreshKey = undefined;
    });
  }

  /**
   * version 用来标识这个列表的获取时间，在很多场景下，需要感知当前对象的版本，以此来区分新老版本来做出对应的变化
   * 这里的 version 目前使用时间戳来标识
   */

  // public tableVersion: number = 0;
  // public externalTableTableVersion: number = 0;
  // public viewVersion: number = 0;
  // public functionVersion: number = 0;
  // public procedureVersion: number = 0;
  // public sequenceVersion: number = 0;
  // public packageVersion: number = 0;
  // public triggerVersion: number = 0;
  // public synonymVersion: number = 0;
  // public publicSynonymVersion: number = 0;
  // public typeVersion: number = 0;

  public readonly sessionId: string = null;

  public readonly dbName: string = null;
  public readonly databaseIdType: DBType = null;

  public readonly databaseId: number = null;

  static async createInstance(sessionId: string, dbName: string, databaseId: number, type: DBType) {
    const db = new DatabaseStore(sessionId, dbName, databaseId, type);
    return db;
  }

  constructor(sessionId, dbName, databaseId, type) {
    this.sessionId = sessionId;
    this.dbName = dbName;
    this.databaseId = databaseId;
    this.databaseIdType = type;
  }

  @action
  /**
   * isExternalTable 表示是否为外表
   *
   */
  public async getTableList(isExternalTable?: boolean) {
    const sid = generateDatabaseSidByDataBaseId(this.databaseId, this.sessionId);

    const params: { databaseId: number; includePermittedAction: boolean; type?: string } = {
      databaseId: this.databaseId,
      includePermittedAction: true,
    };
    let refreshKey = `${this.databaseId}-${this.dbName}-table`;
    if (isExternalTable) {
      params.type = 'EXTERNAL_TABLE';
      refreshKey = `${this.databaseId}-${this.dbName}-externalTable`;
    }
    DatabaseStore.setRefreshKey(refreshKey);
    const data = await request.get(`/api/v2/databaseSchema/tables`, {
      params,
    });
    DatabaseStore.resetRefreshKey();
    runInAction(() => {
      const tablesValue: Partial<ITableModel>[] =
        data?.data?.contents?.map((table: ITable) => ({
          info: {
            tableName: table.name,
            character: table.character,
            collation: table.collation,
            comment: table.comment,
            DDL: table.ddlSql,
            updateTime: table.gmtModified,
            createTime: table.gmtCreated,
            tableSize: table.tableSize,
            authorizedPermissionTypes: table.authorizedPermissionTypes || [],
            tableId: table.id,
          },
        })) || [];
      isExternalTable ? (this.externalTableTables = tablesValue) : (this.tables = tablesValue);
    });
  }

  @action
  public async getLogicTableList() {
    const data = await request.get(
      `/api/v2/connect/logicaldatabase/logicalDatabases/${this.databaseId}`,
    );
    runInAction(() => {
      this.tables =
        data?.data?.logicalTables?.map((table: ITable) => ({
          info: {
            tableName: table.name,
            character: table?.character,
            collation: table?.collation,
            comment: table?.comment,
            DDL: table?.ddlSql,
            updateTime: table?.gmtModified,
            createTime: table?.gmtCreated,
            tableSize: table?.tableSize,
            authorizedPermissionTypes: table?.authorizedPermissionTypes || [],
            isLogicalTable: true,
            tableId: table?.id,
            databaseId: this?.databaseId,
          },
        })) || [];
    });
  }

  @action
  public async loadTable(tableInfo: TableInfo, isExternalTable?: boolean) {
    const { tableName, authorizedPermissionTypes, isLogicalTable, tableId, databaseId } = tableInfo;
    let table;
    if (isLogicalTable) {
      table = await getLogicTableInfo(databaseId, tableId);
    } else {
      table = await getTableInfo(tableName, this.dbName, this.sessionId, isExternalTable);
    }
    if (!table) {
      return;
    }
    // 保持权限字段不被覆盖
    if (table.info) {
      table.info.authorizedPermissionTypes = authorizedPermissionTypes;
    }

    const idx = this.tables.findIndex((t) => t.info.tableName === tableName);

    // 外表数据
    const externalTableIdx = this.externalTableTables.findIndex(
      (t) => t.info.tableName === tableName,
    );

    if (externalTableIdx > -1 && isExternalTable) {
      const newExternalTable = [...this.externalTableTables];
      newExternalTable[externalTableIdx] = table;
      runInAction(() => {
        this.externalTableTables = newExternalTable;
      });
    }
    if (idx > -1) {
      const newTables = [...this.tables];
      newTables[idx] = table;
      runInAction(() => {
        this.tables = newTables;
      });
    }
  }

  @action
  public async getViewList() {
    const params: { databaseId: number; includePermittedAction: boolean; type?: string } = {
      databaseId: this.databaseId,
      includePermittedAction: true,
      type: DbObjectType.view,
    };
    DatabaseStore.setRefreshKey(`${this.databaseId}-${this.dbName}-view`);
    const res = await request.get(`/api/v2/databaseSchema/tables`, {
      params,
    });
    DatabaseStore.resetRefreshKey();
    runInAction(() => {
      this.views =
        res?.data?.contents?.map((t) => {
          return {
            ...t,
            viewName: t.name,
            schemaName: t?.database?.name,
            info: {
              authorizedPermissionTypes: t.authorizedPermissionTypes,
            },
          };
        }) || [];
    });
  }

  @action
  public async loadView(viewName: string) {
    const sid = generateViewSid(viewName, this.dbName, this.sessionId);
    const { data: view } = (await request.get(`/api/v1/view/${sid}`)) || {};
    const newView = { ...view, columns: view.columns || [] };
    const idx = this.views.findIndex((t) => t.viewName === viewName);
    if (idx > -1) {
      const newViews = [...this.views];
      newViews[idx] = newView;
      runInAction(() => {
        this.views = newViews;
      });
    }
  }

  @action
  public async loadMaterializedView(materializedViewInfo) {
    const { name: materializedViewName } = materializedViewInfo;
    const newMvView = await getMaterializedView({
      materializedViewName,
      sessionId: this.sessionId,
      dbName: this.dbName,
    });
    if (newMvView.info) {
      newMvView.info.authorizedPermissionTypes = materializedViewInfo.authorizedPermissionTypes;
    }
    const idx = this.materializedView.findIndex((t) => t?.info?.name === materializedViewName);
    if (idx > -1) {
      const newMvViews = [...this.materializedView];
      newMvViews[idx] = newMvView;
      runInAction(() => {
        this.materializedView = newMvViews;
      });
    }
  }

  @action
  public async getMaterializedViewList() {
    DatabaseStore.setRefreshKey(`${this.databaseId}-${this.dbName}-materializedView`);
    const res = await request.get(
      `/api/v2/connect/sessions/${this.sessionId}/databases/${this.databaseId}/materializedViews`,
      {
        params: {
          materializedViews: true,
          includePermittedAction: true,
        },
      },
    );
    DatabaseStore.resetRefreshKey();
    runInAction(() => {
      this.materializedView =
        res?.data?.contents?.map((t) => {
          return {
            info: {
              ...t,
            },
          };
        }) || [];
    });
  }

  @action
  public async getFunctionList(ignoreError?: boolean) {
    const sid = generateDatabaseSid(this.dbName, this.sessionId);
    DatabaseStore.setRefreshKey(`${this.databaseId}-${this.dbName}-function-pkg`);
    const ret = await request.get(`/api/v1/function/list/${sid}`, {
      params: {
        ignoreError,
      },
    });
    DatabaseStore.resetRefreshKey();
    runInAction(() => {
      this.functions = ret?.data || [];
    });
  }

  @action
  public async loadFunction(funName: string) {
    const func = await getFunctionByFuncName(funName, false, this.sessionId, this.dbName);
    const idx = this.functions.findIndex((t) => t.funName === funName);
    if (!func) {
      return;
    }
    if (idx !== -1) {
      this.functions[idx] = {
        ...func,
        // 漠高：status 只能在列表里查到
        status: this.functions[idx].status,
      };
    }

    return func;
  }

  @action
  public async getProcedureList() {
    const sid = generateDatabaseSid(this.dbName, this.sessionId);
    DatabaseStore.setRefreshKey(`${this.databaseId}-${this.dbName}-procedure`);
    const ret = await request.get(`/api/v1/procedure/list/${sid}`);
    DatabaseStore.resetRefreshKey();
    runInAction(() => {
      this.procedures = ret?.data || [];
    });
  }

  @action
  public async loadProcedure(procName: string) {
    const func = await getProcedureByProName(procName, false, this.sessionId, this.dbName);
    const idx = this.procedures.findIndex((t) => t.proName === procName);
    if (!func) {
      return;
    }
    if (idx !== -1) {
      this.procedures[idx] = {
        ...func,
        // 漠高：status 只能在列表里查到
        status: this.procedures[idx].status,
      };
    }

    return func;
  }

  @action
  public async getTriggerList() {
    const sid = generateDatabaseSid(this.dbName, this.sessionId);
    DatabaseStore.setRefreshKey(`${this.databaseId}-${this.dbName}-trigger`);
    const res = await request.get(`/api/v1/trigger/list/${sid}`);
    DatabaseStore.resetRefreshKey();
    runInAction(() => {
      this.triggers = res?.data || [];
    });
  }

  @action
  public async getSequenceList() {
    const sid = generateDatabaseSid(this.dbName, this.sessionId);
    const ret = (await request.get(`/api/v1/sequence/list/${sid}`)) || {};
    this.sequences = ret?.data || [];
  }

  @action
  public async getTypeList() {
    DatabaseStore.setRefreshKey(`${this.databaseId}-${this.dbName}-type`);
    const types = await getTypeList(this.dbName, this.sessionId);
    DatabaseStore.resetRefreshKey();

    this.types = types || [];
  }

  @action
  public async getExternalResourceList() {
    DatabaseStore.setRefreshKey(`${this.databaseId}-${this.dbName}-externalResource`);
    const externalResources = await getExternalResourceList(this.dbName, this.sessionId);
    DatabaseStore.resetRefreshKey();

    runInAction(() => {
      this.externalResources = externalResources;
    });
  }

  @action
  public async loadExternalResource(resourceInfo: Partial<IExternalResource>) {
    try {
      const { name: resourceName } = resourceInfo;
      const resourceData = await loadExternalResourceDetail(
        resourceName,
        this.dbName,
        this.sessionId,
      );

      if (resourceData) {
        // 更新当前资源的详细信息
        const idx = this.externalResources.findIndex((r) => r.name === resourceName);
        if (idx > -1) {
          const newExternalResources = [...this.externalResources];
          newExternalResources[idx] = {
            ...newExternalResources[idx],
            ...resourceData,
          };
          runInAction(() => {
            this.externalResources = newExternalResources;
          });
        }
        return resourceData;
      } else {
        console.error('加载外部资源详情失败');
      }
    } catch (error) {
      console.error('加载外部资源详情异常:', error);
    }
    return null;
  }

  @action
  public async downloadExternalResource(resourceInfo: IExternalResource) {
    try {
      const { name: resourceName } = resourceInfo;
      return await downloadExternalResourceFile(resourceName, this.dbName, this.sessionId);
    } catch (error) {
      console.error('下载外部资源异常:', error);
      return false;
    }
  }

  @action
  public async deleteExternalResource(resourceInfo: IExternalResource) {
    try {
      const { name: resourceName } = resourceInfo;
      const detail = await loadExternalResourceDetail(resourceName, this.dbName, this.sessionId);
      const success = await removeExternalResource(
        resourceName,
        this.dbName,
        this.sessionId,
        detail.type,
      );

      if (success) {
        // 从本地数组中移除该资源
        runInAction(() => {
          this.externalResources = this.externalResources.filter((r) => r.name !== resourceName);
        });
        console.log('删除外部资源成功');
        return true;
      } else {
        console.error('删除外部资源失败');
        return false;
      }
    } catch (error) {
      console.error('删除外部资源异常:', error);
      return false;
    }
  }

  @action
  public async loadType(typeName: string) {
    const type = await getType(typeName, false, this.dbName, this.sessionId);
    if (!type) {
      return;
    }
    const idx = this.types.findIndex((t) => t.typeName === typeName);
    if (idx !== -1) {
      this.types[idx] = {
        ...type,
        status: this.types[idx].status,
      };
    }
    return type;
  }

  @action
  public async getPackageList() {
    const sid = generateDatabaseSid(this.dbName, this.sessionId);
    DatabaseStore.setRefreshKey(`${this.databaseId}-${this.dbName}-package`);
    const ret = await request.get(`/api/v1/package/list/${sid}`);
    DatabaseStore.resetRefreshKey();
    this.packages = ret?.data || [];
  }

  @action
  public async loadPackage(pkgName: string, ignoreError?: boolean) {
    const sid = generatePackageSid(pkgName, this.sessionId, this.dbName);
    const res = await request.get(`/api/v1/package/${sid}`, {
      params: {
        ignoreError,
      },
    });
    const data = res?.data;
    const packageName = data?.packageName;
    if (data) {
      const dbId = this.databaseId;
      function addKey(target, paramName) {
        const keyMap = {};
        target[paramName] = target[paramName]
          ?.map((obj) => {
            const { params, returnType, proName, funName } = obj;
            const name = proName || funName;
            const key = btoa(
              encodeURIComponent(
                params
                  ?.map((p) => {
                    return p.paramName + ':' + p.dataType;
                  })
                  ?.join('$@p@$') +
                  '$@' +
                  returnType,
              ),
            );
            const uniqKey = `id:${dbId}-` + packageName + '.' + name + '*' + key;
            if (keyMap[uniqKey]) {
              /**
               * 去除完全一致的子程序
               */
              return null;
            }
            keyMap[uniqKey] = key;
            return {
              ...obj,
              params: params?.map((param) =>
                Object.assign({}, param, {
                  originDefaultValue: param.defaultValue,
                }),
              ),
              key: uniqKey,
            };
          })
          .filter(Boolean);
      }
      const pkgBody = data.packageBody;
      const pkgHead = data.packageHead;
      if (pkgBody) {
        addKey(pkgBody, 'functions');
        addKey(pkgBody, 'procedures');
      }
      if (pkgHead) {
        addKey(pkgHead, 'functions');
        addKey(pkgHead, 'procedures');
      }
    } else {
      return null;
    }
    const { packageBody, packageHead } = data || {};

    if (!packageHead && !packageBody) {
      throw new Error(
        formatMessage({
          id: 'odc.src.store.schema.TheHeaderOfTheObtained',
          defaultMessage: '获取包体包头为空',
        }),
      ); //获取包体包头为空
    }
    const idx = this.packages.findIndex((t) => t.packageName === packageName);
    if (idx !== -1) {
      this.packages[idx] = { ...this.packages[idx], packageBody, packageHead };
    }
    return data;
  }

  @action
  public async getSynonymList() {
    const synonym = await getSynonymList(SynonymType.COMMON, this.dbName, this.sessionId);

    this.synonyms = synonym || [];
  }

  @action
  public async getPublicSynonymList() {
    const synonym = await getSynonymList(SynonymType.PUBLIC, this.dbName, this.sessionId);

    this.publicSynonyms = synonym || [];
  }
}

export default DatabaseStore;
