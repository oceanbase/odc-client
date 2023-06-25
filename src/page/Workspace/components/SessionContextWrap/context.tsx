import SessionStore from '@/store/sessionManager/session';
import React from 'react';

interface ISessionContext {
  session: SessionStore;
  databaseId?: number;
  datasourceId?: number;
  datasourceMode?: boolean;
  from?: 'project' | 'datasource';
  selectSession: (databaseId: number, datasourceId: number, from: 'project' | 'datasource') => void;
}

const SessionContext = React.createContext<ISessionContext>({
  session: null,
  selectSession(databaseId, datasourceId, from) {},
});

export default SessionContext;
