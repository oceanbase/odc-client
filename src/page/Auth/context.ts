import type { IManagerRole, IManagerUser } from '@/d.ts';
import { IDatasource } from '@/d.ts/datasource';
import { createContext } from 'react';

export const ResourceContext = createContext<{
  roles: IManagerRole[];
  users: IManagerUser[];
  publicConnections: IDatasource[];
  loadRoles: () => void;
  loadUsers: () => void;
  loadConnections: () => void;
}>(null);
