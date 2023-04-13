import { getFunctionByFuncName, getProcedureByProName } from '@/common/network';
import { switchSchema } from '@/common/network/connection';
import {
  generateDatabaseSid,
  generatePackageSid,
  generateViewSid,
} from '@/common/network/pathUtil';
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
import { formatMessage } from '@/util/intl';
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
  public async loadFunction(funName: string) {
    const func = await getFunctionByFuncName(funName, false, this.sessionId, this.dbName);
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
  public async getProcedureList() {
    const sid = generateDatabaseSid(this.dbName, this.sessionId);
    const ret = await request.get(`/api/v1/procedure/list/${sid}`);
    runInAction(() => {
      this.procedures = ret?.data || [];
    });
  }

  @action
  public async loadProcedure(procName: string) {
    const func = await getProcedureByProName(procName, false, this.sessionId, this.dbName);
    const idx = this.procedures.findIndex((t) => t.proName === procName);

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
    const { packageBody, packageHead } = data;

    if (!packageHead && !packageBody) {
      throw new Error(
        formatMessage({ id: 'odc.src.store.schema.TheHeaderOfTheObtained' }), //获取包体包头为空
      );
    }
    const idx = this.packages.findIndex((t) => t.packageName === packageName);
    if (idx !== -1) {
      this.packages[idx] = { ...this.packages[idx], packageBody, packageHead };
    }
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
