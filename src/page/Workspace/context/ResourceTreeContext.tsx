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

import { IDatasource } from '@/d.ts/datasource';
import { IProject } from '@/d.ts/project';
import React from 'react';

export enum ResourceTreeTab {
  datasource = 'datasource',
  project = 'project',
}
interface IResourceTreeContext {
  selectTabKey: ResourceTreeTab;
  setSelectTabKey?: (v: ResourceTreeTab) => void;
  selectProjectId: number;
  setSelectProjectId?: (v: number) => void;
  selectDatasourceId: number;
  setSelectDatasourceId?: (v: number) => void;
  datasourceList: IDatasource[];
  reloadDatasourceList?: () => void;
  projectList: IProject[];
  reloadProjectList?: () => void;
}

const ResourceTreeContext = React.createContext<IResourceTreeContext>({
  selectTabKey: ResourceTreeTab.datasource,
  selectProjectId: null,
  selectDatasourceId: null,
  datasourceList: [],
  projectList: [],
});
export default ResourceTreeContext;
