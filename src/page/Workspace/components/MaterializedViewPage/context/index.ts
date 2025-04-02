import SessionStore from '@/store/sessionManager/session';
import React from 'react';
import { IMaterializedView } from '@/d.ts';
interface IMaterializedViewPageContext {
  materializedView?: Partial<IMaterializedView>;
  session?: SessionStore;
  onRefresh?: () => void;
  pageKey: string;
  showExecuteModal?: (
    sql: any,
    tableName: any,
    onSuccess,
    tip?: string,
    callback?: () => void,
  ) => Promise<boolean>;
}

const MaterializedViewPageContext = React.createContext<IMaterializedViewPageContext>({
  onRefresh: () => {},
  materializedView: null,
  pageKey: undefined,
});

export default MaterializedViewPageContext;
