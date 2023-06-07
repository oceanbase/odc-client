import SessionStore from '@/store/sessionManager/session';
import React from 'react';

interface ISessionContext {
  session: SessionStore;
  databaseId?: number;
  from?: 'project' | 'datasource';
  selectSession: (databaseId: number, from: 'project' | 'datasource') => void;
}

const SessionContext = React.createContext<ISessionContext>({
  session: null,
  selectSession(databaseId, from) {},
});

export default SessionContext;
