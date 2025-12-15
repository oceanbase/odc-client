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

import { ConnectType } from '@/d.ts';
import { DBType } from '@/d.ts/database';
import React from 'react';
import { IEnvironment } from '@/d.ts/environment';
import { DatabaseGroup } from '@/d.ts/database';
import { DatabaseSearchType } from '@/d.ts/database';
export interface IFilterParams {
  environmentId: number[];
  connectType: ConnectType[];
  type: DBType[];
}

interface IParamContext {
  searchValue: { value: string; type: DatabaseSearchType };
  setSearchvalue?: (v: string, type: DatabaseSearchType) => void;
  filterParams?: IFilterParams;
  setFilterParams?: (params: IFilterParams) => void;
  reload?: () => void;
  envList?: IEnvironment[];
  groupMode?: DatabaseGroup;
  setGroupMode?: React.Dispatch<React.SetStateAction<DatabaseGroup>>;
  loading?: boolean;
}

const ParamContext: React.Context<IParamContext> = React.createContext({
  searchValue: null,
  sortType: null,
  connectType: [],
});

export default ParamContext;
