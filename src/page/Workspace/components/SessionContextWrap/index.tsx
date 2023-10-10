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

import sessionManager from '@/store/sessionManager';
import SessionStore from '@/store/sessionManager/session';
import { useUnmount } from 'ahooks';
import { useEffect, useState } from 'react';
import SessionContext from './context';
import { message } from 'antd';

interface IProps extends React.PropsWithChildren<any> {
  defaultDatabaseId: number;
  defaultDatasourceId?: number;
  datasourceMode?: boolean;
  defaultMode?: 'project' | 'datasource';
  useMaster?: boolean;
  warnIfNotFound?: boolean;
}

export default function SessionContextWrap({
  defaultDatabaseId,
  defaultDatasourceId,
  datasourceMode,
  defaultMode = 'datasource',
  children,
  useMaster,
  warnIfNotFound = true,
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
    const newSession = await sessionManager.createSession(datasourceId, databaseId, useMaster);
    if (newSession === 'NotFound') {
      setDatabaseId(null);
      setDatasourceId(null);
      if (warnIfNotFound) {
        message.warn('DataSource Or Database Not Found');
      }
      return;
    }
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
