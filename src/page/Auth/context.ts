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
