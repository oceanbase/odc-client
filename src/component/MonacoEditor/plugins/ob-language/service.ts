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

import { getTableColumnList } from '@/common/network/table';
import { getView } from '@/common/network/view';
import { ConnectionMode, ITableColumn } from '@/d.ts';
import { TableColumn } from '@/page/Workspace/components/CreateTable/interface';
import SessionStore from '@/store/sessionManager/session';
import { getRealNameInDatabase } from '@/util/sql';
import type { IModelOptions } from '@oceanbase-odc/monaco-plugin-ob/dist/type';

function hasConnect(session: SessionStore) {
  return session?.sessionId && session?.database?.dbName;
}

export function getModelService(
  { modelId, delimiter },
  sessionFunc: () => SessionStore,
): IModelOptions {
  return {
    delimiter,
    async getTableList(schemaName: string) {
      const dbName = schemaName || sessionFunc()?.database?.dbName;
      if (!hasConnect(sessionFunc())) {
        return;
      }
      const db =
        sessionFunc()?.allIdentities[dbName] || sessionFunc()?.allIdentities[dbName?.toUpperCase()];
      if (db?.tables?.length || db?.views?.length) {
        sessionFunc()?.queryIdentities();
      } else {
        await sessionFunc()?.queryIdentities();
      }
      const dbObj =
        sessionFunc()?.allIdentities[dbName] || sessionFunc()?.allIdentities[dbName?.toUpperCase()];
      if (!dbObj) {
        return [];
      }
      return [...dbObj.tables, ...dbObj.views];
    },
    async getTableColumns(tableName: string, dbName?: string) {
      const realTableName = getRealNameInDatabase(
        tableName,
        [ConnectionMode.OB_ORACLE, ConnectionMode.ORACLE].includes(
          sessionFunc()?.connection?.dialectType,
        ),
      );
      if (!hasConnect(sessionFunc())) {
        return;
      }
      if (!dbName) {
        dbName = sessionFunc()?.database?.dbName;
      }
      if (/[\w]+/.test(realTableName) && realTableName?.length < 500) {
        const db =
          sessionFunc()?.allIdentities[dbName] ||
          sessionFunc()?.allIdentities[dbName?.toUpperCase()];
        /**
         * schemaStore.queryIdentities(); 不能是阻塞的，编辑器对于函数的超时时间有严格的要求，不能超过 300ms，调用这个接口肯定会超过这个时间。
         */
        if (db?.tables?.length || db?.views?.length) {
          sessionFunc()?.queryIdentities();
        } else {
          await sessionFunc()?.queryIdentities();
        }
        const isTable = db?.tables?.includes(realTableName);
        /**
         * 虚表，需要单独识别处理
         */
        const isVirtualTable = realTableName?.includes('__all_virtual_');
        const isView = db?.views?.includes(realTableName);
        if (isTable) {
          const columns = await getTableColumnList(realTableName, dbName, sessionFunc()?.sessionId);
          // 表
          return columns?.map((column: TableColumn) => ({
            columnName: column.name,
            columnType: column.type,
          }));
        }
        if (isVirtualTable) {
          const columns = await getTableColumnList(
            realTableName,
            'oceanbase',
            sessionFunc()?.sessionId,
          );
          // 表
          return columns?.map((column: TableColumn) => ({
            columnName: column.name,
            columnType: column.type,
          }));
        }
        if (isView) {
          // 视图
          const view = await getView(realTableName, sessionFunc()?.sessionId, dbName);
          return view?.columns?.map((column: ITableColumn) => ({
            columnName: column.columnName,
            columnType: column.dataType,
          }));
        }
      }
      return [];
    },
    async getSchemaList() {
      if (!Object.keys(sessionFunc()?.allIdentities).length) {
        sessionFunc()?.queryIdentities();
      }
      return Object.keys(sessionFunc()?.allIdentities);
    },
    async getFunctions() {
      if (!sessionFunc()?.database.functions) {
        await sessionFunc()?.database.getFunctionList();
      }
      return sessionFunc()?.database.functions.map((func) => ({
        name: func.funName,
        desc: func.status,
      }));
    },
    async getSnippets() {
      const session = sessionFunc();
      if (session) {
        return session.snippets.map((item) => {
          return {
            label: item.prefix || '',
            documentation: item.description || '',
            insertText: item.body || '',
          };
        });
      }
    },
  };
}
