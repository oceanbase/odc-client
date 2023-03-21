import { formatMessage } from '@/util/intl';
/**
 * 实现 ob-editor 自定义查询接口，用于代码补全
 */
import type { ITableColumn } from '@/d.ts';
import { ConnectionMode } from '@/d.ts';
import connection from '@/store/connection';
import schemaStore from '@/store/schema';
import { getRealTableName } from '@/util/sql';
import type { ISQLColumn, ISQLProject, ISQLService, ISQLTable } from '@alipay/ob-editor';
import { SQL_OBJECT_TYPE } from '@alipay/ob-editor';
import { message } from 'antd';
import { isNil } from 'lodash';

class SQLService implements ISQLService {
  private delimiter: string = ';';
  private isSingle: boolean = false;
  // 是否已建立有效连接
  public hasConnect() {
    return connection.sessionId && schemaStore.database?.name;
  }

  public setConfig(config: { delimiter?: string; isSingle?: boolean }) {
    this.delimiter = config.delimiter || this.delimiter;
    this.isSingle = isNil(config.isSingle) ? this.isSingle : config.isSingle;
  }
  public getUserOptions() {
    return {
      formatOptions: {
        delimiter: this.delimiter,
        isSingle: this.isSingle,
      },
    };
  }
  /**
   * queryProjects
   */
  public async queryProjects(): Promise<ISQLProject[]> {
    return [schemaStore.database].map((item) => ({
      name: item.name || '',
      description: item.name || '',
    }));
  }

  /**
   * queryTables
   */
  public async queryTables(project: ISQLProject): Promise<ISQLTable[]> {
    const dbName = project?.name || schemaStore.database?.name;
    if (!this.hasConnect()) {
      return;
    }
    await schemaStore.queryIdentities();
    const dbObj =
      schemaStore.allIdentities[dbName] || schemaStore.allIdentities[dbName?.toUpperCase()];
    const tables = dbObj.tables.map((tableName) => {
      return {
        name: tableName || '',
        description: dbName || '',
      };
    });
    // 也需要展示视图
    const views = dbObj.views.map((viewName) => {
      return {
        name: viewName || '',
        description: dbName || '',
      };
    });
    return [...tables, ...views];
  }

  /**
   * queryColumns
   */
  public async queryColumns(table: ISQLTable): Promise<ISQLColumn[]> {
    const dbNameAndTableName =
      getRealTableName(
        table.name,
        connection.connection?.dialectType === ConnectionMode.OB_ORACLE,
      ).split('.') || [];
    let realTableName;
    let dbName;
    if (!this.hasConnect()) {
      return;
    }
    if (dbNameAndTableName?.length > 1) {
      dbName = dbNameAndTableName[0];
      realTableName = dbNameAndTableName[1];
    } else {
      dbName = schemaStore.database?.name;
      realTableName = dbNameAndTableName[0];
    }
    if (/[\w]+/.test(realTableName) && realTableName?.length < 500) {
      const db =
        schemaStore.allIdentities[dbName] || schemaStore.allIdentities[dbName?.toUpperCase()];
      const isTable = db?.tables?.includes(realTableName) || true;
      const isView = db?.views?.includes(realTableName);
      if (isTable) {
        const columns = await schemaStore.getTableColumnList(realTableName, true, dbName);
        /**
         * schemaStore.queryIdentities(); 不能是阻塞的，编辑器对于函数的超时时间有严格的要求，不能大雨 300ms，调用这个接口肯定会超过这个时间。
         */
        schemaStore.queryIdentities();
        // 表
        return columns?.map((column: ITableColumn) => ({
          name: column.columnName,
          description: column.comment || column.columnName,
          dataType: column.dataType,
        }));
      }
      if (isView) {
        // 视图
        const view = await schemaStore.getView(realTableName, dbName);
        schemaStore.queryIdentities();
        return view?.columns?.map((column: ITableColumn) => ({
          name: column.columnName,
          description: column.comment || column.columnName,
          dataType: column.dataType,
        }));
      }
    }
    return [];
  }
  /**
   * go to definition 调用
   */
  public async queryTableOrView(table: ISQLTable): Promise<{
    objType: SQL_OBJECT_TYPE.TABLE | SQL_OBJECT_TYPE.VIEW;
    columns: ISQLColumn[];
  } | null> {
    const dbNameAndTableName =
      getRealTableName(
        table.name,
        connection.connection?.dialectType === ConnectionMode.OB_ORACLE,
      ).split('.') || [];
    let realTableName;
    let dbName;
    if (!this.hasConnect()) {
      return;
    }
    if (dbNameAndTableName?.length > 1) {
      dbName = dbNameAndTableName[0];
      realTableName = dbNameAndTableName[1];
    } else {
      dbName = schemaStore.database?.name;
      realTableName = dbNameAndTableName[0];
    }
    if (dbName !== schemaStore.database?.name) {
      message.warn(
        formatMessage({
          id: 'odc.component.SQLCodeEditor.service.CurrentlyCrossDatabaseRedirectionIs',
        }), // `当前版本暂不支持跨库跳转`
      );
      return null;
    }
    if (/[\w]+/.test(realTableName) && realTableName?.length < 500) {
      const db =
        schemaStore.allIdentities[dbName] || schemaStore.allIdentities[dbName?.toUpperCase()];
      const isTable = db?.tables?.includes(realTableName);
      const isView = db?.views?.includes(realTableName);
      if (isTable) {
        const columns = await schemaStore.getTableColumnList(realTableName, true);
        schemaStore.queryIdentities();
        // 表
        if (columns?.length) {
          return {
            objType: SQL_OBJECT_TYPE.TABLE,
            columns: columns.map((column: ITableColumn) => ({
              name: column.columnName,
              description: column.comment || column.columnName,
              dataType: column.dataType,
            })),
          };
        }
      } else if (isView) {
        // 视图
        const view = await schemaStore.getView(realTableName);
        schemaStore.queryIdentities();
        return {
          objType: SQL_OBJECT_TYPE.VIEW,
          columns: view.columns.map((column: ITableColumn) => ({
            name: column.columnName,
            description: column.comment || column.columnName,
            dataType: column.dataType,
          })),
        };
      }
    }
    return null;
  }
  public async queryFunctions() {
    if (!this.hasConnect()) {
      return;
    }
    if (!schemaStore.functions?.length) {
      await schemaStore.refreshFunctionList(true);
    }
    return schemaStore.functions?.map((func) => {
      return {
        name: func.funName,
        desc: '',
        params: func.params?.map((param) => {
          return {
            name: param.paramName,
            description: '',
            dataType: param.dataType,
          };
        }),
      };
    });
  }
}

export default SQLService;
