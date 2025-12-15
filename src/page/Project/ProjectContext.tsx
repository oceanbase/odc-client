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

import { IProject } from '@/d.ts/project';
import React, { Dispatch, SetStateAction } from 'react';

interface IProjectContext {
  project: IProject | null;
  projectId: number;
  reloadProject: () => void;
  hasLoginDatabaseAuth: boolean;
  setHasLoginDatabaseAuth: Dispatch<SetStateAction<boolean>>;
  loading?: boolean;
}

const ProjectContext = React.createContext<IProjectContext>({
  project: null,
  projectId: null,
  reloadProject: () => {},
  hasLoginDatabaseAuth: false,
  setHasLoginDatabaseAuth: () => {},
  loading: false,
});

export default ProjectContext;
