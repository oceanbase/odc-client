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

import { modifySync } from '@/common/network/ai';
import { getMaterializedView } from '@/common/network/materializedView';
import { getTableColumnList, getTableInfo } from '@/common/network/table';
import { getView } from '@/common/network/view';
import { ConnectionMode, ITableColumn } from '@/d.ts';
import { AIQuestionType } from '@/d.ts/ai';
import { TableColumn } from '@/page/Workspace/components/CreateTable/interface';
import SessionStore from '@/store/sessionManager/session';
import setting from '@/store/setting';
import { getRealNameInDatabase } from '@/util/sql';
import type { IModelOptions } from '@oceanbase-odc/monaco-plugin-ob/dist/type';

function hasConnect(session: SessionStore) {
  return session?.sessionId && session?.database?.dbName;
}
let completionToken: number = 0;

export function getModelService(
  { modelId, delimiter, editor },
  sessionFunc: () => SessionStore,
): IModelOptions {
  return {
    get delimiter() {
      return delimiter();
    },
    llm: {
      async completions(input, cursorPosition) {
        if (
          !setting.enableAIInlineCompletion ||
          !setting.AIEnabled ||
          !input?.trim() ||
          input?.length > 5000
        ) {
          return '';
        }
        const selfToken = ++completionToken;

        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(true);
          }, 1000);
        })
          .then(() => {
            setting.isAIThinking = true;
            if (selfToken !== completionToken) {
              return '';
            }
            return modifySync({
              input,
              fileName: '',
              questionType: AIQuestionType.SQL_COMPLETION,
              model: setting.AIConfig?.defaultLlmModel,
              sid: sessionFunc()?.sessionId,
              fileContent: input,
              databaseId: sessionFunc()?.odcDatabase?.id,
              cursorPosition,
            });
          })
          .then((v) => {
            setting.isAIThinking = false;

            if (v && v.trim() && editor) {
              // 标记有未接受的 AI 补全内容
              setting.hasUnacceptedAICompletion = true;

              // 监听编辑器事件，用于重置状态
              const disposables: Array<{ dispose: () => void } | null> = [];
              let isDisposed = false;

              const resetState = () => {
                if (isDisposed) return;
                isDisposed = true;

                setTimeout(() => {
                  setting.hasUnacceptedAICompletion = false;
                  // 清理所有事件监听器
                  disposables.forEach((d) => {
                    try {
                      d?.dispose?.();
                    } catch (e) {
                      // 忽略清理错误
                    }
                  });
                  disposables.length = 0;
                }, 100);
              };

              try {
                // 监听内容变化（用户接受补全或输入其他内容）
                const contentChangeDisposable = editor.onDidChangeModelContent(() => {
                  resetState();
                });
                if (contentChangeDisposable) {
                  disposables.push(contentChangeDisposable);
                }

                // 监听光标移动（用户可能按 Esc 拒绝或移动到其他位置）
                const cursorChangeDisposable = editor.onDidChangeCursorPosition(() => {
                  resetState();
                });
                if (cursorChangeDisposable) {
                  disposables.push(cursorChangeDisposable);
                }

                // 监听编辑器失焦
                const blurDisposable = editor.onDidBlurEditorWidget(() => {
                  resetState();
                });
                if (blurDisposable) {
                  disposables.push(blurDisposable);
                }
              } catch (e) {
                // 如果注册监听器失败，直接重置状态
                console.error('Failed to register editor listeners:', e);
                isDisposed = true;
                setting.hasUnacceptedAICompletion = false;
              }

              // 10 秒后自动重置（防止状态卡住）
              setTimeout(() => {
                resetState();
              }, 10000);
            }

            return v;
          })
          .catch((e) => {
            setting.isAIThinking = false;
            return '';
          });
      },
    },
    async getTableList(schemaName: string) {
      const dbName = schemaName || sessionFunc()?.database?.dbName;
      if (!hasConnect(sessionFunc())) {
        return;
      }
      /**
       * 保证200ms内返回，不返回就用上一次的值
       */
      await Promise.race([
        new Promise((resolve) => {
          setTimeout(() => {
            resolve([]);
          }, 300);
        }),
        sessionFunc()?.queryIdentities(),
      ]);

      const dbObj =
        sessionFunc()?.allIdentities[dbName] || sessionFunc()?.allIdentities[dbName?.toUpperCase()];
      if (!dbObj) {
        return [];
      }
      return [...dbObj.tables, ...dbObj.views, ...dbObj.external_table, ...dbObj.materialized_view];
    },
    async getTableColumns(tableName: string, dbName?: string) {
      const realTableName = getRealNameInDatabase(
        tableName,
        [ConnectionMode.OB_ORACLE, ConnectionMode.ORACLE].includes(
          sessionFunc()?.connection?.dialectType,
        ),
      );
      dbName = getRealNameInDatabase(
        dbName,
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
      if (/[\u4e00-\u9fa5\w]+/.test(realTableName) && realTableName?.length < 500) {
        await sessionFunc()?.queryIdentities(realTableName);
        let db =
          sessionFunc()?.allIdentities[dbName] ||
          sessionFunc()?.allIdentities[dbName?.toUpperCase()];
        const isTable = db?.tables?.includes(realTableName);
        /**
         * 虚表，需要单独识别处理
         */
        const isVirtualTable = realTableName?.includes('__all_virtual_');
        const isView = db?.views?.includes(realTableName);
        const isExternalTable = db?.external_table?.includes(realTableName);
        const isMaterializedView = db?.materialized_view?.includes(realTableName);
        if (isTable) {
          const columns = await getTableColumnList(realTableName, dbName, sessionFunc()?.sessionId);
          // 表
          return columns?.map((column: TableColumn) => ({
            columnName: column.name,
            columnType: column.type,
          }));
        } else if (isVirtualTable) {
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
        } else if (isView) {
          // 视图
          const view = await getView(realTableName, sessionFunc()?.sessionId, dbName);
          return view?.columns?.map((column: ITableColumn) => ({
            columnName: column.columnName,
            columnType: column.dataType,
          }));
        } else if (isExternalTable) {
          const table = await getTableInfo(realTableName, dbName, sessionFunc()?.sessionId, true);
          return table?.columns?.map((column: TableColumn) => ({
            columnName: column.name,
            columnType: column.type,
          }));
        } else if (isMaterializedView) {
          const mView = await getMaterializedView({
            materializedViewName: realTableName,
            sessionId: sessionFunc()?.sessionId,
            dbName,
          });
          return mView?.columns?.map((column: TableColumn) => ({
            columnName: column.name,
            columnType: column.type,
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
    async getTableDDL(tableName: string, dbName?: string) {
      const realTableName = getRealNameInDatabase(
        tableName,
        [ConnectionMode.OB_ORACLE, ConnectionMode.ORACLE].includes(
          sessionFunc()?.connection?.dialectType,
        ),
      );
      dbName = getRealNameInDatabase(
        dbName,
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
      if (/[\u4e00-\u9fa5\w]+/.test(realTableName) && realTableName?.length < 500) {
        /**
         * schemaStore.queryIdentities(); 不能是阻塞的，编辑器对于函数的超时时间有严格的要求，不能超过 300ms，调用这个接口肯定会超过这个时间。
         */
        await sessionFunc()?.queryIdentities(realTableName);
        const db =
          sessionFunc()?.allIdentities[dbName] ||
          sessionFunc()?.allIdentities[dbName?.toUpperCase()];
        const isTable = db?.tables?.includes(realTableName);
        /**
         * 虚表，需要单独识别处理
         */
        const isVirtualTable = realTableName?.includes('__all_virtual_');
        const isView = db?.views?.includes(realTableName);
        if (isTable) {
          const table = await getTableInfo(realTableName, dbName, sessionFunc()?.sessionId);
          // 表
          return await import('@oceanbase-odc/ob-parser-js').then((module) => {
            const formatted = module.plugins.format({
              sql: table?.info?.DDL,
              type: module.SQLType.OBMySQL,
            });
            return formatted;
          });
        }
        if (isVirtualTable) {
          const table = await getTableInfo(realTableName, 'oceanbase', sessionFunc()?.sessionId);
          // 表
          return await import('@oceanbase-odc/ob-parser-js').then((module) => {
            const formatted = module.plugins.format({
              sql: table?.info?.DDL,
              type: module.SQLType.OBMySQL,
            });
            return formatted;
          });
        }
        if (isView) {
          // 视图
          const view = await getView(realTableName, sessionFunc()?.sessionId, dbName);
          return await import('@oceanbase-odc/ob-parser-js').then((module) => {
            const formatted = module.plugins.format({
              sql: view?.ddl,
              type: module.SQLType.OBMySQL,
            });
            return formatted;
          });
        }
      }
      return '';
    },
  };
}
