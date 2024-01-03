/*
 * Copyright 2024 OceanBase
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

import executeSQL from '@/common/network/sql/executeSQL';
import ExecuteSQLModal from '@/component/ExecuteSQLModal';
import { ISQLLintReuslt } from '@/component/SQLLintResult/type';
import { EStatus } from '@/d.ts';
import modal from '@/store/modal';
import sessionManager from '@/store/sessionManager';
import SessionStore from '@/store/sessionManager/session';
import notification from '@/util/notification';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

export default forwardRef<any, { session: SessionStore; callbackRef: React.MutableRefObject<any> }>(
  function TableExecuteModal({ session, callbackRef }, ref) {
    const [visible, setVisible] = useState(false);
    const [sql, setSQL] = useState('');
    const [tableName, setTableName] = useState('');
    const [tip, setTip] = useState<string>(null);
    const [status, setStatus] = useState<EStatus>(null);
    const [lintResultSet, setLintResultSet] = useState<ISQLLintReuslt[]>([]);
    const [hasExecuted, setHasExecuted] = useState<boolean>(false);
    const promiseResolveRef = useRef<(v: any) => void>();
    const onSuccessRef = useRef<() => Promise<void>>();
    useImperativeHandle(
      ref,
      () => {
        return {
          showExecuteModal: async (
            sql,
            tableName,
            onSuccess,
            tip?: string,
            callback?: () => void,
          ) => {
            const promise = new Promise(async (resolve) => {
              setSQL(sql);
              setTableName(tableName);
              setTip(tip);
              promiseResolveRef.current = resolve;
              onSuccessRef.current = onSuccess;
              setVisible(true);
            });
            return promise;
          },
        };
      },
      [],
    );
    return (
      <ExecuteSQLModal
        sessionStore={session}
        visible={visible}
        readonly
        sql={sql}
        tip={tip}
        status={status}
        lintResultSet={lintResultSet}
        onCancel={() => {
          promiseResolveRef.current?.(false);
          promiseResolveRef.current = null;
          setVisible(false);
          setHasExecuted(false);
          setLintResultSet(null);
          setStatus(null);
        }}
        callback={() => {
          promiseResolveRef.current?.(false);
          promiseResolveRef.current = null;
          setVisible(false);
          setHasExecuted(false);
          setLintResultSet(null);
          setStatus(null);
          callbackRef?.current?.();
        }}
        onSave={async () => {
          const results = await executeSQL(
            sql,
            session?.sessionId,
            session?.database?.dbName,
            false,
          );
          if (!results) {
            return;
          }
          if (!hasExecuted) {
            /**
             * status为submit时，即SQL内容没有被拦截，继续执行后续代码，完成相关交互
             * status为其他情况时，中断操作
             */
            if (results?.status !== EStatus.SUBMIT) {
              setLintResultSet(results?.lintResultSet);
              setStatus(results?.status);
              setHasExecuted(true);
              return;
            }
          } else {
            setLintResultSet(null);
            setStatus(null);
            setHasExecuted(false);
            if (results?.status === EStatus.APPROVAL) {
              modal.changeCreateAsyncTaskModal(true, {
                sql: sql,
                databaseId: sessionManager.sessionMap.get(this.getSession()?.sessionId).odcDatabase
                  ?.id,
                rules: lintResultSet,
              });
            }
          }
          if (results?.invalid) {
            promiseResolveRef.current?.(false);
            promiseResolveRef.current = null;
            setVisible(false);
            return;
          }
          const result = results?.executeResult?.find((result) => result.track);
          if (!result?.track) {
            promiseResolveRef?.current?.(true);
            promiseResolveRef.current = null;
            await onSuccessRef.current?.();
            setVisible(false);
          } else {
            notification.error(result);
          }
          return !result.track;
        }}
      />
    );
  },
);
