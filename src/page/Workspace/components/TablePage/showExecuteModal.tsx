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

import { runSQLLint } from '@/common/network/sql';
import executeSQL from '@/common/network/sql/executeSQL';
import ExecuteSQLModal from '@/component/ExecuteSQLModal';
import { ISQLLintReuslt } from '@/component/SQLLintResult/type';
import { EStatus } from '@/d.ts';
import modal from '@/store/modal';
import page from '@/store/page';
import SessionStore from '@/store/sessionManager/session';
import notification from '@/util/notification';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

export default forwardRef<any, { session: SessionStore }>(function TableExecuteModal(
  { session },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const [sql, setSQL] = useState('');
  const [tableName, setTableName] = useState('');
  const [tip, setTip] = useState<string>(null);
  const [status, setStatus] = useState<EStatus>(null);
  const [lintResultSet, setLintResultSet] = useState<ISQLLintReuslt[]>([]);
  const promiseResolveRef = useRef<(v: any) => void>();
  const onSuccessRef = useRef<() => Promise<void>>();
  useImperativeHandle(
    ref,
    () => {
      return {
        showExecuteModal: async (sql, tableName, onSuccess, tip?: string) => {
          const promise = new Promise(async (resolve) => {
            const lintResultSet = await runSQLLint(session?.sessionId, ';', sql);
            setLintResultSet(lintResultSet);
            modal.updateCreateAsyncTaskModal({ activePageKey: page.activePageKey });
            if (Array.isArray(lintResultSet) && lintResultSet?.length) {
              const violations = lintResultSet.reduce((pre, cur) => {
                if (cur?.violations?.length === 0) {
                  return pre;
                }
                return pre.concat(...cur?.violations);
              }, []);
              if (violations?.some((violation) => violation?.level === 2)) {
                setStatus(EStatus.DISABLED);
              } else if (violations?.every((violation) => violation?.level === 1)) {
                setStatus(EStatus.SUBMIT);
              } else {
                setStatus(EStatus.APPROVAL);
              }
            } else {
              setStatus(EStatus.DISABLED);
            }
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
      }}
      onSave={async () => {
        const results = await executeSQL(sql, session?.sessionId, session?.database?.dbName, false);
        if (!results) {
          return;
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
});
