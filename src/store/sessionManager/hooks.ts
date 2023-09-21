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

import { IDatabase } from '@/d.ts/database';
import { IDatasource } from '@/d.ts/datasource';
import { useUnmount, useUnmountedRef } from 'ahooks';
import { useEffect, useState } from 'react';
import sessionManager from '.';
import SessionStore from './session';

/**
 * 根据 databaseid 创建一个session
 * @param databaseId datbaseid
 * @returns [session对象，odc数据库对象，是否正在创建, 重新创建session]
 */
export function useDBSession(
  databaseId: number,
): {
  session: SessionStore;
  database: IDatabase;
  loading: boolean;
  reset: () => void;
} {
  const [session, setSession] = useState<SessionStore>(null);
  const [loading, setLoading] = useState(true);
  const unmountedRef = useUnmountedRef();
  /**
   * 创建新的 session 并且销毁老的 session
   * @param databaseId
   * @param oldSession
   * @returns
   */
  async function newSession(databaseId: number, oldSession: SessionStore) {
    if (oldSession) {
      sessionManager.destorySession(oldSession?.sessionId);
    }
    if (!databaseId) {
      oldSession && setSession(null);
      return;
    }
    setLoading(true);
    try {
      const session = await sessionManager.createSession(null, databaseId);
      if (session === 'NotFound') {
        return;
      }
      if (unmountedRef.current && session) {
        sessionManager.destorySession(session?.sessionId);
        return;
      }
      if (session && session?.odcDatabase?.id == databaseId) {
        setSession(session);
      }
    } catch (e) {
      console.error('create session fail', e);
    } finally {
      setLoading(false);
    }
  }
  /**
   * 根据dbid切换session
   */
  useEffect(() => {
    newSession(databaseId, session);
  }, [databaseId]);

  useUnmount(() => {
    if (session) {
      sessionManager.destorySession(session?.sessionId);
    }
  });
  function reset() {
    newSession(databaseId, session);
  }
  return {
    session,
    database: session?.odcDatabase,
    loading,
    reset,
  };
}

/**
 * 根据数据源来创建一个 session，该方法创建出来的 session 无法访问 db 信息，只能做租户级别的操作
 * @param datasourceId
 * @returns
 */
export function useDatasourceSession(
  datasourceId: number,
): {
  session: SessionStore;
  datasource: IDatasource;
  loading: boolean;
  reset: () => void;
} {
  const [session, setSession] = useState<SessionStore>(null);
  const [loading, setLoading] = useState(false);
  const unmountedRef = useUnmountedRef();
  /**
   * 创建新的 session 并且销毁老的 session
   * @param datasourceId
   * @param oldSession
   * @returns
   */
  async function newSession(datasourceId: number, oldSession: SessionStore) {
    if (oldSession) {
      sessionManager.destorySession(oldSession?.sessionId);
    }
    if (!datasourceId) {
      oldSession && setSession(null);
      return;
    }
    setLoading(true);
    try {
      const session = await sessionManager.createSession(datasourceId, null);
      if (session === 'NotFound') {
        return;
      }
      if (unmountedRef.current && session) {
        sessionManager.destorySession(session?.sessionId);
        return;
      }
      if (session?.connection?.id == datasourceId) {
        setSession(session);
      }
    } catch (e) {
      console.error('create session fail', e);
    } finally {
      setLoading(false);
    }
  }
  /**
   * 根据dbid切换session
   */
  useEffect(() => {
    newSession(datasourceId, session);
  }, [datasourceId]);

  useUnmount(() => {
    if (session) {
      sessionManager.destorySession(session?.sessionId);
    }
  });
  function reset() {
    newSession(datasourceId, session);
  }
  return {
    session,
    datasource: session?.connection,
    loading,
    reset,
  };
}
