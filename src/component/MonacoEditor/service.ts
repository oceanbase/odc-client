import { getTableInfo } from '@/common/network/table';
import { ConnectionMode, ITableColumn } from '@/d.ts';
import { TableColumn } from '@/page/Workspace/components/CreateTable/interface';
import connection from '@/store/connection';
import schema from '@/store/schema';
import { getRealNameInDatabase } from '@/util/sql';
import type { IModelOptions } from '@alipay/monaco-plugin-ob/dist/type';

function hasConnect() {
  return connection.sessionId && schema.database?.name;
}

export function getModelService({ modelId, delimiter }): IModelOptions {
  return {
    delimiter,
    async getTableList(schemaName: string) {
      const dbName = schemaName || schema.database?.name;
      if (!hasConnect()) {
        return;
      }
      await schema.queryIdentities();
      const dbObj = schema.allIdentities[dbName] || schema.allIdentities[dbName?.toUpperCase()];
      if (!dbObj) {
        return [];
      }
      return [...dbObj.tables, ...dbObj.views];
    },
    async getTableColumns(tableName: string, dbName?: string) {
      const realTableName = getRealNameInDatabase(
        tableName,
        connection.connection?.dialectType === ConnectionMode.OB_ORACLE,
      );
      if (!hasConnect()) {
        return;
      }
      if (!dbName) {
        dbName = schema.database?.name;
      }
      if (/[\w]+/.test(realTableName) && realTableName?.length < 500) {
        const db = schema.allIdentities[dbName] || schema.allIdentities[dbName?.toUpperCase()];
        /**
         * schemaStore.queryIdentities(); 不能是阻塞的，编辑器对于函数的超时时间有严格的要求，不能超过 300ms，调用这个接口肯定会超过这个时间。
         */
        await schema.queryIdentities();
        const isTable = db?.tables?.includes(realTableName);
        const isView = db?.views?.includes(realTableName);
        if (isTable) {
          const tableInfo = await getTableInfo(realTableName, dbName);
          // 表
          return tableInfo?.columns?.map((column: TableColumn) => ({
            columnName: column.name,
            columnType: column.type,
          }));
        }
        if (isView) {
          // 视图
          const view = await schema.getView(realTableName, dbName);
          return view?.columns?.map((column: ITableColumn) => ({
            columnName: column.columnName,
            columnType: column.dataType,
          }));
        }
      }
      return [];
    },
    async getSchemaList() {
      return schema.databases?.map((t) => t.name);
    },
    async getFunctions() {
      if (!schema.functions) {
        await schema.getFunctionList();
      }
      return schema.functions.map((func) => ({
        name: func.funName,
        desc: func.status,
      }));
    },
  };
}
