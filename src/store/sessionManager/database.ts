import { switchSchema } from '@/common/network/connection';
import { generateDatabaseSid } from '@/common/network/pathUtil';
import { getSynonymList } from '@/common/network/synonym';
import { getTableInfo } from '@/common/network/table';
import { getTypeList } from '@/common/network/type';
import {
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
} from '@/d.ts';
import { ITableModel } from '@/page/Workspace/components/CreateTable/interface';
import logger from '@/util/logger';
import request from '@/util/request';
import { action, observable, runInAction } from 'mobx';

class DatabaseStore {
  @observable.shallow
  public tables: Array<Partial<ITableModel>> = [];

  @observable.shallow
  public views: Array<Partial<IView>> = [];

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

  public readonly sessionId: string = null;

  public readonly dbName: string = null;

  static async createInstance(sessionId: string, dbName: string) {
    const db = new DatabaseStore(sessionId, dbName);
    if (await db.init()) {
      return db;
    }
  }

  constructor(sessionId, dbName) {
    this.sessionId = sessionId;
    this.dbName = dbName;
  }

  async init(): Promise<boolean> {
    try {
      const isSuccess = await switchSchema([this.sessionId], this.dbName);
      if (!isSuccess) {
        return false;
      }
      /**
       * 这里只需要先去请求表列表，其他的对象使用到再去获取。
       */
      await this.getTableList();
      return true;
    } catch (e) {
      logger.error('create database error', e);
      return false;
    }
  }

  @action
  public async getTableList() {
    const sid = generateDatabaseSid(this.dbName, this.sessionId);
    const data = await request.get(`/api/v1/table/list/${sid}`);
    runInAction(() => {
      this.tables =
        data?.data?.map((table: ITable) => ({
          info: {
            tableName: table.tableName,
            character: table.character,
            collation: table.collation,
            comment: table.comment,
            DDL: table.ddlSql,
            updateTime: table.gmtModified,
            createTime: table.gmtCreated,
            tableSize: table.tableSize,
          },
        })) || [];
    });
  }

  @action
  public async loadTable(tableName: string) {
    const table = await getTableInfo(tableName, this.dbName, this.sessionId);
    const idx = this.tables.findIndex((t) => t.info.tableName === tableName);
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
    const sid = generateDatabaseSid(this.dbName, this.sessionId);
    const ret = await request.get(`/api/v1/view/list/${sid}`);
    runInAction(() => {
      this.views = ret?.data || [];
    });
  }

  @action
  public async getFunctionList(ignoreError?: boolean) {
    const sid = generateDatabaseSid(this.dbName, this.sessionId);
    const ret = await request.get(`/api/v1/function/list/${sid}`, {
      params: {
        ignoreError,
      },
    });
    runInAction(() => {
      this.functions = ret?.data || [];
    });
  }

  @action
  public async getProcedureList() {
    const sid = generateDatabaseSid(this.dbName, this.sessionId);
    const ret = await request.get(`/api/v1/procedure/list/${sid}`);
    runInAction(() => {
      this.procedures = ret?.data || [];
    });
  }

  @action
  public async getTriggerList() {
    const sid = generateDatabaseSid(this.dbName, this.sessionId);
    const res = await request.get(`/api/v1/trigger/list/${sid}`);
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
    const types = await getTypeList(this.dbName, this.sessionId);

    this.types = types || [];
  }

  @action
  public async getPackageList() {
    const sid = generateDatabaseSid(this.dbName, this.sessionId);
    const ret = await request.get(`/api/v1/package/list/${sid}`);
    this.packages = ret?.data || [];
  }

  @action
  public async getSynonymList() {
    const synonym = await getSynonymList(SynonymType.COMMON, this.dbName, this.sessionId);

    this.synonyms = synonym || [];
  }

  @action
  public async getPublicSynonymList() {
    const synonym = await getSynonymList(SynonymType.PUBLIC, this.dbName, this.sessionId);

    this.synonyms = synonym || [];
  }
}

export default DatabaseStore;
