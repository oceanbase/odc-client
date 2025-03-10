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
import { IProject } from '@/d.ts/project';
import React from 'react';
import { DatabaseGroup } from '@/d.ts/database';
import { ResourceNodeType } from '@/page/Workspace/SideBar/ResourceTree/type';

interface IResourceTreeContext {
  selectProjectId: number;
  setSelectProjectId?: (v: number) => void;
  selectDatasourceId: number;
  setSelectDatasourceId?: (v: number) => void;
  datasourceList: IDatasource[];
  reloadDatasourceList?: () => void;
  projectList: IProject[];
  reloadProjectList?: () => void;
  currentObject?: { value: React.Key; type: ResourceNodeType };
  setCurrentObject?: React.Dispatch<
    React.SetStateAction<{
      value: React.Key;
      type: ResourceNodeType;
    }>
  >;
  shouldExpandedKeys?: React.Key[];
  setShouldExpandedKeys?: React.Dispatch<React.SetStateAction<React.Key[]>>;
  databaseList: IDatabase[];
  reloadDatabaseList?: () => void;
  pollingDatabase?: () => void;
  groupMode?: DatabaseGroup;
  setGroupMode?: React.Dispatch<React.SetStateAction<DatabaseGroup>>;
}

const ResourceTreeContext = React.createContext<IResourceTreeContext>({
  selectProjectId: null,
  selectDatasourceId: null,
  datasourceList: [],
  projectList: [],
  databaseList: [],
});
export default ResourceTreeContext;
