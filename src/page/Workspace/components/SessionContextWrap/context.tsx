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

import SessionStore from '@/store/sessionManager/session';
import React from 'react';
import { IDatabase } from '@/d.ts/database';

interface ISessionContext {
  session: SessionStore;
  databaseId?: number;
  datasourceId?: number;
  projectMode?: boolean;
  datasourceMode?: boolean;
  isLogicalDatabase?: boolean;
  from?: 'project' | 'datasource';
  setFrom?: React.Dispatch<React.SetStateAction<'project' | 'datasource'>>;
  selectSession: (
    databaseId: number,
    datasourceId: number,
    from: 'project' | 'datasource',
    database?: IDatabase,
  ) => void;
}

const SessionContext = React.createContext<ISessionContext>({
  session: null,
  selectSession(databaseId, datasourceId, from) {},
});

export default SessionContext;
