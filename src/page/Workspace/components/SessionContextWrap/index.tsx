import sessionManager from '@/store/sessionManager';
import SessionStore from '@/store/sessionManager/session';
import { useUnmount } from 'ahooks';
import { useEffect, useState } from 'react';
import SessionContext from './context';

interface IProps extends React.PropsWithChildren<any> {
  defaultDatabaseId: number;
  defaultMode: 'project' | 'datasource';
}

export default function SessionContextWrap({
  defaultDatabaseId,
  defaultMode = 'datasource',
  children,
}: IProps) {
  const [session, _setSession] = useState<SessionStore>(null);
  const [databaseId, setDatabaseId] = useState(defaultDatabaseId);
  const [from, setFrom] = useState<'project' | 'datasource'>(defaultMode);

  async function selectSession(databaseId: number, from?: 'project' | 'datasource') {
    if (session) {
      sessionManager.destorySession(session.sessionId);
    }
    if (!databaseId) {
      return;
    }
    const newSession = await sessionManager.createSession(null, databaseId);
    if (newSession) {
      if (from) {
        setFrom(from);
      }
      setDatabaseId(databaseId);
      _setSession(newSession);
    }
  }

  useEffect(() => {
    selectSession(defaultDatabaseId, defaultMode);
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
