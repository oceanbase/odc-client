/*
 * Copyright 2024 OceanBase
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

import type { IManagerRole, IManagerUser, IResourceRole } from '@/d.ts';
import { IDatasource } from '@/d.ts/datasource';
import { IProject } from '@/d.ts/project';
import { createContext } from 'react';

export const ResourceContext = createContext<{
  roles: IManagerRole[];
  users: IManagerUser[];
  resource: IDatasource[];
  projectRoles: IResourceRole[];
  projects: IProject[];
  loadRoles: () => void;
  loadUsers: () => void;
  loadConnections: () => void;
  loadProjectRoles: () => void;
  loadProjects: () => void;
}>(null);
