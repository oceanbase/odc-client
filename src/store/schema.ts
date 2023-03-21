/**
 * @desc 数据库、表元数据相关
 */
import { formatMessage } from '@/util/intl';

import { getFunctionByFuncName, getProcedureByProName } from '@/common/network';
import { getSupportFeatures, switchSchema } from '@/common/network/connection';
import {
  generateDatabaseSid,
  generateFunctionSid,
  generatePackageSid,
  generateProcedureSid,
  generateSequenceSid,
  generateSessionSid,
  generateSynonymSid,
  generateTableSid,
  generateTriggerSid,
  generateViewSid,
} from '@/common/network/pathUtil';
import { getSynonymList } from '@/common/network/synonym';
import { getTableColumnList, queryIdentities } from '@/common/network/table';
import { getType, getTypeList } from '@/common/network/type';
import type {
  ICreateView,
  IDatabase,
  IDataType,
  IFunction,
  IPackage,
  IProcedure,
  IRecycleObject,
  ISequence,
  ISynonym,
  ITable,
  ITableColumn,
  ITableConstraint,
  ITableIndex,
  ITablePartition,
  ITrigger,
  ITriggerForm,
  IType,
  IView,
  TriggerState,
} from '@/d.ts';
import { LobExt, RSModifyDataType, SynonymType } from '@/d.ts';
import schema from '@/store/schema';
import request from '@/util/request';
import { downloadFile, getBlobValueKey } from '@/util/utils';
import { message } from 'antd';
import { isFunction } from 'lodash';
import { action, observable, runInAction } from 'mobx';
import connectionStore from './connection';
import { saveSessionToMetaStore } from './helper/page';
import { default as setting, default as settingStore } from './setting';
export class SchemaStore {
  /** 数据库元信息 */
  @observable
  public charsets: string[] = [];
  @observable
  public collations: string[] = [];
  @observable
  public dataTypes: IDataType[] = [];
  /** 是否支持分区修改 */

  @observable
  public enableCreatePartition: boolean = false;

  @observable
  public enableProcedure: boolean = false;

  @observable
  public enableFunction: boolean = false;

  @observable
  public enableView: boolean = false;

  @observable
  public enableSequence: boolean = false;

  @observable
  public enablePackage: boolean = false;

  @observable
  public enablePLDebug: boolean = false;

  @observable
  public enableConstraintModify: boolean = false;

  @observable
  public enableTrigger: boolean = false;

  @observable
  public enableTriggerDDL: boolean = false;

  @observable
  public enableTriggerCompile: boolean = false;

  @observable
  public enableTriggerAlterStatus: boolean = false;

  @observable
  public enableTriggerReferences: boolean = false;

  @observable
  public enableType: boolean = false;

  @observable
  public enableSynonym: boolean = false;

  @observable
  public enableShowForeignKey: boolean = false;

  /** Oracle mode从2270版本开始，支持rowid */
  @observable
  public enableRowId: boolean = false; // 切换数据库时需要发起大量串行请求

  @observable
  public enableRecycleBin: boolean = false;

  @observable
  public enableAsync: boolean = false;

  @observable
  public enableDBExport: boolean = false;

  @observable
  public enableDBImport: boolean = false;

  @observable
  public enableMockData: boolean = false;

  @observable
  public enableObclient: boolean = false;

  @observable
  public enableKillSession: boolean = false;

  @observable
  public enableKillQuery: boolean = false;

  @observable
  public enableConstraint: boolean = false;

  @observable
  public enableShadowSync: boolean = false;

  @observable
  public enablePartitionPlan: boolean = false;

  /**
   * 执行详情
   */
  @observable
  public enableSQLTrace: boolean = false;
  /**
   * 执行计划
   */
  @observable
  public enableSQLExplain: boolean = false;

  @observable
  public switchingDatabase: boolean = false;
  @observable
  public tables: Array<Partial<ITable>> = [];
  @observable
  public views: Array<Partial<IView>> = [];
  @observable
  public functions: Array<Partial<IFunction>> = [];
  @observable
  public procedures: Array<Partial<IProcedure>> = [];
  @observable
  public sequences: Array<Partial<ISequence>> = [];
  @observable.shallow
  public sequencesMap: {
    [key: string]: ISequence;
  } = {};
  @observable
  public packages: Array<Partial<IPackage>> = [];
  @observable.shallow
  public packagesDetails: {
    [key: string]: IPackage;
  } = {};
  @observable
  public triggers: Array<Partial<ITrigger>> = [];

  @observable
  public synonyms: Array<Partial<ISynonym>> = [];

  @observable
  public synonymType: SynonymType = SynonymType.COMMON;

  @observable
  public types: Array<Partial<IType>> = [];

  @observable.shallow
  public allTableAndView: {
    [dbName: string]: {
      tables: string[];
      views: string[];
    };
  } = {};

  /**
   * 这个里面包含系统视图，后续还有可能包含其余的对象
   */
  @observable.shallow
  public allIdentities: {
    [dbName: string]: {
      tables: string[];
      views: string[];
    };
  } = {};

  public lastTableAndViewLoadTime: number = 0;

  public lastIdentitiesLoadTime: number = 0;

  @observable
  public databases: IDatabase[] = [];
  @observable
  public database: Partial<IDatabase> = {};
  @observable
  public recycleObjects: IRecycleObject[] = [];

  /** 保存资源树展开节点 key，切换数据库时需要清空 */
  @observable
  public loadedTableKeys: string[] = [];
  @observable
  public loadedTableNames: Set<string> = new Set();
  @observable
  public loadedViewKeys: string[] = [];
  @observable
  public loadedPackageKeys: string[] = [];
  @observable
  public loadedFunctionKeys: string[] = [];
  @observable
  public loadedProcedureKeys: string[] = [];

  @observable
  public loadedTypeKeys: string[] = [];

  @action
  public setLoadedTableKeys(keys: string[]) {
    this.loadedTableKeys = keys;
  }

  @action
  public setLoadedViewKeys(keys: string[]) {
    this.loadedViewKeys = keys;
  }

  @action
  public setLoadedPackageKeys(keys: string[]) {
    this.loadedPackageKeys = keys;
  }

  @action
  setLoadedProcedureKeys(keys: string[]) {
    this.loadedProcedureKeys = keys;
  }

  @action setLoadedTypeKeys(keys: string[]) {
    this.loadedTypeKeys = keys;
  }

  @action setLoadedFunctionKeys(keys: string[]) {
    this.loadedFunctionKeys = keys;
  }

  @action
  public clear() {
    this.databases = [];
    this.database = {};
    this.charsets = [];
    this.collations = [];
    this.dataTypes = [];
    this.recycleObjects = [];
    this.enableCreatePartition = false;
    this.enableConstraintModify = false;
    this.enableFunction = false;
    this.enableProcedure = false;
    this.allTableAndView = {};
    this.allIdentities = {};
    this.lastTableAndViewLoadTime = 0;
    this.clearResourceTree();
  }
  /** 数据库相关 */

  @action
  public async getDatabaseList() {
    if (!connectionStore.sessionId) {
      return;
    }
    const result = await request.get(`/api/v1/database/list/${generateSessionSid()}`);
    this.databases = result.data || [];
  }

  @action
  public async updateDatabaseDetail() {
    // 2. 获取数据库详情
    const { data: detail } = (await request.get(`/api/v1/database/${generateDatabaseSid()}`)) || {};
    this.database = { ...this.database, ...detail };
  }

  @action
  public async selectDatabase(dbName: string, firstTime: boolean = false) {
    // 切换数据库
    this.clearResourceTree();
    const sessions = connectionStore.getAllSessionIds();
    this.switchingDatabase = true;
    if (!connectionStore.sessionId) {
      return;
    }
    const isSuccess = await switchSchema(
      sessions.map((s) => generateSessionSid(s)),
      dbName,
    );

    if (!isSuccess) {
      this.switchingDatabase = false;
      throw new Error('switch database error');
    } // 3. 选中当前数据库，补充详情

    /**
     * 在use database成功之后，需要去database list去找对应的详细信息，在这边大小写不一定是敏感的，所以需要找两次
     * 第一次按照大小写敏感来找
     * 第二次按照不敏感来找，不用担心找不到
     * 这样可以保证只要use database成功后，database list里面肯定可以找到对应的信息
     */
    const selected =
      this.databases.find((d) => d.name === dbName) ||
      this.databases.find((d) => d.name.toLowerCase() === dbName?.toLowerCase());
    this.database = { ...selected, name: selected && selected.name }; // 请求数据库详情

    this.updateDatabaseDetail();
    await saveSessionToMetaStore(
      connectionStore.sessionId,
      connectionStore.connection?.sessionName,
      dbName,
    );

    if (selected) {
      // 这里需要注意，不能同时发这些请求，因为后端数据库只有一个连接，同时发由于锁竞争不但不会快，还会由于连接竞争变慢
      // 导致的结果就是，后面到达后端的请求必然超时。
      // 3.1 获取数据库相关的字符集和排序规则、是否支持分区创建、函数以及存储过程
      // 注意，只有第一次进入的时候才需要请求，后续切库不需要
      if (firstTime) {
        await Promise.all([
          this.getDataTypeList(),
          this.initSupportFeatures(),
          this.getCollationList(),
          this.getCharsetList(),
        ]);
      } // 4. 获取表列表

      await this.getTableList();
    }

    this.switchingDatabase = false;
  }

  @action
  public async getCharsetList() {
    const sid = generateDatabaseSid();
    const ret = await request.get(`/api/v1/character/charset/list/${sid}`);
    this.charsets = ret?.data || [];
  }

  @action
  public async getCollationList() {
    const sid = generateDatabaseSid();
    const ret = await request.get(`/api/v1/character/collation/list/${sid}`);
    this.collations = ret?.data || [];
  }

  @action
  public async getDataTypeList() {
    const sid = generateDatabaseSid();
    const ret = await request.get(
      `/api/v1/version-config/datatype/list/${sid}?configKey=column_data_type`,
    );
    this.dataTypes = ret?.data || [];
  }

  @action
  public async initSupportFeatures() {
    const data = await getSupportFeatures();
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
      support_partition_plan: 'enablePartitionPlan',
      support_async: (allConfig) => {
        this.enableAsync = settingStore.enableAsyncTask && allConfig['support_async'];
      },
      support_db_export: (allConfig) => {
        this.enableDBExport = settingStore.enableDBExport && allConfig['support_db_export'];
      },
      support_db_import: (allConfig) => {
        this.enableDBImport = settingStore.enableDBImport && allConfig['support_db_import'];
      },
      support_mock_data: (allConfig) => {
        this.enableMockData = settingStore.enableMockdata && allConfig['support_mock_data'];
      },
      support_obclient: (allConfig) => {
        this.enableObclient = settingStore.enableOBClient && allConfig['support_obclient'];
      },
      support_kill_session: (allConfig) => {
        this.enableKillSession = allConfig['support_kill_session'];
      },
      support_kill_query: (allConfig) => {
        this.enableKillQuery = allConfig['support_kill_query'];
      },
      support_sql_trace: 'enableSQLTrace',
      support_sql_explain: 'enableSQLExplain',
      support_pl_debug: (allConfig) => {
        this.enablePLDebug = allConfig['support_pl_debug'];
      },
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
        this[value] = support;
      }
    });
  }
  /** 表 */

  @action
  public updateTableName(tableName: string, newTableName: string) {
    const table = this.tables.find((t) => t.tableName === tableName);

    if (table) {
      table.tableName = newTableName;
    }
  }

  @action
  public updateTableColumns(tableName: string, columns: ITableColumn[]) {
    const table = this.tables.find((t) => t.tableName === tableName);

    if (table) {
      table.columns = columns;
    }
  }

  @action
  public updateTableIndexes(tableName: string, indexes: ITableIndex[]) {
    const table = this.tables.find((t) => t.tableName === tableName);

    if (table) {
      table.indexes = indexes;
    }
  }

  @action
  public updateTableConstaints(tableName: string, constraints: ITableConstraint[]) {
    const table = this.tables.find((t) => t.tableName === tableName);

    if (table) {
      table.constraints = constraints;
    }
  }

  @action
  public updateTablePartitions(tableName: string, partitions: ITablePartition[]) {
    const table = this.tables.find((t) => t.tableName === tableName);

    if (table) {
      table.partitions = partitions;
    }
  }

  @action
  public async getTableList() {
    const sid = generateDatabaseSid();
    const data = await request.get(`/api/v1/table/list/${sid}`);
    this.tables = data?.data || [];
  }

  @action
  public async refreshTableList() {
    await this!.getTableList();
    // 加载已经展开的节点，需要获取是否是分区表
    // @see aone/issue/23086515

    if (this.loadedTableNames) {
      const tableMap = {};
      this.tables?.forEach((table) => {
        tableMap[table.tableName] = table;
      });
      await Promise.all(
        Array.from(this.loadedTableNames).map(async (tableName) => {
          if (tableMap[tableName]) {
            await this.loadTable(tableName);
          }
        }),
      );
    }

    this.loadedTableNames.clear();
    this.setLoadedTableKeys([]);
  }

  @action
  public async getTableListByDatabaseName(databaseName?: string) {
    const sid = generateDatabaseSid(databaseName);
    const ret = await request.get(`/api/v1/table/list/${sid}`);
    return (ret && ret.data) || [];
  }

  @action
  public async getTableContent(tableName: string) {
    const sid = generateDatabaseSid();
    const databaseName = schema.database.name;
    const ret = await request.get(
      `/api/v2/connect/sessions/${sid}/databases/${databaseName}/tables/${tableName}`,
    );
    return ret?.data;
  }

  @action
  public async getTable(tableName: string) {
    const sid = generateTableSid(tableName);
    const ret = await request.get(`/api/v1/table/${sid}`);
    return ret?.data;
  }

  @action
  public async loadTable(tableName: string) {
    const table = await this.getTable(tableName);
    const idx = this.tables.findIndex((t) => t.tableName === tableName);
    this.tables[idx] = { ...this.tables[idx], ...table };
  }

  @action
  public async getTableUpdateSQL(
    tableName: string,
    options: {
      table: Partial<ITable>;
      columnList?: Array<Partial<ITableColumn>>;
    },
  ): Promise<string> {
    const { table, columnList } = options;
    const sid = generateTableSid(tableName);
    const ret = await request.patch(`/api/v1/table/getUpdateSql/${sid}`, {
      data: {
        table,
        columnList,
      },
    });
    return ret && ret.data && ret.data.sql;
  }
  /** 列 */

  @action
  public async getTableColumnList(
    tableName: string,
    ignoreError: boolean = false,
    databaseName: string = '',
  ) {
    if (tableName) {
      const sid = generateTableSid(tableName, databaseName);
      return await getTableColumnList(tableName, databaseName);
    }

    return [];
  }

  @action
  public async loadTableColumns(tableName: string) {
    const columns = await this.getTableColumnList(tableName);
    this.tables.forEach((t) => {
      if (t.tableName === tableName) {
        t.columns = columns;
      }
    });
  }

  @action
  public async getColumnUpdateSQL(
    tableName: string,
    column: Partial<ITableColumn>,
  ): Promise<string> {
    const sid = generateTableSid(tableName);
    const ret = await request.patch(`/api/v1/column/getUpdateSql/${sid}`, {
      data: { ...column, tableName },
      params: {
        wantCatchError: true,
      },
    });
    return ret && ret.data && ret.data.sql;
  }

  @action
  public async getColumnDeleteSQL(
    tableName: string,
    column: Partial<ITableColumn>,
  ): Promise<string> {
    const sid = generateTableSid(tableName);
    const ret = await request.patch(`/api/v1/column/getDeleteSql/${sid}`, {
      data: { ...column, tableName },
      params: {
        wantCatchError: true,
      },
    });
    return ret && ret.data && ret.data.sql;
  }

  @action
  public async getColumnCreateSQL(
    tableName: string,
    column: Partial<ITableColumn>,
  ): Promise<string> {
    const sid = generateTableSid(tableName);
    const ret = await request.patch(`/api/v1/column/getCreateSql/${sid}`, {
      data: { ...column, tableName },
      params: {
        wantCatchError: true,
      },
    });
    return ret && ret.data && ret.data.sql;
  }
  /** 数据 */

  @action
  public async batchGetDataModifySQL(
    schemaName: string,
    tableName: string,
    columns: Partial<ITableColumn>[],
    useUniqueColumnName: boolean = false,
    updateRows: {
      type: 'INSERT' | 'UPDATE' | 'DELETE';
      row: any;
      initialRow: any;
      enableRowId?: boolean;
    }[],
  ): Promise<{
    sql: string;
    tip: string;
  }> {
    const sid = generateTableSid(tableName);
    const ret = await request.post(`/api/v1/data/batchGetModifySql/${sid}`, {
      data: {
        tableName,
        schemaName,
        rows: updateRows.map((updateRow) => {
          const { type, row, initialRow, enableRowId } = updateRow;
          return {
            operate: type,
            units: this.wrapDataDML(
              tableName,
              row,
              initialRow,
              columns,
              useUniqueColumnName,
              enableRowId,
            ),
          };
        }),
      },
    });
    return {
      sql: ret?.data?.sql,
      tip: ret?.data?.tip,
    };
  }
  /** 索引 */

  @action
  public async getTableIndexList(tableName: string) {
    const sid = generateTableSid(tableName);
    const ret = await request.get(`/api/v1/index/list/${sid}`);
    return ret?.data;
  }

  @action
  public async loadTableIndexes(tableName: string) {
    const indexes = await this.getTableIndexList(tableName);
    this.tables.forEach((t) => {
      if (t.tableName === tableName) {
        t.indexes = indexes || [];
      }
    });
  }

  @action
  public async getIndexDeleteSQL(tableName: string, index: Partial<ITableIndex>): Promise<string> {
    const sid = generateTableSid(tableName);
    const ret = await request.patch(`/api/v1/index/getDeleteSql/${sid}`, {
      data: { ...index, tableName },
    });
    return ret && ret.data && ret.data.sql;
  }

  @action
  public async getIndexCreateSQL(tableName: string, index: Partial<ITableIndex>): Promise<string> {
    const sid = generateTableSid(tableName);
    const ret = await request.patch(`/api/v1/index/getCreateSql/${sid}`, {
      data: { ...index, tableName },
    });
    return ret?.data?.sql;
  }
  /** 约束 */

  @action
  public async getTableConstraintList(tableName: string) {
    const r = await request.get(`/api/v1/constraint/list/${generateTableSid(tableName)}`);
    return (r && r.data) || [];
  }

  @action
  public async loadTableConstraints(tableName: string) {
    const constraints = await this.getTableConstraintList(tableName);
    this.tables.forEach((t) => {
      if (t.tableName === tableName) {
        t.constraints = constraints || [];
      }
    });
  }

  @action
  public async getConstraintDeleteSQL(
    tableName: string,
    constraint: Partial<ITableConstraint>,
  ): Promise<string> {
    const ret = await request.patch(
      `/api/v1/constraint/getDeleteSql/${generateTableSid(tableName)}`,
      {
        data: {
          ...constraint,
          tableName,
        },
        params: {
          wantCatchError: true,
        },
      },
    );
    return ret && ret.data && ret.data.sql;
  }
  /** 分区 */

  @action
  public async getTablePartitionList(tableName: string) {
    const sid = generateTableSid(tableName);
    const ret = await request.get(`/api/v1/partition/list/${sid}`);
    return ret?.data;
  }

  @action
  public async loadTablePartitions(tableName: string) {
    const partitions = await this.getTablePartitionList(tableName);
    this.tables.forEach((t) => {
      if (t.tableName === tableName) {
        t.partitions = partitions;
      }
    });
  }

  @action
  public async getPartitionCreateSQL(tableName: string, partition: Partial<ITablePartition>) {
    const sid = generateTableSid(tableName);
    const ret = await request.patch(`/api/v1/partition/getCreateSql/${sid}`, {
      data: { ...partition, tableName },
    });
    return ret?.data?.sql;
  }

  @action
  public async getPartitionTransformSQL(
    tableName: string,
    partitions: Array<Partial<ITablePartition>>,
  ) {
    const sid = generateTableSid(tableName);
    const ret = await request.patch(`/api/v1/partition/getTransformSql/${sid}`, {
      data: partitions.map((p) => ({ ...p, tableName })),
    });
    return ret?.data?.sql;
  }

  @action
  public async getPartitionSplitSQL(
    tableName: string,
    partitions: Array<Partial<ITablePartition>>,
  ) {
    const sid = generateTableSid(tableName);
    const ret = await request.patch(`/api/v1/partition/getSplitSql/${sid}`, {
      data: partitions.map((p) => ({ ...p, tableName })),
    });
    return ret && ret.data && ret.data.sql;
  }

  @action
  public async getPartitionDeleteSQL(tableName: string, partition: Partial<ITablePartition>) {
    const sid = generateTableSid(tableName);
    const ret = await request.patch(`/api/v1/partition/getDeleteSql/${sid}`, {
      data: { ...partition, tableName },
    });
    return ret && ret.data && ret.data.sql;
  }
  /** 视图 */

  @action
  public async getViewList() {
    const sid = generateDatabaseSid();
    const ret = await request.get(`/api/v1/view/list/${sid}`);
    this.views = ret?.data || [];
  }

  @action
  public async getViewListByDatabaseName(dbName: string) {
    const sid = generateDatabaseSid(dbName);
    const ret = await request.get(`/api/v1/view/list/${sid}`);

    return ret?.data || [];
  }

  @action
  public async getView(viewName: string, dbName?: string) {
    if (viewName) {
      const sid = generateViewSid(viewName, dbName);
      const { data: view } = (await request.get(`/api/v1/view/${sid}`)) || {};
      return { ...view, columns: view.columns || [] };
    }
  }

  @action
  public async loadViewColumns(viewName: string) {
    if (viewName) {
      const view = await this.getView(viewName);

      if (view) {
        this.views.forEach((v) => {
          if (v.viewName === viewName) {
            v.columns = view.columns;
          }
        });
      }
    }
  }

  @action
  public async queryTablesAndViews(name: string = '', force: boolean = false) {
    const sid = generateDatabaseSid();
    const now = Date.now();
    if (!connectionStore.sessionId || !this.database?.name) {
      return;
    }
    if (now - this.lastTableAndViewLoadTime < 10000 && !force) {
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
        const dbObj = this.allTableAndView[item.databaseName] || {
          tables: [],
          views: [],
        };
        dbObj.tables = item.tables;
        this.allTableAndView[item.databaseName] = { ...dbObj };
      });
      srcViews.forEach((item) => {
        views[item.databaseName] = item.views;
        const dbObj = this.allTableAndView[item.databaseName] || {
          tables: [],
          views: [],
        };
        dbObj.views = item.views;
        this.allTableAndView[item.databaseName] = { ...dbObj };
      });
      return this.allTableAndView;
    });
  }

  @action
  public async queryIdentities() {
    const now = Date.now();
    if (now - this.lastIdentitiesLoadTime < 10000) {
      return;
    }
    this.lastIdentitiesLoadTime = now;
    const data = await queryIdentities(['TABLE', 'VIEW']);
    if (!data) {
      this.lastTableAndViewLoadTime = 0;
    }
    runInAction(() => {
      data?.forEach((item) => {
        const { schemaName, identities } = item;
        this.allIdentities[schemaName] = { tables: [], views: [] };
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
          }
        });
      });
    });
  }

  @action
  // yuque/ob/platform/lolu0y
  public async getViewCreateSQL(view: ICreateView) {
    const { viewName } = view;
    const sid = generateViewSid(viewName);
    const ret = await request.patch(`/api/v1/view/getCreateSql/${sid}`, {
      data: view,
    });
    return ret?.data?.sql;
  }

  @action
  public async deleteView(viewName: string) {
    const sid = generateViewSid(viewName);
    const res = await request.delete(`/api/v1/view/${sid}`);
    return !res?.isError;
  }
  /** 函数 */

  @action
  public async getFunctionList(ignoreError?: boolean) {
    const sid = generateDatabaseSid();
    if (!connectionStore.sessionId || !this.database?.name) {
      return;
    }
    const ret = await request.get(`/api/v1/function/list/${sid}`, {
      params: {
        ignoreError,
      },
    });
    this.loadedFunctionKeys = [];
    this.functions = ret?.data || [];
  }

  @action
  public async refreshFunctionList(ignoreError?: boolean) {
    await this.getFunctionList(ignoreError);
    this.setLoadedFunctionKeys([]);
  }

  @action
  public async refreshProcedureList() {
    await this.getProcedureList();
  }

  @action
  public async deleteFunction(funName: string) {
    const sid = generateFunctionSid(funName);
    await request.delete(`/api/v1/function/${sid}`);
  }
  /** 存储过程 */

  @action
  public async getProcedureList() {
    const sid = generateDatabaseSid();
    const ret = await request.get(`/api/v1/procedure/list/${sid}`);
    runInAction(() => {
      this.loadedProcedureKeys = [];
      this.procedures = ret?.data || [];
    });
  }
  /** 程序包列表 */

  @action
  public async getPackageList() {
    const sid = generateDatabaseSid();
    const ret = await request.get(`/api/v1/package/list/${sid}`);
    this.loadedPackageKeys = [];
    this.packages = ret?.data || [];
  }
  /** 创建程序包 SQL */

  @action
  public async getPackageCreateSQL(packageName: string): Promise<string> {
    const sid = generatePackageSid(packageName);
    const ret = await request.patch(`/api/v1/package/getCreateSql/${sid}`, {
      data: {
        packageName,
        packageType: 'package',
      },
    });
    return ret && ret.data && ret.data.sql;
  }
  /** 创建程序包体 SQL */

  @action
  public async getPackageBodyCreateSQL(packageName: string): Promise<string> {
    const sid = generatePackageSid(packageName);
    const ret = await request.patch(`/api/v1/package/getCreateSql/${sid}`, {
      data: {
        packageName,
        packageType: 'packageBody',
      },
    });
    return ret && ret.data && ret.data.sql;
  }

  @action
  public async deletePackage(packageName: string): Promise<boolean> {
    const sid = generatePackageSid(packageName);
    const result = await request.delete(`/api/v1/package/${sid}`);
    return !!result?.data;
  }

  @action
  public async deletePackageBody(packageName: string): Promise<boolean> {
    const sid = generatePackageSid(packageName);
    const result = await request.delete(`/api/v1/package/deletePackageBody/${sid}`);
    return !!result?.data;
  }

  @action
  public async createPackage(packageName: string) {
    const sid = generatePackageSid(packageName);
    const ret = await request.post(`/api/v1/package/${sid}`, {
      data: {
        packageName,
        packageType: 'package',
        packageBody: null,
        packageHead: null,
      },
    });
    return ret?.data;
  }
  /** 程序包详情 */

  @action
  public async getPackage(pkgName: string, ignoreError?: boolean) {
    const sid = generatePackageSid(pkgName);
    const res = await request.get(`/api/v1/package/${sid}`, {
      params: {
        ignoreError,
      },
    });
    const data = res?.data;
    const packageName = data?.packageName;
    if (data) {
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
            const uniqKey = packageName + '.' + name + '*' + key;
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
    }
    return data;
  }

  @action
  public async loadPackage(packageName: string) {
    const pkg = await this.getPackage(packageName);
    if (!pkg) {
      throw new Error(
        formatMessage({ id: 'odc.src.store.schema.FailedToObtainThePackage' }), //获取包失败
      );
    }

    const { packageBody, packageHead } = pkg;

    if (!packageHead && !packageBody) {
      throw new Error(
        formatMessage({ id: 'odc.src.store.schema.TheHeaderOfTheObtained' }), //获取包体包头为空
      );
    }
    this.packagesDetails[packageName] = pkg;
    const idx = this.packages.findIndex((t) => t.packageName === packageName);
    if (idx !== -1) {
      this.packages[idx] = { ...this.packages[idx], packageBody, packageHead };
    }
    return pkg;
  }

  @action
  public async loadFunction(funName: string) {
    const func = await getFunctionByFuncName(funName);
    const idx = this.functions.findIndex((t) => t.funName === funName);

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
  public async loadProcedure(proName: string) {
    const proc = await getProcedureByProName(proName);
    const idx = this.procedures.findIndex((t) => t.proName === proName);

    if (idx !== -1) {
      this.procedures[idx] = {
        ...proc,
        // 漠高：status 只能在列表里查到
        status: this.procedures[idx].status,
      };
    }

    return proc;
  }

  @action
  public async getProcedureCreateSQL(funName: string, func: Partial<IProcedure>) {
    const sid = generateProcedureSid(funName);
    const ret = await request.patch(`/api/v1/procedure/getCreateSql/${sid}`, {
      data: func,
    });
    return ret && ret.data && ret.data.sql;
  }

  @action
  public async deleteProcedure(funName: string) {
    const sid = generateProcedureSid(funName);
    await request.delete(`/api/v1/procedure/${sid}`);
  }
  /** 序列 */

  @action
  public async getSequenceList() {
    const sid = generateDatabaseSid();
    const ret = (await request.get(`/api/v1/sequence/list/${sid}`)) || {};
    this.sequences = ret?.data || [];
  }

  @action
  public async getSequence(sequenceName: string, ignoreError?: boolean) {
    const sid = generateSequenceSid(sequenceName);
    const { data: sequence } =
      (await request.get(`/api/v1/sequence/${sid}`, {
        params: {
          ignoreError,
        },
      })) || {};
    this.sequencesMap[sequenceName] = sequence;
    return sequence;
  }

  @action
  public async getSequenceCreateSQL(sequenceName: string, sequence: Partial<ISequence>) {
    const sid = generateSequenceSid(sequenceName);
    const ret = await request.patch(`/api/v1/sequence/getCreateSql/${sid}`, {
      data: sequence,
    });
    return ret && ret.data && ret.data.sql;
  }

  @action
  public async getSequenceUpdateSQL(sequenceName: string, sequence: Partial<ISequence>) {
    const sid = generateSequenceSid(sequenceName);
    const ret = await request.patch(`/api/v1/sequence/getUpdateSql/${sid}`, {
      data: { ...sequence, name: sequenceName },
    });
    return ret && ret.data && ret.data.sql;
  }

  @action
  public async deleteSequence(sequenceName: string) {
    const sid = generateSequenceSid(sequenceName);
    await request.delete(`/api/v1/sequence/${sid}`);
  }

  /** 触发器 */

  @action
  public async getTriggerList() {
    const sid = generateDatabaseSid();
    const res = await request.get(`/api/v1/trigger/list/${sid}`);

    this.triggers = res?.data || [];
  }

  @action
  public async getTrigger(triggerName: string, ignoreError?: boolean) {
    const sid = generateTriggerSid(triggerName);
    const ret = await request.get(`/api/v1/trigger/${sid}`, {
      params: {
        ignoreError,
      },
    });
    return ret?.data;
  }

  @action
  public async setTriggerStatus(triggerName: string, enableState: TriggerState) {
    const sid = generateTriggerSid(triggerName);
    const { data } = await request.patch(`/api/v1/trigger/${sid}`, {
      data: {
        triggerName,
        enableState,
      },
    });
    const triggers = this.triggers.map((trigger) => {
      return trigger.triggerName === triggerName
        ? { ...trigger, enableState: data.enableState || enableState }
        : trigger;
    });
    this.triggers = triggers;
  }

  @action
  public async deleteTrigger(triggerName: string) {
    const sid = generateTriggerSid(triggerName);
    const ret = await request.delete(`/api/v1/trigger/${sid}`);
    return ret && !ret.isError;
  }

  @action
  public async getTriggerCreateSQL(triggerName: string, trigger: Partial<ITriggerForm>) {
    const sid = generateTriggerSid(triggerName);

    const ret = await request.post(`/api/v1/trigger/getCreateSql/${sid}`, {
      data: trigger,
    });
    return ret && ret.data && ret.data.sql;
  }

  @action
  public async loadTrigger(triggerName: string) {
    const trigger = await this.getTrigger(triggerName);
    const idx = this.triggers.findIndex((t) => t.triggerName === triggerName);
    if (idx !== -1) {
      this.triggers[idx] = {
        ...trigger,
      };
    }
    return trigger;
  }

  /** 同义词 */

  @action
  public async getSynonymList() {
    const synonym = await getSynonymList(this.synonymType);

    this.synonyms = synonym || [];
  }

  @action
  public changeSynonymType(synonymType: SynonymType) {
    this.synonymType = synonymType;
  }

  @action
  public async getSynonym(synonymName: string, synonymType: SynonymType, ignoreError?: boolean) {
    const sid = generateSynonymSid(synonymName);
    const ret = await request.get(`/api/v1/synonym/${sid}`, {
      params: {
        synonymType,
        ignoreError,
      },
    });
    return ret?.data;
  }

  @action
  public async deleteSynonym(synonymName: string) {
    const sid = generateSynonymSid(synonymName);
    const res = await request.delete(`/api/v1/synonym/${sid}`, {
      params: {
        synonymType: this.synonymType,
      },
    });

    return !!res?.data;
  }

  @action
  public async getSynonymCreateSQL(synonymName: string, synonym: Partial<ISynonym>) {
    const sid = generateSynonymSid(synonymName);

    const ret = await request.post(`/api/v1/synonym/getCreateSql/${sid}`, {
      data: synonym,
    });
    return ret?.data?.sql;
  }

  /** 类型 */

  @action
  public async getTypeList() {
    const types = await getTypeList();

    this.types = types || [];
  }

  @action
  public async refreshTypeList() {
    await this.getTypeList();
    this.setLoadedTypeKeys([]);
  }

  @action
  public async loadType(typeName: string) {
    const type = await getType(typeName);
    const idx = this.types.findIndex((t) => t.typeName === typeName);
    if (idx !== -1) {
      this.types[idx] = {
        ...type,
        status: this.types[idx].status,
      };
    }
    return type;
  }

  /** 回收站 */

  @action
  public async getRecycleObjectList() {
    // ListRecycleObjects
    const res = await request.get(`/api/v1/recyclebin/list/${generateDatabaseSid()}`);
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
  public async getPurgeAllSQL() {
    const result = await request.patch(
      `/api/v1/recyclebin/getPurgeAllSql/${generateDatabaseSid()}`,
    );
    return result && result.data && result.data.sql;
  }

  @action
  public async getDeleteSQL(recycleObjects: IRecycleObject[]) {
    const sid = generateDatabaseSid();
    const result = await request.patch(`/api/v1/recyclebin/getDeleteSql/${sid}`, {
      data: recycleObjects,
    });
    return result && result.data && result.data.sql;
  }

  @action
  public async getUpdateSQL(recycleObjects: IRecycleObject[]) {
    const sid = generateDatabaseSid();
    const result = await request.patch(`/api/v1/recyclebin/getUpdateSql/${sid}`, {
      data: recycleObjects,
    });
    return result && result.data && result.data.sql;
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
  /** 数据上传下载 */
  public async getDataObjectDownloadUrl(
    sqlId: string,
    columnIndex: number,
    rowIndex: number,
    sessionId: string,
  ) {
    if (setting.isUploadCloudStore) {
      const res = await request.post(`/api/v2/aliyun/specific/DownloadObjectData`, {
        data: {
          sqlId,
          row: rowIndex,
          col: columnIndex,
          sid: generateDatabaseSid(null, sessionId),
        },
      });
      const donwloadUrl = res?.data;
      console.log('get sql object download url: ', donwloadUrl);
      return donwloadUrl;
    } else {
      return (
        window.ODCApiHost +
        `/api/v2/connect/sessions/${generateDatabaseSid(
          null,
          sessionId,
        )}/sqls/${sqlId}/download?row=${rowIndex}&col=${columnIndex}`
      );
    }
  }
  @action
  public async downloadDataObject(
    sqlId: string,
    columnIndex: number,
    rowIndex: number,
    sessionId: string,
  ) {
    if (columnIndex < 0 || rowIndex < 0) {
      message.error(`Download Error (column: ${columnIndex}, row: ${rowIndex}, sqlId: ${sqlId})`);
      return;
    }
    const url = await this.getDataObjectDownloadUrl(sqlId, columnIndex, rowIndex, sessionId);
    if (url) {
      downloadFile(url);
    }
  }

  private clearResourceTree() {
    this.tables = [];
    this.views = [];
    this.functions = [];
    this.procedures = [];
    this.packages = [];
    this.packagesDetails = {};
    this.triggers = [];
    this.sequences = [];
    this.sequencesMap = {};
    this.types = [];
    this.synonyms = [];
    this.loadedTableKeys = [];
    this.loadedViewKeys = [];
    this.loadedTableNames.clear();
    this.loadedPackageKeys = [];
    this.loadedFunctionKeys = [];
    this.loadedProcedureKeys = [];
    this.loadedTypeKeys = [];
    this.switchingDatabase = false;
  }

  private wrapDataDML(
    tableName: string,
    row: any,
    initialRow: any,
    columns: Partial<ITableColumn>[],
    useUniqueColumnName: boolean = false,
    /** 是否支持row id */
    enableRowId: boolean = false,
  ) {
    if (enableRowId) {
      const exsitRowIdColumn = columns.find((column) => {
        return column.dataType === 'ROWID';
      });
      if (!exsitRowIdColumn) {
        columns = [
          {
            columnName: 'ROWID',
            dataType: 'ROWID',
          } as Partial<ITableColumn>,
        ].concat(columns);
      }
    } else {
      columns = columns.filter((column) => {
        return column.dataType !== 'ROWID';
      });
    }

    return columns.map((column, i) => {
      const uniqueColumnName = column?.columnName;
      const blobExt: LobExt = row[getBlobValueKey(uniqueColumnName)];
      return {
        tableName,
        columnName: column.columnName,
        columnType: column.dataType,
        newData: blobExt ? blobExt.info : row[uniqueColumnName],
        oldData: initialRow && initialRow[uniqueColumnName],
        newDataType: blobExt?.type || RSModifyDataType.RAW,
        useDefault: typeof row[uniqueColumnName] === 'undefined' && column.columnName !== 'ROWID',
        primaryKey: column.primaryKey,
      };
    });
  }
}
export default new SchemaStore();
