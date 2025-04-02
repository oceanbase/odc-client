import { IProject } from '@/d.ts/project';
import React from 'react';
import { SearchStatus } from '@/page/Workspace/SideBar/ResourceTree/DatabaseSearchModal/constant';
import { DbObjectType, IConnection } from '@/d.ts';
import { IDatabase, IDatabaseObject } from '@/d.ts/database';

interface IGlobalSearchContext {
  database: IDatabase;
  setDatabase?: React.Dispatch<React.SetStateAction<IDatabase>>;
  project: IProject;
  dataSource: IConnection;
  searchKey?: string;
  setSearchKey?: React.Dispatch<React.SetStateAction<string>>;
  objectlist?: IDatabaseObject;
  back?: () => void;
  next?: (params?: {
    searchStatus?: SearchStatus;
    searchKey?: string;
    database?: IDatabase;
    project?: IProject;
    dataSource?: IConnection;
  }) => void;
  update?: (newStatus: SearchStatus) => void;
  status?: SearchStatus;
  databaseList: IDatabase[];
  projectList: IProject[];
  datasourceList: IConnection[];
  activeKey?: string;
  setActiveKey?: React.Dispatch<React.SetStateAction<string>>;
  objectloading?: boolean;
  loadDatabaseObject?: (value: any) => Promise<void>;
  databaseLoading?: boolean;
  fetchSyncAll?: () => Promise<{
    data?: boolean;
    errCode: string;
    errMsg: string;
  }>;
  syncAllLoading?: boolean;
  actions?: {
    openSql: (e: React.MouseEvent<any>, db: IDatabase) => void;
    applyPermission: (e: React.MouseEvent<any>, db: IDatabase) => void;
    applyTablePermission: (e: React.MouseEvent<any>, object: any, type: DbObjectType) => void;
    applyDbPermission: (e: React.MouseEvent<any>, db: any) => void;
    openTree: (e: React.MouseEvent<any>, db: any) => void;
    positionResourceTree: (parmas: {
      type?: DbObjectType;
      database?: IDatabase;
      name?: string;
      objectName?: string;
    }) => void;
    positionProjectOrDataSource: (params: {
      status: SearchStatus;
      object: IProject | IConnection;
    }) => void;
  };
}

const GlobalSearchContext = React.createContext<IGlobalSearchContext>({
  databaseList: [],
  projectList: [],
  datasourceList: [],
  database: null,
  project: null,
  dataSource: null,
});

export default GlobalSearchContext;
