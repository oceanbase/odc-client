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
  const promiseResolveRef = useRef<(v: any) => void>();
  const onSuccessRef = useRef<() => Promise<void>>();
  useImperativeHandle(
    ref,
    () => {
      return {
        showExecuteModal: async (sql, tableName, onSuccess, tip?: string) => {
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
      onCancel={() => {
        promiseResolveRef.current?.(false);
        promiseResolveRef.current = null;
        setVisible(false);
      }}
      onSave={async () => {
        const results = await executeSQL(sql, session?.sessionId, session?.database?.dbName);
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
