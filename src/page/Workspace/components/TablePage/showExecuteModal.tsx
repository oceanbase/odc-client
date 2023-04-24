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
  const promiseResolveRef = useRef<(v: any) => void>();
  const onSuccessRef = useRef<() => Promise<void>>();
  useImperativeHandle(
    ref,
    () => {
      return {
        showExecuteModal: async (sql, tableName, onSuccess) => {
          const promise = new Promise(async (resolve) => {
            setSQL(sql);
            setTableName(tableName);
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
      onCancel={() => {
        promiseResolveRef.current?.(false);
        promiseResolveRef.current = null;
        setVisible(false);
      }}
      onSave={async () => {
        const results = await executeSQL(sql, session?.sessionId, session?.database?.dbName);
        const result = results?.find((result) => result.track);
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
