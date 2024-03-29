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
import { ITableModel } from '../../CreateTable/interface';

interface ITablePageContext {
  table: Partial<ITableModel>;
  editMode?: boolean;
  session?: SessionStore;
  onRefresh: () => void;
  showExecuteModal?: (
    sql: any,
    tableName: any,
    onSuccess,
    tip?: string,
    callback?: () => void,
  ) => Promise<boolean>;
}
const TablePageContext = React.createContext<ITablePageContext>({
  table: null,
  onRefresh: () => {},
  editMode: false,
});

export default TablePageContext;
