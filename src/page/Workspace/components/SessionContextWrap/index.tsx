import sessionManager from '@/store/sessionManager';
import SessionStore from '@/store/sessionManager/session';
import { useUnmount } from 'ahooks';
import { useEffect, useState } from 'react';
import SessionContext from './context';

interface IProps extends React.PropsWithChildren<any> {
  defaultDatabaseId: number;
  defaultDatasourceId?: number;
  datasourceMode?: boolean;
  defaultMode?: 'project' | 'datasource';
}

export default function SessionContextWrap({
  defaultDatabaseId,
  defaultDatasourceId,
  datasourceMode,
  defaultMode = 'datasource',
  children,
}: IProps) {
  const [session, _setSession] = useState<SessionStore>(null);
  const [databaseId, setDatabaseId] = useState(defaultDatabaseId);
  const [datasourceId, setDatasourceId] = useState(defaultDatasourceId);
  const [from, setFrom] = useState<'project' | 'datasource'>(defaultMode);

  async function selectSession(
    databaseId: number,
    datasourceId: number,
    from?: 'project' | 'datasource',
  ) {
    if (session) {
      sessionManager.destorySession(session.sessionId);
    }
    if (!databaseId && !datasourceId) {
      return;
    }
    const newSession = await sessionManager.createSession(datasourceId, databaseId);
    if (newSession) {
      if (from) {
        setFrom(from);
      }
      setDatasourceId(datasourceId);
      setDatabaseId(databaseId);
      _setSession(newSession);
    }
  }

  useEffect(() => {
    selectSession(defaultDatabaseId, defaultDatasourceId, defaultMode);
  }, []);

  useUnmount(() => {
    if (session) {
      sessionManager.destorySession(session.sessionId);
    }
  });

  return (
    <SessionContext.Provider
      value={{
        session,
        selectSession: selectSession,
        databaseId,
        datasourceMode,
        datasourceId,
        from,
      }}
    >
      {typeof children === 'function'
        ? children({
            session,
          })
        : children}
    </SessionContext.Provider>
  );
}
